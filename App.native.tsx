import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import MedicationScreen from './src/screens/MedicationScreen';
import EmergencyScreen from './src/screens/EmergencyScreen';
import GamesScreen from './src/screens/GamesScreen';
import PharmacyScreen from './src/screens/PharmacyScreen';
import TelemedicineScreen from './src/screens/TelemedicineScreen';
import SocialScreen from './src/screens/SocialScreen';
import MentalHealthScreen from './src/screens/MentalHealthScreen';
import AuthScreen from './src/screens/AuthScreen';
import ProfileScreen from './src/screens/ProfileScreen';

// Context
import { AuthProvider } from './src/context/AuthContext';
import { ThemeProvider } from './src/context/ThemeContext';

// Firebase config
const firebaseConfig = {
  // Replace these values with your Firebase project configuration
  // or set up environment variables in your build process
  apiKey: process.env.FIREBASE_API_KEY || "YOUR_API_KEY",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "YOUR_AUTH_DOMAIN",
  projectId: process.env.FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "YOUR_STORAGE_BUCKET",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "YOUR_MESSAGING_SENDER_ID",
  appId: process.env.FIREBASE_APP_ID || "YOUR_APP_ID"
};

// Initialize Firebase if not already initialized
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const Stack = createNativeStackNavigator();

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    // Check if user is already authenticated
    const unsubscribe = firebase.auth().onAuthStateChanged(user => {
      setIsAuthenticated(!!user);
    });
    
    return () => unsubscribe();
  }, []);
  
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <ThemeProvider>
            <NavigationContainer>
              <Stack.Navigator 
                screenOptions={{
                  headerStyle: {
                    backgroundColor: '#6c63ff',
                  },
                  headerTintColor: '#fff',
                  headerTitleStyle: {
                    fontWeight: 'bold',
                    fontSize: 20,
                  },
                }}
              >
                {!isAuthenticated ? (
                  <Stack.Screen 
                    name="Auth" 
                    component={AuthScreen} 
                    options={{ headerShown: false }}
                  />
                ) : (
                  <>
                    <Stack.Screen 
                      name="Home" 
                      component={HomeScreen} 
                      options={{ title: 'AROGYA MITRA' }}
                    />
                    <Stack.Screen 
                      name="Medication" 
                      component={MedicationScreen} 
                      options={{ title: 'Medication Tracker' }}
                    />
                    <Stack.Screen 
                      name="Emergency" 
                      component={EmergencyScreen} 
                      options={{ title: 'Emergency Contacts' }}
                    />
                    <Stack.Screen 
                      name="Games" 
                      component={GamesScreen} 
                      options={{ title: 'Memory Games' }}
                    />
                    <Stack.Screen 
                      name="Pharmacy" 
                      component={PharmacyScreen} 
                      options={{ title: 'Nearby Pharmacies' }}
                    />
                    <Stack.Screen 
                      name="Telemedicine" 
                      component={TelemedicineScreen} 
                      options={{ title: 'Video Consultation' }}
                    />
                    <Stack.Screen 
                      name="Social" 
                      component={SocialScreen} 
                      options={{ title: 'Virtual Social Club' }}
                    />
                    <Stack.Screen 
                      name="MentalHealth" 
                      component={MentalHealthScreen} 
                      options={{ title: 'Mental Health Support' }}
                    />
                    <Stack.Screen 
                      name="Profile" 
                      component={ProfileScreen} 
                      options={{ title: 'My Profile' }}
                    />
                  </>
                )}
              </Stack.Navigator>
            </NavigationContainer>
            <StatusBar style="auto" />
          </ThemeProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
