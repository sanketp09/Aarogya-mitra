// API services for CaringCompass app

// Mock data for emergency contacts (in a real app, this would come from a database)
export const emergencyContacts = [
    { id: 1, name: "John Smith", relationship: "Son", phone: "+1-555-123-4567" },
    { id: 2, name: "Mary Johnson", relationship: "Daughter", phone: "+1-555-765-4321" },
    { id: 3, name: "Dr. Robert Williams", relationship: "Primary Physician", phone: "+1-555-987-6543" },
  ];
  
  // Emergency Alert Service
  export const sendEmergencyAlert = async (userLocation: { lat: number; lng: number }) => {
    // In a production app, this would call Twilio API to send SMS
    console.log("Emergency alert sent to contacts with location:", userLocation);
    
    // Mock API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: "Emergency alert sent successfully",
          sentTo: emergencyContacts.map(contact => contact.name),
        });
      }, 1500);
    });
  };
  
  // Get user's current location
  export const getCurrentLocation = (): Promise<{lat: number, lng: number}> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by your browser"));
      } else {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });
          },
          (error) => {
            console.error("Error getting location:", error);
            reject(error);
            // Fallback to default location if permission denied
            if (error.code === error.PERMISSION_DENIED) {
              resolve({ lat: 40.7128, lng: -74.0060 }); // Default to NYC
            }
          }
        );
      }
    });
  };
  
  // Get nearest pharmacies (mock implementation)
  export const getNearbyPharmacies = async (location: { lat: number; lng: number }) => {
    // In a real app, this would call the OpenStreetMap API
    console.log("Fetching nearby pharmacies for location:", location);
    
    // Mock data
    const mockPharmacies = [
      { id: 1, name: "HealthCare Pharmacy", address: "123 Main St", distance: "0.3 miles", phone: "555-123-4567" },
      { id: 2, name: "MediLife Drugstore", address: "456 Oak Ave", distance: "0.7 miles", phone: "555-987-6543" },
      { id: 3, name: "Wellness Pharmacy", address: "789 Pine Blvd", distance: "1.2 miles", phone: "555-456-7890" },
    ];
    
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockPharmacies);
      }, 1000);
    });
  };
  
  // Medication interaction check (mock implementation)
  export const checkMedicationInteractions = async (medications: string[]) => {
    // In a real app, this would call the OpenFDA API
    console.log("Checking interactions for medications:", medications);
    
    // Mock data
    const mockInteractions = medications.length > 1 ? [
      { 
        severity: "moderate", 
        description: "These medications may interact with each other. Consult your doctor.",
        medications: medications.slice(0, 2)
      }
    ] : [];
    
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          interactions: mockInteractions,
          checkedMedications: medications
        });
      }, 1200);
    });
  };
  
  // Setup Telehealth Session (mock implementation)
  export const setupTelehealthSession = async () => {
    // In a real app, this would generate a Jitsi Meet link
    const sessionId = Math.random().toString(36).substring(2, 15);
    
    return {
      sessionUrl: `https://meet.jit.si/${sessionId}`,
      sessionId: sessionId,
      password: Math.random().toString(36).substring(2, 10),
    };
  };
  