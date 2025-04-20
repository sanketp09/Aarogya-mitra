
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  Image,
} from 'react-native';
import * as Location from 'expo-location';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import { useTheme } from '../context/ThemeContext';
import * as Speech from 'expo-speech';

// Interface for pharmacy data
interface Pharmacy {
  id: string;
  name: string;
  distance: string;
  address: string;
  phone?: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

// Default coordinates if location access is denied
const DEFAULT_LOCATION = {
  latitude: 37.7749,
  longitude: -122.4194,
};

const PharmacyScreen = () => {
  const { colors, fontSize } = useTheme();
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    getUserLocation();
  }, []);

  const getUserLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Allow location access to find pharmacies near you.',
          [
            {
              text: 'Use Default Location',
              onPress: () => {
                setUserLocation(DEFAULT_LOCATION);
                fetchNearbyPharmacies(DEFAULT_LOCATION);
              },
            },
            {
              text: 'Try Again',
              onPress: getUserLocation,
            },
          ]
        );
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const userCoords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      
      setUserLocation(userCoords);
      fetchNearbyPharmacies(userCoords);
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert(
        'Location Error',
        'Failed to get your location. Using default location instead.',
        [
          {
            text: 'OK',
            onPress: () => {
              setUserLocation(DEFAULT_LOCATION);
              fetchNearbyPharmacies(DEFAULT_LOCATION);
            },
          },
        ]
      );
    }
  };

  const fetchNearbyPharmacies = async (location: { latitude: number; longitude: number }) => {
    setLoading(true);
    
    try {
      // Using OpenStreetMap's Overpass API to fetch pharmacies
      // Note: In a production app, you might want to use a backend service to make this request
      const query = `
        [out:json];
        node
          ["amenity"="pharmacy"]
          (around:5000,${location.latitude},${location.longitude});
        out body;
      `;
      
      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: query,
      });
      
      const data = await response.json();
      
      if (data && data.elements) {
        // Process the pharmacy data
        const pharmacyData = data.elements.map((element: any, index: number) => {
          // Calculate distance (simplified - just a rough estimate)
          const lat1 = location.latitude;
          const lon1 = location.longitude;
          const lat2 = element.lat;
          const lon2 = element.lon;
          
          const R = 6371; // Earth's radius in km
          const dLat = (lat2 - lat1) * Math.PI / 180;
          const dLon = (lon2 - lon1) * Math.PI / 180;
          const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
          const distance = R * c;
          
          return {
            id: `pharmacy-${index}`,
            name: element.tags.name || `Pharmacy ${index + 1}`,
            distance: `${distance.toFixed(1)} km`,
            address: element.tags.address || 'Address not available',
            phone: element.tags.phone,
            coordinates: {
              latitude: element.lat,
              longitude: element.lon,
            },
          };
        });
        
        // Sort by distance
        pharmacyData.sort((a: Pharmacy, b: Pharmacy) => {
          return parseFloat(a.distance) - parseFloat(b.distance);
        });
        
        setPharmacies(pharmacyData);
        
        if (pharmacyData.length > 0) {
          const message = `Found ${pharmacyData.length} pharmacies near you. The closest is ${pharmacyData[0].name}, ${pharmacyData[0].distance} away.`;
          Speech.speak(message, { rate: 0.9 });
        } else {
          Speech.speak('No pharmacies found nearby. Try expanding your search area.', { rate: 0.9 });
        }
      } else {
        setPharmacies([]);
        Speech.speak('No pharmacies found nearby. Try expanding your search area.', { rate: 0.9 });
      }
    } catch (error) {
      console.error('Error fetching pharmacies:', error);
      Alert.alert('Error', 'Failed to fetch nearby pharmacies. Please try again.');
      setPharmacies([]);
    } finally {
      setLoading(false);
    }
  };

  const refreshPharmacies = () => {
    if (userLocation) {
      fetchNearbyPharmacies(userLocation);
    } else {
      getUserLocation();
    }
  };

  const openDirections = (pharmacy: Pharmacy) => {
    const { coordinates } = pharmacy;
    const destination = `${coordinates.latitude},${coordinates.longitude}`;
    
    const url = Platform.select({
      ios: `maps:?q=${pharmacy.name}&ll=${destination}`,
      android: `geo:0,0?q=${destination}(${pharmacy.name})`,
    });
    
    if (url) {
      Linking.openURL(url).catch(err => {
        console.error('Error opening maps app:', err);
        Alert.alert('Error', 'Could not open maps application.');
      });
    }
  };

  const callPharmacy = (phone: string) => {
    if (!phone) {
      Alert.alert('No Phone Number', 'No phone number is available for this pharmacy.');
      return;
    }
    
    Linking.openURL(`tel:${phone}`).catch(err => {
      console.error('Error making phone call:', err);
      Alert.alert('Error', 'Could not make the phone call.');
    });
  };

  const toggleMapView = (pharmacy?: Pharmacy) => {
    if (pharmacy) {
      setSelectedPharmacy(pharmacy);
    }
    setShowMap(!showMap);
  };

  const renderPharmacyItem = ({ item }: { item: Pharmacy }) => (
    <TouchableOpacity
      style={[styles.pharmacyItem, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => toggleMapView(item)}
    >
      <View style={styles.pharmacyDetails}>
        <Text style={[styles.pharmacyName, { color: colors.text, fontSize: fontSize.medium }]}>
          {item.name}
        </Text>
        <Text style={[styles.pharmacyDistance, { color: colors.primary, fontSize: fontSize.small }]}>
          <Ionicons name="location" size={14} color={colors.primary} /> {item.distance}
        </Text>
        <Text style={[styles.pharmacyAddress, { color: colors.text, fontSize: fontSize.small }]}>
          {item.address}
        </Text>
        {item.phone && (
          <Text style={[styles.pharmacyPhone, { color: colors.text, fontSize: fontSize.small }]}>
            <Ionicons name="call" size={14} color={colors.text} /> {item.phone}
          </Text>
        )}
      </View>
      
      <View style={styles.pharmacyActions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.primary }]}
          onPress={() => openDirections(item)}
        >
          <Ionicons name="navigate" size={18} color="#FFFFFF" />
        </TouchableOpacity>
        
        {item.phone && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.success, marginTop: 8 }]}
            onPress={() => callPharmacy(item.phone!)}
          >
            <Ionicons name="call" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text, fontSize: fontSize.large }]}>
          Nearby Pharmacies
        </Text>
        
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={[styles.toggleButton, { backgroundColor: showMap ? colors.secondary : colors.primary }]}
            onPress={() => toggleMapView()}
          >
            <Ionicons name={showMap ? "list" : "map"} size={22} color="#FFFFFF" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.refreshButton, { backgroundColor: colors.primary }]}
            onPress={refreshPharmacies}
          >
            <Ionicons name="refresh" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text, fontSize: fontSize.medium }]}>
            Finding nearby pharmacies...
          </Text>
        </View>
      ) : showMap ? (
        <View style={styles.mapContainer}>
          {userLocation && (
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: selectedPharmacy?.coordinates.latitude || userLocation.latitude,
                longitude: selectedPharmacy?.coordinates.longitude || userLocation.longitude,
                latitudeDelta: 0.02,
                longitudeDelta: 0.02,
              }}
            >
              {/* User's location marker */}
              <Marker
                coordinate={{
                  latitude: userLocation.latitude,
                  longitude: userLocation.longitude,
                }}
                title="Your Location"
                description="You are here"
                pinColor="blue"
              >
                <View style={styles.userMarker}>
                  <Ionicons name="person" size={16} color="#FFFFFF" />
                </View>
              </Marker>
              
              {/* Pharmacy markers */}
              {pharmacies.map((pharmacy) => (
                <Marker
                  key={pharmacy.id}
                  coordinate={pharmacy.coordinates}
                  title={pharmacy.name}
                  description={`${pharmacy.distance} away`}
                  pinColor="red"
                  onPress={() => setSelectedPharmacy(pharmacy)}
                >
                  <View style={[
                    styles.pharmacyMarker,
                    selectedPharmacy?.id === pharmacy.id ? styles.selectedMarker : null
                  ]}>
                    <Ionicons name="medkit" size={16} color="#FFFFFF" />
                  </View>
                </Marker>
              ))}
            </MapView>
          )}
          
          {selectedPharmacy && (
            <View style={[styles.pharmacyInfoCard, { backgroundColor: colors.card }]}>
              <View style={styles.pharmacyCardContent}>
                <Text style={[styles.pharmacyCardName, { color: colors.text, fontSize: fontSize.medium }]}>
                  {selectedPharmacy.name}
                </Text>
                <Text style={[styles.pharmacyCardDistance, { color: colors.primary, fontSize: fontSize.small }]}>
                  <Ionicons name="location" size={14} color={colors.primary} /> {selectedPharmacy.distance}
                </Text>
                <Text style={[styles.pharmacyCardAddress, { color: colors.text, fontSize: fontSize.small }]}>
                  {selectedPharmacy.address}
                </Text>
              </View>
              
              <View style={styles.pharmacyCardActions}>
                <TouchableOpacity
                  style={[styles.cardActionButton, { backgroundColor: colors.primary }]}
                  onPress={() => openDirections(selectedPharmacy)}
                >
                  <Ionicons name="navigate" size={18} color="#FFFFFF" />
                  <Text style={styles.cardActionText}>Directions</Text>
                </TouchableOpacity>
                
                {selectedPharmacy.phone && (
                  <TouchableOpacity
                    style={[styles.cardActionButton, { backgroundColor: colors.success, marginLeft: 8 }]}
                    onPress={() => callPharmacy(selectedPharmacy.phone!)}
                  >
                    <Ionicons name="call" size={18} color="#FFFFFF" />
                    <Text style={styles.cardActionText}>Call</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
        </View>
      ) : pharmacies.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialIcons name="local-pharmacy" size={70} color={colors.primary} style={styles.emptyIcon} />
          <Text style={[styles.emptyText, { color: colors.text, fontSize: fontSize.medium }]}>
            No pharmacies found nearby
          </Text>
          <Text style={[styles.emptySubtext, { color: colors.text, fontSize: fontSize.small }]}>
            Try refreshing or check in a different location
          </Text>
          <TouchableOpacity
            style={[styles.refreshEmptyButton, { backgroundColor: colors.primary }]}
            onPress={refreshPharmacies}
          >
            <Text style={styles.refreshEmptyText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={pharmacies}
          renderItem={renderPharmacyItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontWeight: 'bold',
  },
  headerButtons: {
    flexDirection: 'row',
  },
  toggleButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  refreshButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyText: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 24,
  },
  refreshEmptyButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
  },
  refreshEmptyText: {
    color: '#FFFFFF',
    fontWeight: '500',
    fontSize: 16,
  },
  list: {
    paddingBottom: 20,
  },
  pharmacyItem: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  pharmacyDetails: {
    flex: 1,
  },
  pharmacyName: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  pharmacyDistance: {
    fontWeight: '500',
    marginBottom: 8,
  },
  pharmacyAddress: {
    marginBottom: 4,
  },
  pharmacyPhone: {
    opacity: 0.8,
  },
  pharmacyActions: {
    justifyContent: 'center',
    marginLeft: 10,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapContainer: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  userMarker: {
    backgroundColor: '#4285F4',
    padding: 6,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  pharmacyMarker: {
    backgroundColor: '#EA4335',
    padding: 6,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  selectedMarker: {
    backgroundColor: '#FBBC05',
    padding: 8,
    borderWidth: 3,
  },
  pharmacyInfoCard: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  pharmacyCardContent: {
    flex: 1,
  },
  pharmacyCardName: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  pharmacyCardDistance: {
    fontWeight: '500',
    marginBottom: 4,
  },
  pharmacyCardAddress: {
    opacity: 0.8,
  },
  pharmacyCardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginLeft: 8,
  },
  cardActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  cardActionText: {
    color: '#FFFFFF',
    marginLeft: 4,
    fontWeight: '500',
  },
});

export default PharmacyScreen;
