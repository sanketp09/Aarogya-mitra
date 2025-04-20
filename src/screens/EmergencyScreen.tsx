
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  ActivityIndicator,
  Vibration,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import * as Speech from 'expo-speech';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import firebase from 'firebase/app';
import 'firebase/firestore';

// Interface for contact object
interface Contact {
  id: string;
  name: string;
  relation: string;
  phone: string;
  isEmergency: boolean;
}

const EmergencyScreen = () => {
  const { colors, fontSize } = useTheme();
  const { user } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [sosActive, setSosActive] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [showForm, setShowForm] = useState(false);
  const [newContact, setNewContact] = useState<Omit<Contact, 'id'>>({
    name: '',
    relation: '',
    phone: '',
    isEmergency: true,
  });

  // Fetch contacts from Firestore
  useEffect(() => {
    if (!user) return;

    const unsubscribe = firebase
      .firestore()
      .collection('users')
      .doc(user.uid)
      .collection('contacts')
      .orderBy('isEmergency', 'desc')
      .onSnapshot(snapshot => {
        const contactsList: Contact[] = [];
        snapshot.forEach(doc => {
          contactsList.push({
            id: doc.id,
            ...doc.data(),
          } as Contact);
        });
        setContacts(contactsList);
        setLoading(false);
      });

    return () => unsubscribe();
  }, [user]);

  // SOS countdown effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (sosActive && countdown > 0) {
      // Vibrate phone to indicate SOS is being triggered
      Vibration.vibrate(500);
      
      timer = setTimeout(() => {
        setCountdown(prevCount => prevCount - 1);
      }, 1000);
    } else if (sosActive && countdown === 0) {
      // When countdown reaches zero, trigger the SOS
      triggerEmergency();
      setSosActive(false);
      setCountdown(5);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [sosActive, countdown]);

  const addContact = async () => {
    if (!user) return;
    
    if (!newContact.name || !newContact.phone) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }

    try {
      await firebase
        .firestore()
        .collection('users')
        .doc(user.uid)
        .collection('contacts')
        .add({
          ...newContact,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        });

      setNewContact({
        name: '',
        relation: '',
        phone: '',
        isEmergency: true,
      });
      setShowForm(false);
      
      // Speak confirmation
      Speech.speak(`Contact ${newContact.name} has been added to your emergency contacts.`);
    } catch (error) {
      console.error('Error adding contact:', error);
      Alert.alert('Error', 'Failed to add contact. Please try again.');
    }
  };

  const deleteContact = async (id: string, name: string) => {
    if (!user) return;

    Alert.alert(
      'Delete Contact',
      `Are you sure you want to delete ${name}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              await firebase
                .firestore()
                .collection('users')
                .doc(user.uid)
                .collection('contacts')
                .doc(id)
                .delete();
                
              // Speak confirmation
              Speech.speak(`Contact ${name} has been removed from your list.`);
            } catch (error) {
              console.error('Error deleting contact:', error);
              Alert.alert('Error', 'Failed to delete contact. Please try again.');
            }
          },
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  };

  const callContact = (phone: string) => {
    if (!phone) return;
    
    try {
      // In a real app, this would use the device's phone capabilities
      Alert.alert('Calling', `Calling ${phone}`);
    } catch (error) {
      console.error('Error making phone call:', error);
      Alert.alert('Error', 'Could not make the phone call.');
    }
  };

  const toggleSOS = () => {
    if (!sosActive) {
      // Start SOS countdown
      setSosActive(true);
      Speech.speak('Emergency SOS activated. Countdown started. Tap again to cancel.', { rate: 1.2 });
    } else {
      // Cancel SOS
      setSosActive(false);
      setCountdown(5);
      Speech.speak('Emergency SOS canceled.', { rate: 1 });
    }
  };

  const triggerEmergency = async () => {
    try {
      // Get user's current location
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is needed for emergency services.');
        return;
      }
      
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      
      // In a real app, this would:
      // 1. Call emergency services
      // 2. Send SMS to emergency contacts with location info
      // 3. Push notification to caregivers
      
      // Get emergency contacts
      const emergencyContacts = contacts.filter(contact => contact.isEmergency);
      
      // Notify user that emergency was triggered
      Alert.alert(
        'Emergency SOS Activated',
        `Emergency services have been contacted. Location information has been sent to ${emergencyContacts.length} emergency contacts.`,
        [{ text: 'OK' }]
      );
      
      Speech.speak('Emergency SOS has been activated. Help is on the way.', { rate: 1 });
      
      // Log the emergency in Firestore
      if (user) {
        await firebase
          .firestore()
          .collection('users')
          .doc(user.uid)
          .collection('emergencies')
          .add({
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            location: new firebase.firestore.GeoPoint(latitude, longitude),
            status: 'active',
          });
      }
    } catch (error) {
      console.error('Error triggering emergency:', error);
      Alert.alert('Error', 'Failed to trigger emergency. Please try again or call emergency services directly.');
    }
  };

  const renderContactItem = ({ item }: { item: Contact }) => (
    <View 
      style={[
        styles.contactItem, 
        { 
          backgroundColor: colors.card, 
          borderColor: item.isEmergency ? colors.error : colors.border 
        }
      ]}
    >
      <View style={styles.contactDetails}>
        <Text style={[styles.contactName, { color: colors.text, fontSize: fontSize.medium }]}>
          {item.name}
        </Text>
        <Text style={[styles.contactRelation, { color: colors.text, fontSize: fontSize.small }]}>
          {item.relation}
        </Text>
        <Text style={[styles.contactPhone, { color: colors.text, fontSize: fontSize.small }]}>
          <Ionicons name="call" size={14} color={colors.text} /> {item.phone}
        </Text>
        {item.isEmergency && (
          <View style={[styles.emergencyTag, { backgroundColor: colors.error }]}>
            <Text style={styles.emergencyText}>Emergency Contact</Text>
          </View>
        )}
      </View>
      
      <View style={styles.contactActions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.success }]}
          onPress={() => callContact(item.phone)}
        >
          <Ionicons name="call" size={20} color="#FFFFFF" />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.error, marginTop: 8 }]}
          onPress={() => deleteContact(item.id, item.name)}
        >
          <Ionicons name="trash" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text, fontSize: fontSize.large }]}>
          Emergency Contacts
        </Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={() => setShowForm(true)}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={[styles.emergencyCard, { backgroundColor: '#FFE8E8', borderColor: colors.error }]}>
        <View style={styles.emergencyCardContent}>
          <MaterialCommunityIcons name="alert-circle" size={36} color={colors.error} style={styles.emergencyIcon} />
          <View style={styles.emergencyTextContainer}>
            <Text style={[styles.emergencyTitle, { color: '#D32F2F', fontSize: fontSize.medium }]}>
              In Case of Emergency
            </Text>
            <Text style={[styles.emergencyDescription, { color: '#D32F2F', fontSize: fontSize.small }]}>
              Tap the SOS button to alert emergency services and your emergency contacts.
            </Text>
          </View>
        </View>
        
        <TouchableOpacity
          style={[styles.sosButton, { backgroundColor: sosActive ? '#D32F2F' : colors.error }]}
          onPress={toggleSOS}
        >
          {sosActive ? (
            <>
              <Text style={styles.countdownText}>{countdown}</Text>
              <Text style={styles.cancelText}>Tap to cancel</Text>
            </>
          ) : (
            <>
              <Text style={styles.sosText}>SOS</Text>
              <Text style={styles.sosSubtext}>Emergency</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.emergencyServicesButton, { backgroundColor: colors.error }]}
        onPress={() => callContact('911')}
      >
        <Ionicons name="call" size={24} color="#FFFFFF" style={styles.emergencyServicesIcon} />
        <Text style={styles.emergencyServicesText}>Call 911 (Emergency Services)</Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
      ) : contacts.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="people" size={70} color={colors.primary} style={styles.emptyIcon} />
          <Text style={[styles.emptyText, { color: colors.text, fontSize: fontSize.medium }]}>
            No emergency contacts added yet
          </Text>
          <Text style={[styles.emptySubtext, { color: colors.text, fontSize: fontSize.small }]}>
            Add important contacts for quick access in emergencies
          </Text>
        </View>
      ) : (
        <FlatList
          data={contacts}
          renderItem={renderContactItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
        />
      )}

      {/* Add Contact Modal */}
      <Modal
        visible={showForm}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowForm(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text, fontSize: fontSize.large }]}>
              Add Emergency Contact
            </Text>
            
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.text, fontSize: fontSize.medium }]}>
                Name
              </Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border, fontSize: fontSize.medium }]}
                placeholder="Enter contact name"
                placeholderTextColor="gray"
                value={newContact.name}
                onChangeText={(text) => setNewContact({ ...newContact, name: text })}
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.text, fontSize: fontSize.medium }]}>
                Relationship
              </Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border, fontSize: fontSize.medium }]}
                placeholder="Ex: Son, Daughter, Doctor"
                placeholderTextColor="gray"
                value={newContact.relation}
                onChangeText={(text) => setNewContact({ ...newContact, relation: text })}
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.text, fontSize: fontSize.medium }]}>
                Phone Number
              </Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border, fontSize: fontSize.medium }]}
                placeholder="Enter phone number"
                placeholderTextColor="gray"
                keyboardType="phone-pad"
                value={newContact.phone}
                onChangeText={(text) => setNewContact({ ...newContact, phone: text })}
              />
            </View>
            
            <View style={styles.formGroup}>
              <View style={styles.checkboxContainer}>
                <TouchableOpacity
                  style={[
                    styles.checkbox,
                    {
                      backgroundColor: newContact.isEmergency ? colors.primary : 'transparent',
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() => setNewContact({ ...newContact, isEmergency: !newContact.isEmergency })}
                >
                  {newContact.isEmergency && <Ionicons name="checkmark" size={18} color="#FFFFFF" />}
                </TouchableOpacity>
                <Text style={[styles.checkboxLabel, { color: colors.text, fontSize: fontSize.medium }]}>
                  Emergency Contact (will be notified in emergencies)
                </Text>
              </View>
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton, { borderColor: colors.border }]}
                onPress={() => setShowForm(false)}
              >
                <Text style={[styles.buttonText, { color: colors.text, fontSize: fontSize.medium }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton, { backgroundColor: colors.primary }]}
                onPress={addContact}
              >
                <Text style={[styles.buttonText, { color: '#FFFFFF', fontSize: fontSize.medium }]}>
                  Save
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emergencyCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderLeftWidth: 5,
  },
  emergencyCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emergencyIcon: {
    marginRight: 12,
  },
  emergencyTextContainer: {
    flex: 1,
  },
  emergencyTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  emergencyDescription: {
    marginBottom: 12,
  },
  sosButton: {
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  sosText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  sosSubtext: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  countdownText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
  },
  cancelText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  emergencyServicesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  emergencyServicesIcon: {
    marginRight: 8,
  },
  emergencyServicesText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 18,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  },
  list: {
    paddingBottom: 20,
  },
  contactItem: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  contactDetails: {
    flex: 1,
  },
  contactName: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  contactRelation: {
    marginBottom: 4,
  },
  contactPhone: {
    marginBottom: 8,
  },
  emergencyTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  emergencyText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  contactActions: {
    justifyContent: 'center',
    marginLeft: 10,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    borderRadius: 16,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  modalTitle: {
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkboxLabel: {
    flex: 1,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  cancelButton: {
    marginRight: 8,
    borderWidth: 1,
  },
  saveButton: {
    marginLeft: 8,
  },
  buttonText: {
    fontWeight: '500',
  },
});

export default EmergencyScreen;
