import { getNearbyPharmacies } from './api';

export interface Pharmacy {
  id: number;
  name: string;
  address: string;
  distance: string;
  phone: string;
}

export const getPharmaciesNearUser = async (): Promise<Pharmacy[]> => {
  try {
    // Get user's location
    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });
    
    const location = {
      lat: position.coords.latitude,
      lng: position.coords.longitude
    };
    
    // Fetch pharmacies near the user's location
    const pharmacies = await getNearbyPharmacies(location);
    return pharmacies as Pharmacy[];
  } catch (error) {
    console.error("Error fetching nearby pharmacies:", error);
    throw error;
  }
};

export const searchPharmacies = async (query: string): Promise<Pharmacy[]> => {
  // In a real app, this would pass the query to the backend
  // For now, we'll just filter our mock data
  
  // Get the mock data
  try {
    const pharmacies = await getNearbyPharmacies({ lat: 40.7128, lng: -74.0060 });
    
    // Filter by query
    return (pharmacies as Pharmacy[]).filter(pharmacy => 
      pharmacy.name.toLowerCase().includes(query.toLowerCase()) ||
      pharmacy.address.toLowerCase().includes(query.toLowerCase())
    );
  } catch (error) {
    console.error("Error searching pharmacies:", error);
    throw error;
  }
};
