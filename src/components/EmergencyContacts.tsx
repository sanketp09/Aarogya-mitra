import React, { useState, useEffect } from "react";
import { Phone, Plus, Trash2, Heart } from "lucide-react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useToast } from "./ui/use-toast";

interface Contact {
  id: string;
  name: string;
  relation: string;
  phone: string;
}

// This should be your server URL where your Express app is running
const SERVER_URL = "http://localhost:5000";

const EmergencyContacts: React.FC = () => {
  const { toast } = useToast();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  const [newContact, setNewContact] = useState<Omit<Contact, "id">>({
    name: "",
    relation: "",
    phone: "",
  });

  const [open, setOpen] = useState(false);

  // Fetch contacts from server when component mounts
  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const response = await fetch(`${SERVER_URL}/api/emergency-contacts`);
      const data = await response.json();

      // Transform database objects to match our Contact interface
      const formattedContacts = data.map((contact: any) => ({
        id: contact._id,
        name: contact.name,
        relation: contact.relation || "",
        phone: contact.phone,
      }));

      setContacts(formattedContacts);
    } catch (error) {
      console.error("Error fetching contacts:", error);
      toast({
        title: "Error",
        description: "Failed to load contacts from server",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newContact.name || !newContact.phone) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Save contact to database
      const response = await fetch(`${SERVER_URL}/api/emergency-contacts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newContact),
      });

      const savedContact = await response.json();

      // Add the new contact to our state
      setContacts([
        ...contacts,
        {
          id: savedContact._id,
          name: savedContact.name,
          relation: savedContact.relation || "",
          phone: savedContact.phone,
        },
      ]);

      setNewContact({
        name: "",
        relation: "",
        phone: "",
      });
      setOpen(false);

      toast({
        title: "Contact Added",
        description: `${newContact.name} has been added to your emergency contacts.`,
      });
    } catch (error) {
      console.error("Error adding contact:", error);
      toast({
        title: "Error",
        description: "Failed to save contact to server",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    const contact = contacts.find((c) => c.id === id);

    try {
      // Delete from database
      await fetch(`${SERVER_URL}/api/emergency-contacts/${id}`, {
        method: "DELETE",
      });

      // Update local state
      setContacts(contacts.filter((contact) => contact.id !== id));

      if (contact) {
        toast({
          title: "Contact Removed",
          description: `${contact.name} has been removed from your contacts.`,
        });
      }
    } catch (error) {
      console.error("Error deleting contact:", error);
      toast({
        title: "Error",
        description: "Failed to delete contact from server",
        variant: "destructive",
      });
    }
  };

  // Updated handleCall function to initiate actual phone calls
  const handleCall = (contact: Contact) => {
    // Format the phone number - remove spaces, dashes, parentheses
    const formattedNumber = contact.phone.replace(/[\s-()]/g, "");
    
    // Create the tel: URL
    const phoneUrl = `tel:${formattedNumber}`;
    
    // Show toast notification
    toast({
      title: `Calling ${contact.name}`,
      description: `Dialing ${contact.phone}...`,
    });
    
    // Initiate the call
    window.location.href = phoneUrl;
  };

  // Function to handle emergency call to 112
  const handleEmergencyCall = () => {
    toast({
      title: "Emergency Call",
      description: "Calling emergency services (112)...",
      variant: "destructive",
    });
    
    // Initiate the emergency call
    window.location.href = "tel:112";
  };

  return (
    <div className="space-y-6 animate-fade-in mt-4 md:ml-64">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Emergency Contacts</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-care-primary hover:bg-care-secondary">
              <Plus className="mr-2 h-4 w-4" /> Add Contact
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add Emergency Contact</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={newContact.name}
                  onChange={(e) =>
                    setNewContact({ ...newContact, name: e.target.value })
                  }
                  placeholder="Contact name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="relation">Relationship</Label>
                <Input
                  id="relation"
                  value={newContact.relation}
                  onChange={(e) =>
                    setNewContact({
                      ...newContact,
                      relation: e.target.value,
                    })
                  }
                  placeholder="Ex: Son, Daughter, Doctor"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={newContact.phone}
                  onChange={(e) =>
                    setNewContact({ ...newContact, phone: e.target.value })
                  }
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>
            <Button
              onClick={handleAdd}
              className="bg-care-primary hover:bg-care-secondary"
            >
              Add Contact
            </Button>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <Heart className="h-5 w-5 text-red-500" />
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-red-800">Emergency Help</h3>
            <div className="mt-2 text-red-700">
              <p>
                In case of a medical emergency, tap the button below to call
                services.
              </p>
            </div>
            <div className="mt-4">
              <Button
                className="bg-red-600 hover:bg-red-700 text-white font-bold"
                onClick={handleEmergencyCall}
              >
                <Phone className="mr-2 h-4 w-4" /> Call 112
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {loading ? (
          <div className="text-center p-8">
            <p>Loading contacts...</p>
          </div>
        ) : contacts.length === 0 ? (
          <div className="text-center p-8 bg-gray-50 rounded-lg">
            <Phone className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-xl font-medium text-gray-600 mb-2">
              No emergency contacts added yet
            </h3>
            <p className="text-gray-500">
              Add important contacts for quick access in emergencies
            </p>
          </div>
        ) : (
          contacts.map((contact) => (
            <div
              key={contact.id}
              className="bg-white rounded-lg p-4 shadow flex justify-between items-center"
            >
              <div>
                <h3 className="font-semibold text-lg">{contact.name}</h3>
                <div className="text-gray-600">{contact.relation}</div>
                <div className="flex items-center text-gray-500">
                  <Phone className="h-3 w-3 mr-1" /> {contact.phone}
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  size="sm"
                  onClick={() => handleCall(contact)}
                >
                  <Phone className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(contact.id)}
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

export default EmergencyContacts;