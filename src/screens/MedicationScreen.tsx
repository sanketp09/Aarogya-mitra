
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import * as Speech from 'expo-speech';
import { useAuth } from '../context/AuthContext';
import firebase from 'firebase/app';
import 'firebase/firestore';

// Definition for a medication object
interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  time: string;
  taken: boolean;
}

// OpenFDA API service
const checkMedicationInteraction = async (medications: string[]) => {
  try {
    if (medications.length < 2) {
      return { interactions: [] };
    }

    // Convert medication names to a comma-separated list
    const medicationNames = medications.join('+');
    
    // Use OpenFDA API to check for interactions
    const response = await fetch(
      `https://api.fda.gov/drug/label.json?search=openfda.brand_name:(${encodeURIComponent(medicationNames)})+AND+drug_interactions&limit=10`
    );
    
    const data = await response.json();
    
    // Extract interaction information
    if (data.results && data.results.length > 0) {
      const interactionsData = data.results.map(result => {
        const drugName = result.openfda.brand_name ? result.openfda.brand_name[0] : 'Unknown';
        let interactions = [];
        
        if (result.drug_interactions) {
          interactions = result.drug_interactions.map(interaction => ({
            description: interaction,
            severity: interaction.toLowerCase().includes('severe') ? 'High' : 
                     interaction.toLowerCase().includes('moderate') ? 'Medium' : 'Low'
          }));
        }
        
        return {
          drugName,
          interactions
        };
      }).filter(item => item.interactions.length > 0);
      
      return { interactions: interactionsData };
    }
    
    return { interactions: [] };
  } catch (error) {
    console.error('Error checking medication interactions:', error);
    return { interactions: [], error: 'Failed to check medication interactions' };
  }
};

const MedicationScreen = () => {
  const { colors, fontSize } = useTheme();
  const { user } = useAuth();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMedication, setNewMedication] = useState({
    name: '',
    dosage: '',
    frequency: '',
    time: '',
  });
  const [showForm, setShowForm] = useState(false);
  const [checking, setChecking] = useState(false);
  const [interactions, setInteractions] = useState<any[]>([]);
  const [showInteractions, setShowInteractions] = useState(false);

  // Fetch medications from Firestore
  useEffect(() => {
    if (!user) return;

    const unsubscribe = firebase
      .firestore()
      .collection('users')
      .doc(user.uid)
      .collection('medications')
      .onSnapshot(snapshot => {
        const medicationList: Medication[] = [];
        snapshot.forEach(doc => {
          medicationList.push({
            id: doc.id,
            ...doc.data(),
          } as Medication);
        });
        setMedications(medicationList);
        setLoading(false);
      });

    return () => unsubscribe();
  }, [user]);

  const addMedication = async () => {
    if (!user) return;
    
    if (!newMedication.name || !newMedication.dosage || !newMedication.time) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }

    try {
      await firebase
        .firestore()
        .collection('users')
        .doc(user.uid)
        .collection('medications')
        .add({
          ...newMedication,
          taken: false,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        });

      setNewMedication({
        name: '',
        dosage: '',
        frequency: '',
        time: '',
      });
      setShowForm(false);
      
      // Speak confirmation
      Speech.speak(`Medication ${newMedication.name} has been added to your list.`);
    } catch (error) {
      console.error('Error adding medication:', error);
      Alert.alert('Error', 'Failed to add medication. Please try again.');
    }
  };

  const toggleTaken = async (id: string, taken: boolean) => {
    if (!user) return;

    try {
      await firebase
        .firestore()
        .collection('users')
        .doc(user.uid)
        .collection('medications')
        .doc(id)
        .update({
          taken: !taken,
        });
    } catch (error) {
      console.error('Error updating medication:', error);
      Alert.alert('Error', 'Failed to update medication status. Please try again.');
    }
  };

  const deleteMedication = async (id: string, name: string) => {
    if (!user) return;

    Alert.alert(
      'Delete Medication',
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
                .collection('medications')
                .doc(id)
                .delete();
                
              // Speak confirmation
              Speech.speak(`Medication ${name} has been removed from your list.`);
            } catch (error) {
              console.error('Error deleting medication:', error);
              Alert.alert('Error', 'Failed to delete medication. Please try again.');
            }
          },
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  };

  const checkInteractions = async () => {
    setChecking(true);
    
    try {
      const medicationNames = medications.map(med => med.name);
      const result = await checkMedicationInteraction(medicationNames);
      
      setInteractions(result.interactions);
      setShowInteractions(true);
      
      if (result.interactions.length === 0) {
        Speech.speak('No potential interactions were found between your medications.');
      } else {
        Speech.speak('Warning! Potential medication interactions were found. Please review them carefully.');
      }
    } catch (error) {
      console.error('Error checking interactions:', error);
      Alert.alert('Error', 'Failed to check medication interactions. Please try again.');
    } finally {
      setChecking(false);
    }
  };

  const renderMedicationItem = ({ item }: { item: Medication }) => (
    <View style={[styles.medicationItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <TouchableOpacity
        style={[
          styles.checkBox,
          {
            backgroundColor: item.taken ? colors.success : 'transparent',
            borderColor: item.taken ? colors.success : colors.border,
          },
        ]}
        onPress={() => toggleTaken(item.id, item.taken)}
      >
        {item.taken && <Ionicons name="checkmark" size={18} color="#FFFFFF" />}
      </TouchableOpacity>
      
      <View style={styles.medicationInfo}>
        <Text style={[styles.medicationName, { color: colors.text, fontSize: fontSize.medium }]}>
          {item.name}
        </Text>
        <Text style={[styles.medicationDetails, { color: colors.text, fontSize: fontSize.small }]}>
          {item.dosage} - {item.frequency}
        </Text>
        <Text style={[styles.medicationTime, { color: colors.primary, fontSize: fontSize.small }]}>
          {item.time}
        </Text>
      </View>
      
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteMedication(item.id, item.name)}
      >
        <Ionicons name="trash-outline" size={24} color={colors.error} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text, fontSize: fontSize.large }]}>
          Your Medications
        </Text>
        
        <TouchableOpacity
          style={[styles.interactionButton, { backgroundColor: colors.secondary }]}
          onPress={checkInteractions}
          disabled={medications.length < 2 || checking}
        >
          {checking ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <Ionicons name="alert-circle-outline" size={22} color="#FFFFFF" />
              <Text style={styles.interactionButtonText}>Check Interactions</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
      ) : medications.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="medkit-outline" size={70} color={colors.primary} style={styles.emptyIcon} />
          <Text style={[styles.emptyText, { color: colors.text, fontSize: fontSize.medium }]}>
            No medications added yet
          </Text>
          <Text style={[styles.emptySubtext, { color: colors.text, fontSize: fontSize.small }]}>
            Tap the "+" button to add your medications
          </Text>
        </View>
      ) : (
        <FlatList
          data={medications}
          renderItem={renderMedicationItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
        />
      )}

      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: colors.primary }]}
        onPress={() => setShowForm(true)}
      >
        <Ionicons name="add" size={30} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Add Medication Modal */}
      <Modal
        visible={showForm}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowForm(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text, fontSize: fontSize.large }]}>
              Add Medication
            </Text>
            
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.text, fontSize: fontSize.medium }]}>
                Medication Name
              </Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border, fontSize: fontSize.medium }]}
                placeholder="Enter medication name"
                placeholderTextColor="gray"
                value={newMedication.name}
                onChangeText={(text) => setNewMedication({ ...newMedication, name: text })}
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.text, fontSize: fontSize.medium }]}>
                Dosage
              </Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border, fontSize: fontSize.medium }]}
                placeholder="Ex: 10mg"
                placeholderTextColor="gray"
                value={newMedication.dosage}
                onChangeText={(text) => setNewMedication({ ...newMedication, dosage: text })}
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.text, fontSize: fontSize.medium }]}>
                Frequency
              </Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border, fontSize: fontSize.medium }]}
                placeholder="Ex: Once daily, Twice daily"
                placeholderTextColor="gray"
                value={newMedication.frequency}
                onChangeText={(text) => setNewMedication({ ...newMedication, frequency: text })}
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.text, fontSize: fontSize.medium }]}>
                Time
              </Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border, fontSize: fontSize.medium }]}
                placeholder="Ex: 8:00 AM, After dinner"
                placeholderTextColor="gray"
                value={newMedication.time}
                onChangeText={(text) => setNewMedication({ ...newMedication, time: text })}
              />
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
                onPress={addMedication}
              >
                <Text style={[styles.buttonText, { color: '#FFFFFF', fontSize: fontSize.medium }]}>
                  Save
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Interactions Modal */}
      <Modal
        visible={showInteractions}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowInteractions(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text, fontSize: fontSize.large }]}>
              Potential Interactions
            </Text>
            
            {interactions.length === 0 ? (
              <View style={styles.noInteractions}>
                <Ionicons name="checkmark-circle" size={60} color={colors.success} style={styles.interactionIcon} />
                <Text style={[styles.noInteractionsText, { color: colors.text, fontSize: fontSize.medium }]}>
                  No potential interactions found
                </Text>
                <Text style={[styles.noInteractionsSubtext, { color: colors.text, fontSize: fontSize.small }]}>
                  Your medications appear to be safe to take together
                </Text>
              </View>
            ) : (
              <FlatList
                data={interactions}
                keyExtractor={(item, index) => `interaction-${index}`}
                renderItem={({ item }) => (
                  <View style={[styles.interactionItem, { borderColor: colors.border }]}>
                    <Text style={[styles.interactionDrug, { color: colors.text, fontSize: fontSize.medium }]}>
                      {item.drugName}
                    </Text>
                    {item.interactions.map((interaction: any, index: number) => (
                      <View key={`int-detail-${index}`} style={styles.interactionDetail}>
                        <View 
                          style={[
                            styles.severityIndicator, 
                            { 
                              backgroundColor: 
                                interaction.severity === 'High' ? colors.error : 
                                interaction.severity === 'Medium' ? '#FFA500' : 
                                colors.success 
                            }
                          ]} 
                        />
                        <Text style={[styles.interactionText, { color: colors.text, fontSize: fontSize.small }]}>
                          {interaction.description}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.interactionsList}
              />
            )}
            
            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: colors.primary }]}
              onPress={() => setShowInteractions(false)}
            >
              <Text style={[styles.buttonText, { color: '#FFFFFF', fontSize: fontSize.medium }]}>
                Close
              </Text>
            </TouchableOpacity>
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
  interactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 20,
  },
  interactionButtonText: {
    color: '#FFFFFF',
    marginLeft: 5,
    fontWeight: '500',
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
    paddingBottom: 80, // Space for add button
  },
  medicationItem: {
    flexDirection: 'row',
    alignItems: 'center',
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
  checkBox: {
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  medicationInfo: {
    flex: 1,
  },
  medicationName: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  medicationDetails: {
    marginBottom: 4,
  },
  medicationTime: {
    fontWeight: '500',
  },
  deleteButton: {
    padding: 6,
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
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
  noInteractions: {
    paddingVertical: 30,
    alignItems: 'center',
  },
  interactionIcon: {
    marginBottom: 16,
  },
  noInteractionsText: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  noInteractionsSubtext: {
    textAlign: 'center',
    opacity: 0.7,
  },
  interactionsList: {
    paddingBottom: 16,
  },
  interactionItem: {
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  interactionDrug: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  interactionDetail: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  severityIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
    marginTop: 5,
  },
  interactionText: {
    flex: 1,
  },
  closeButton: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginTop: 10,
  },
});

export default MedicationScreen;
