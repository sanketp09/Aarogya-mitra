import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Phone, X, MapPin } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { sendEmergencyAlert, getCurrentLocation, emergencyContacts } from '@/services/api.ts';

const EmergencyButton = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const { toast } = useToast();

  const handleEmergencyClick = async () => {
    try {
      // Get user's location when button is pressed
      const currentLocation = await getCurrentLocation();
      setLocation(currentLocation);
      setIsDialogOpen(true);
    } catch (error) {
      console.error("Failed to get location:", error);
      toast({
        title: "Location Error",
        description: "Could not determine your location. Please enable location services.",
        variant: "destructive",
      });
      // Still open dialog, but without location
      setIsDialogOpen(true);
    }
  };

  const handleConfirmEmergency = async () => {
    setIsConfirming(true);
    
    try {
      // Use the location if available, otherwise use a default
      const userLocation = location || { lat: 40.7128, lng: -74.0060 };
      const result = await sendEmergencyAlert(userLocation);
      
      setIsConfirming(false);
      setIsDialogOpen(false);
      
      toast({
        title: "Emergency Alert Sent",
        description: `Your emergency contacts have been notified with your location`,
        variant: "default",
      });
    } catch (error) {
      console.error("Error sending emergency alert:", error);
      
      toast({
        title: "Failed to Send Alert",
        description: "There was a problem sending the emergency alert. Please try again or call emergency services directly.",
        variant: "destructive",
      });
      
      setIsConfirming(false);
    }
  };

  const handleCancelEmergency = () => {
    setIsDialogOpen(false);
  };

  return (
    <>
      <Button 
        className="bg-care-red hover:bg-care-light-red text-white text-senior-lg font-bold py-6 px-8 rounded-full shadow-lg animate-pulse-emergency senior-focus-ring w-full"
        onClick={handleEmergencyClick}
      >
        <Phone className="mr-2 h-6 w-6" /> SOS Emergency
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-senior-lg text-care-red">Confirm Emergency Alert</DialogTitle>
            <DialogDescription className="text-senior">
              This will notify your emergency contacts with your current location. 
              Are you sure you want to proceed?
            </DialogDescription>
          </DialogHeader>
          
          {location && (
            <div className="my-2 p-3 bg-slate-50 rounded-md">
              <div className="flex items-center text-sm text-muted-foreground mb-2">
                <MapPin className="h-4 w-4 mr-1" /> Your current location will be shared
              </div>
              <div className="text-xs text-muted-foreground">
                Coordinates: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
              </div>
            </div>
          )}
          
          <div className="my-2 p-3 bg-slate-50 rounded-md">
            <h4 className="text-sm font-medium mb-2">Will notify these contacts:</h4>
            <ul className="text-sm space-y-1">
              {emergencyContacts.map(contact => (
                <li key={contact.id} className="text-muted-foreground">
                  {contact.name} ({contact.relationship})
                </li>
              ))}
            </ul>
          </div>
          
          <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-4 mt-4">
            <Button 
              variant="outline" 
              className="text-senior"
              onClick={handleCancelEmergency}
              disabled={isConfirming}
            >
              <X className="mr-2 h-5 w-5" /> Cancel
            </Button>
            <Button 
              className="bg-care-red hover:bg-care-light-red text-senior"
              onClick={handleConfirmEmergency}
              disabled={isConfirming}
            >
              {isConfirming ? 'Sending Alert...' : 'Yes, Send Emergency Alert'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EmergencyButton;
