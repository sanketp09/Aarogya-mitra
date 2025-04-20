import React, { useState, useEffect } from 'react';
import { Pill, Plus, Check, Clock, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { useToast } from './ui/use-toast';

interface Medication {
  _id?: string;
  name: string;
  dosage: string;
  frequency: string;
  time: string;
  taken: boolean;
}

const MedicationTracker: React.FC = () => {
  const { toast } = useToast();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [newMedication, setNewMedication] = useState<Omit<Medication, '_id' | 'taken'>>({
    name: '',
    dosage: '',
    frequency: 'Daily',
    time: '',
  });

  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetchMedications();
  }, []);

  const fetchMedications = async () => {
    try {
      setLoading(true);
      console.log('Fetching medications from server...');
      const response = await fetch('http://localhost:5000/api/medications');
      
      if (!response.ok) {
        throw new Error('Failed to fetch medications');
      }
      
      const data = await response.json();
      console.log('Received medications:', data);
      setMedications(data);
    } catch (error) {
      console.error('Error fetching medications:', error);
      toast({
        title: "Error",
        description: "Failed to fetch medications. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newMedication.name || !newMedication.time) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    try {
      console.log('Sending medication data:', newMedication);
      const response = await fetch('http://localhost:5000/api/medications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newMedication,
          taken: false,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add medication');
      }

      const savedMedication = await response.json();
      console.log('Saved medication:', savedMedication);
      
      setMedications(prev => [savedMedication, ...prev]);
      setNewMedication({
        name: '',
        dosage: '',
        frequency: 'Daily',
        time: '',
      });
      setOpen(false);

      toast({
        title: 'Medication Added',
        description: `${newMedication.name} has been added to your list.`,
      });
    } catch (error) {
      console.error('Error adding medication:', error);
      toast({
        title: "Error",
        description: "Failed to add medication. Please try again later.",
        variant: "destructive",
      });
    }
  };

  const handleTaken = async (id: string) => {
    try {
      const med = medications.find((m) => m._id === id);
      if (!med) return;
      
      const updatedTaken = !med.taken;
      
      const response = await fetch(`http://localhost:5000/api/medications/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...med,
          taken: updatedTaken,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update medication');
      }

      const updatedMedication = await response.json();
      
      setMedications(
        medications.map((med) =>
          med._id === id ? updatedMedication : med
        )
      );

      toast({
        title: updatedTaken ? 'Medication Taken' : 'Medication Unmarked',
        description: `${med.name} has been ${
          updatedTaken ? 'marked as taken' : 'unmarked'
        }.`,
      });
    } catch (error) {
      console.error('Error updating medication:', error);
      toast({
        title: "Error",
        description: "Failed to update medication status. Please try again later.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const med = medications.find((m) => m._id === id);
      if (!med) return;
      
      const response = await fetch(`http://localhost:5000/api/medications/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete medication');
      }
      
      setMedications(medications.filter((med) => med._id !== id));
      
      toast({
        title: 'Medication Removed',
        description: `${med.name} has been removed from your list.`,
      });
    } catch (error) {
      console.error('Error deleting medication:', error);
      toast({
        title: "Error",
        description: "Failed to delete medication. Please try again later.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in mt-4 md:ml-64">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Medication Tracker</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-care-primary hover:bg-care-secondary">
              <Plus className="mr-2 h-4 w-4" /> Add Medication
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Medication</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Medication Name</Label>
                <Input
                  id="name"
                  value={newMedication.name}
                  onChange={(e) =>
                    setNewMedication({ ...newMedication, name: e.target.value })
                  }
                  placeholder="Enter medication name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dosage">Dosage</Label>
                <Input
                  id="dosage"
                  value={newMedication.dosage}
                  onChange={(e) =>
                    setNewMedication({ ...newMedication, dosage: e.target.value })
                  }
                  placeholder="e.g., 500mg"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="frequency">Frequency</Label>
                <Select
                  value={newMedication.frequency}
                  onValueChange={(value) =>
                    setNewMedication({ ...newMedication, frequency: value })
                  }
                >
                  <SelectTrigger id="frequency">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Daily">Daily</SelectItem>
                    <SelectItem value="Twice Daily">Twice Daily</SelectItem>
                    <SelectItem value="Weekly">Weekly</SelectItem>
                    <SelectItem value="As Needed">As Needed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={newMedication.time}
                  onChange={(e) =>
                    setNewMedication({ ...newMedication, time: e.target.value })
                  }
                />
              </div>
            </div>
            <Button onClick={handleAdd} className="bg-care-primary hover:bg-care-secondary">
              Add Medication
            </Button>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {loading ? (
          <div className="text-center p-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">Loading medications...</p>
          </div>
        ) : medications.length === 0 ? (
          <div className="text-center p-8 bg-gray-50 rounded-lg">
            <Pill className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-xl font-medium text-gray-600 mb-2">
              No medications added yet
            </h3>
            <p className="text-gray-500">
              Add your medications to keep track of them
            </p>
          </div>
        ) : (
          medications.map((med) => (
            <div
              key={med._id}
              className={`bg-white rounded-lg p-4 shadow border-l-4 ${
                med.taken ? 'border-green-500' : 'border-care-primary'
              } flex justify-between items-center`}
            >
              <div className="flex items-center space-x-4">
                <div
                  className={`p-2 rounded-full ${
                    med.taken ? 'bg-green-100' : 'bg-care-light'
                  }`}
                >
                  {med.taken ? (
                    <Check className="h-6 w-6 text-green-500" />
                  ) : (
                    <Pill className="h-6 w-6 text-care-primary" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{med.name}</h3>
                  <div className="text-gray-600 text-sm md:text-base">
                    {med.dosage} • {med.frequency}
                  </div>
                  <div className="flex items-center text-gray-500 text-sm md:text-base">
                    <Clock className="h-3 w-3 mr-1" /> {med.time}
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleTaken(med._id!)}
                  className={med.taken ? 'text-green-500' : 'text-care-primary'}
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleDelete(med._id!)}
                  className="text-gray-500"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MedicationTracker;