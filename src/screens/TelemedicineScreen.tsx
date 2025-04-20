
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Image, 
  TextInput,
  ActivityIndicator,
  FlatList,
  Alert
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

// Mock data for doctors
const DOCTORS = [
  {
    id: '1',
    name: 'Dr. Sarah Johnson',
    specialty: 'Geriatric Care',
    image: 'https://source.unsplash.com/random/100x100/?doctor',
    rating: 4.8,
    experience: 15,
    availability: 'Today, 2:00 PM',
    bio: 'Specialized in geriatric care with 15 years of experience. Focused on holistic approaches to senior health management.',
  },
  {
    id: '2',
    name: 'Dr. Michael Chen',
    specialty: 'Cardiology',
    image: 'https://source.unsplash.com/random/100x100/?doctor-male',
    rating: 4.9,
    experience: 20,
    availability: 'Tomorrow, 10:00 AM',
    bio: 'Board-certified cardiologist with expertise in heart health for seniors. Committed to preventative care and medication management.',
  },
  {
    id: '3',
    name: 'Dr. Emily Patel',
    specialty: 'Neurology',
    image: 'https://source.unsplash.com/random/100x100/?woman-doctor',
    rating: 4.7,
    experience: 12,
    availability: 'Today, 4:30 PM',
    bio: 'Specialized in neurological conditions affecting older adults, including Alzheimer\'s and Parkinson\'s disease.',
  },
  {
    id: '4',
    name: 'Dr. Robert Wilson',
    specialty: 'Physical Therapy',
    image: 'https://source.unsplash.com/random/100x100/?therapist',
    rating: 4.6,
    experience: 10,
    availability: 'Tomorrow, 1:00 PM',
    bio: 'Specializes in mobility issues and rehabilitation for seniors. Focuses on improving quality of life through targeted physical therapy.',
  }
];

// Mock data for appointment history
const APPOINTMENT_HISTORY = [
  {
    id: '1',
    doctorName: 'Dr. Sarah Johnson',
    specialty: 'Geriatric Care',
    date: 'May 12, 2023',
    time: '2:00 PM',
    status: 'Completed',
    notes: 'Prescribed blood pressure medication. Follow-up in 1 month.',
  },
  {
    id: '2',
    doctorName: 'Dr. Michael Chen',
    specialty: 'Cardiology',
    date: 'April 20, 2023',
    time: '11:30 AM',
    status: 'Completed',
    notes: 'EKG results normal. Continue current medication regimen.',
  },
  {
    id: '3',
    doctorName: 'Dr. Emily Patel',
    specialty: 'Neurology',
    date: 'March 5, 2023',
    time: '9:00 AM',
    status: 'Cancelled',
    notes: '',
  }
];

const DoctorCard = ({ doctor, onPress }) => {
  const { colors, fontSize } = useTheme();
  
  return (
    <TouchableOpacity 
      style={[styles.doctorCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => onPress(doctor)}
    >
      <Image source={{ uri: doctor.image }} style={styles.doctorImage} />
      
      <View style={styles.doctorInfo}>
        <Text style={[styles.doctorName, { color: colors.text, fontSize: fontSize.medium }]}>
          {doctor.name}
        </Text>
        <Text style={[styles.doctorSpecialty, { color: colors.text, fontSize: fontSize.small }]}>
          {doctor.specialty}
        </Text>
        
        <View style={styles.doctorStats}>
          <View style={styles.stat}>
            <Ionicons name="star" size={14} color="#FFD700" />
            <Text style={[styles.statText, { color: colors.text, fontSize: fontSize.small }]}>
              {doctor.rating}
            </Text>
          </View>
          
          <View style={styles.stat}>
            <Ionicons name="time" size={14} color={colors.primary} />
            <Text style={[styles.statText, { color: colors.text, fontSize: fontSize.small }]}>
              {doctor.experience} yrs
            </Text>
          </View>
        </View>
        
        <View style={[styles.availabilityBadge, { backgroundColor: colors.primary + '20' }]}>
          <Ionicons name="calendar" size={14} color={colors.primary} />
          <Text style={[styles.availabilityText, { color: colors.primary, fontSize: fontSize.small }]}>
            {doctor.availability}
          </Text>
        </View>
      </View>
      
      <Ionicons name="chevron-forward" size={20} color={colors.text} style={styles.chevron} />
    </TouchableOpacity>
  );
};

const AppointmentHistoryItem = ({ appointment }) => {
  const { colors, fontSize } = useTheme();
  
  return (
    <View style={[styles.appointmentItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.appointmentHeader}>
        <Text style={[styles.appointmentDoctor, { color: colors.text, fontSize: fontSize.medium }]}>
          {appointment.doctorName}
        </Text>
        <View style={[
          styles.statusBadge, 
          { 
            backgroundColor: appointment.status === 'Completed' 
              ? '#4CAF50' + '20' 
              : '#F44336' + '20' 
          }
        ]}>
          <Text style={[
            styles.statusText, 
            { 
              color: appointment.status === 'Completed' ? '#4CAF50' : '#F44336',
              fontSize: fontSize.small
            }
          ]}>
            {appointment.status}
          </Text>
        </View>
      </View>
      
      <Text style={[styles.appointmentSpecialty, { color: colors.text, fontSize: fontSize.small }]}>
        {appointment.specialty}
      </Text>
      
      <View style={styles.appointmentDetails}>
        <View style={styles.appointmentDetail}>
          <Ionicons name="calendar" size={14} color={colors.primary} />
          <Text style={[styles.detailText, { color: colors.text, fontSize: fontSize.small }]}>
            {appointment.date}
          </Text>
        </View>
        
        <View style={styles.appointmentDetail}>
          <Ionicons name="time" size={14} color={colors.primary} />
          <Text style={[styles.detailText, { color: colors.text, fontSize: fontSize.small }]}>
            {appointment.time}
          </Text>
        </View>
      </View>
      
      {appointment.notes && (
        <Text style={[styles.appointmentNotes, { color: colors.text, fontSize: fontSize.small }]}>
          Notes: {appointment.notes}
        </Text>
      )}
      
      {appointment.status === 'Completed' && (
        <TouchableOpacity style={[styles.scheduleFollowup, { borderColor: colors.primary }]}>
          <Text style={[styles.followupText, { color: colors.primary, fontSize: fontSize.small }]}>
            Schedule Follow-up
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const TelemedicineScreen = () => {
  const { colors, fontSize } = useTheme();
  const [activeTab, setActiveTab] = useState('doctors');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredDoctors, setFilteredDoctors] = useState(DOCTORS);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [isInCall, setIsInCall] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const handleSearch = (text) => {
    setSearchQuery(text);
    if (text.trim() === '') {
      setFilteredDoctors(DOCTORS);
    } else {
      const filtered = DOCTORS.filter(
        doctor => 
          doctor.name.toLowerCase().includes(text.toLowerCase()) ||
          doctor.specialty.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredDoctors(filtered);
    }
  };
  
  const handleDoctorSelect = (doctor) => {
    setSelectedDoctor(doctor);
  };
  
  const startVideoCall = () => {
    setLoading(true);
    
    // Simulate connection delay
    setTimeout(() => {
      setLoading(false);
      setIsInCall(true);
    }, 2000);
  };
  
  const endCall = () => {
    setIsInCall(false);
    
    // Show feedback prompt
    Alert.alert(
      'Call Ended',
      'How would you rate your appointment?',
      [
        {
          text: 'Rate Later',
          style: 'cancel',
        },
        {
          text: 'Submit Feedback',
          onPress: () => console.log('Feedback submitted'),
        },
      ]
    );
  };
  
  const renderVideoCall = () => (
    <View style={styles.videoCallContainer}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text, fontSize: fontSize.medium }]}>
            Connecting to doctor...
          </Text>
        </View>
      ) : (
        <>
          <View style={[styles.videoContainer, { backgroundColor: colors.card }]}>
            <View style={styles.remoteVideo}>
              <Image 
                source={{ uri: 'https://source.unsplash.com/random/400x600/?doctor' }} 
                style={styles.remoteVideoStream}
              />
              <Text style={styles.remoteName}>
                {selectedDoctor.name}
              </Text>
            </View>
            
            <View style={styles.localVideo}>
              <Image 
                source={{ uri: 'https://source.unsplash.com/random/100x100/?senior' }} 
                style={styles.localVideoStream}
              />
            </View>
          </View>
          
          <View style={styles.callControls}>
            <TouchableOpacity style={[styles.controlButton, { backgroundColor: colors.background }]}>
              <Ionicons name="mic-off" size={24} color={colors.text} />
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.controlButton, { backgroundColor: colors.background }]}>
              <Ionicons name="videocam-off" size={24} color={colors.text} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.endCallButton, { backgroundColor: '#F44336' }]}
              onPress={endCall}
            >
              <Ionicons name="call" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.controlButton, { backgroundColor: colors.background }]}>
              <Ionicons name="chatbubble" size={24} color={colors.text} />
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.controlButton, { backgroundColor: colors.background }]}>
              <Ionicons name="settings" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
  
  const renderDoctorDetails = () => (
    <ScrollView style={styles.doctorDetailsContainer}>
      <View style={styles.doctorHeader}>
        <Image source={{ uri: selectedDoctor.image }} style={styles.detailDoctorImage} />
        
        <View style={styles.doctorHeaderInfo}>
          <Text style={[styles.detailDoctorName, { color: colors.text, fontSize: fontSize.large }]}>
            {selectedDoctor.name}
          </Text>
          <Text style={[styles.detailDoctorSpecialty, { color: colors.text, fontSize: fontSize.medium }]}>
            {selectedDoctor.specialty}
          </Text>
          
          <View style={styles.doctorRating}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Ionicons 
                key={star}
                name={star <= Math.floor(selectedDoctor.rating) ? "star" : (star <= selectedDoctor.rating + 0.5 ? "star-half" : "star-outline")}
                size={18} 
                color="#FFD700" 
              />
            ))}
            <Text style={[styles.ratingText, { color: colors.text, fontSize: fontSize.small }]}>
              ({selectedDoctor.rating})
            </Text>
          </View>
        </View>
      </View>
      
      <View style={[styles.doctorBioSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.bioSectionTitle, { color: colors.text, fontSize: fontSize.medium }]}>
          About Doctor
        </Text>
        <Text style={[styles.bioText, { color: colors.text, fontSize: fontSize.small }]}>
          {selectedDoctor.bio}
        </Text>
        
        <View style={styles.doctorAttributes}>
          <View style={styles.attribute}>
            <MaterialCommunityIcons name="certificate" size={24} color={colors.primary} />
            <Text style={[styles.attributeLabel, { color: colors.text, fontSize: fontSize.small }]}>
              Experience
            </Text>
            <Text style={[styles.attributeValue, { color: colors.text, fontSize: fontSize.medium }]}>
              {selectedDoctor.experience} Years
            </Text>
          </View>
          
          <View style={styles.attribute}>
            <Ionicons name="language" size={24} color={colors.primary} />
            <Text style={[styles.attributeLabel, { color: colors.text, fontSize: fontSize.small }]}>
              Languages
            </Text>
            <Text style={[styles.attributeValue, { color: colors.text, fontSize: fontSize.medium }]}>
              English, Spanish
            </Text>
          </View>
        </View>
      </View>
      
      <View style={[styles.availabilitySection, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text, fontSize: fontSize.medium }]}>
          Next Available Slot
        </Text>
        
        <View style={[styles.timeSlot, { backgroundColor: colors.primary + '20', borderColor: colors.primary }]}>
          <Ionicons name="calendar" size={20} color={colors.primary} />
          <Text style={[styles.timeSlotText, { color: colors.primary, fontSize: fontSize.medium }]}>
            {selectedDoctor.availability}
          </Text>
        </View>
        
        <TouchableOpacity
          style={[styles.scheduleButton, { backgroundColor: colors.primary }]}
          onPress={startVideoCall}
        >
          <Ionicons name="videocam" size={20} color="#FFFFFF" />
          <Text style={styles.scheduleButtonText}>
            Start Video Consultation
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
  
  const renderDoctorsTab = () => (
    <>
      <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Ionicons name="search" size={20} color="gray" />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search doctors by name or specialty..."
          placeholderTextColor="gray"
          value={searchQuery}
          onChangeText={handleSearch}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch('')}>
            <Ionicons name="close-circle" size={20} color="gray" />
          </TouchableOpacity>
        )}
      </View>
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.specialtiesSection}>
          <Text style={[styles.sectionTitle, { color: colors.text, fontSize: fontSize.medium }]}>
            Popular Specialties
          </Text>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.specialtiesScroll}>
            <TouchableOpacity style={[styles.specialtyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name="heart" size={24} color={colors.primary} />
              <Text style={[styles.specialtyName, { color: colors.text, fontSize: fontSize.small }]}>
                Cardiology
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.specialtyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name="fitness" size={24} color={colors.primary} />
              <Text style={[styles.specialtyName, { color: colors.text, fontSize: fontSize.small }]}>
                Orthopedics
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.specialtyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name="medkit" size={24} color={colors.primary} />
              <Text style={[styles.specialtyName, { color: colors.text, fontSize: fontSize.small }]}>
                General Care
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.specialtyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name="eye" size={24} color={colors.primary} />
              <Text style={[styles.specialtyName, { color: colors.text, fontSize: fontSize.small }]}>
                Ophthalmology
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.specialtyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name="scan" size={24} color={colors.primary} />
              <Text style={[styles.specialtyName, { color: colors.text, fontSize: fontSize.small }]}>
                Neurology
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
        
        <View style={styles.availableDoctorsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text, fontSize: fontSize.medium }]}>
            Available Doctors
          </Text>
          
          {filteredDoctors.length === 0 ? (
            <View style={styles.emptyResult}>
              <Ionicons name="search" size={40} color={colors.primary} />
              <Text style={[styles.emptyResultText, { color: colors.text, fontSize: fontSize.medium }]}>
                No doctors found matching "{searchQuery}"
              </Text>
            </View>
          ) : (
            filteredDoctors.map((doctor) => (
              <DoctorCard key={doctor.id} doctor={doctor} onPress={handleDoctorSelect} />
            ))
          )}
        </View>
      </ScrollView>
    </>
  );
  
  const renderHistoryTab = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.historySection}>
        <Text style={[styles.sectionTitle, { color: colors.text, fontSize: fontSize.medium }]}>
          Your Appointment History
        </Text>
        
        {APPOINTMENT_HISTORY.map((appointment) => (
          <AppointmentHistoryItem key={appointment.id} appointment={appointment} />
        ))}
      </View>
    </ScrollView>
  );
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {isInCall ? (
        renderVideoCall()
      ) : selectedDoctor ? (
        <>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: colors.primary }]}
            onPress={() => setSelectedDoctor(null)}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            <Text style={styles.backButtonText}>Back to Doctors</Text>
          </TouchableOpacity>
          
          {renderDoctorDetails()}
        </>
      ) : (
        <>
          <Text style={[styles.title, { color: colors.text, fontSize: fontSize.large }]}>
            Video Consultation
          </Text>
          
          <View style={styles.tabsContainer}>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'doctors' && [styles.activeTab, { borderColor: colors.primary }]
              ]}
              onPress={() => setActiveTab('doctors')}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: colors.text, fontSize: fontSize.medium },
                  activeTab === 'doctors' && { color: colors.primary, fontWeight: 'bold' }
                ]}
              >
                Find Doctors
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'history' && [styles.activeTab, { borderColor: colors.primary }]
              ]}
              onPress={() => setActiveTab('history')}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: colors.text, fontSize: fontSize.medium },
                  activeTab === 'history' && { color: colors.primary, fontWeight: 'bold' }
                ]}
              >
                Appointment History
              </Text>
            </TouchableOpacity>
          </View>
          
          {activeTab === 'doctors' ? renderDoctorsTab() : renderHistoryTab()}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomWidth: 2,
  },
  tabText: {
    fontWeight: '500',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    marginRight: 8,
  },
  specialtiesSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
  },
  specialtiesScroll: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  specialtyCard: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginRight: 16,
    minWidth: 100,
    borderWidth: 1,
  },
  specialtyName: {
    marginTop: 6,
    textAlign: 'center',
  },
  availableDoctorsSection: {
    marginBottom: 20,
  },
  doctorCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  doctorImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 16,
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  doctorSpecialty: {
    marginBottom: 8,
  },
  doctorStats: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statText: {
    marginLeft: 4,
  },
  availabilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  availabilityText: {
    marginLeft: 4,
    fontWeight: '500',
  },
  chevron: {
    marginLeft: 8,
  },
  emptyResult: {
    alignItems: 'center',
    padding: 30,
  },
  emptyResultText: {
    marginTop: 12,
    textAlign: 'center',
  },
  historySection: {
    marginBottom: 20,
  },
  appointmentItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  appointmentDoctor: {
    fontWeight: 'bold',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  statusText: {
    fontWeight: '500',
  },
  appointmentSpecialty: {
    marginBottom: 8,
  },
  appointmentDetails: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  appointmentDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  detailText: {
    marginLeft: 4,
  },
  appointmentNotes: {
    marginBottom: 12,
    fontStyle: 'italic',
  },
  scheduleFollowup: {
    alignSelf: 'flex-start',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  followupText: {
    fontWeight: '500',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  backButtonText: {
    color: '#FFFFFF',
    marginLeft: 8,
    fontWeight: '500',
  },
  doctorDetailsContainer: {
    flex: 1,
  },
  doctorHeader: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'center',
  },
  detailDoctorImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginRight: 20,
  },
  doctorHeaderInfo: {
    flex: 1,
  },
  detailDoctorName: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  detailDoctorSpecialty: {
    marginBottom: 8,
  },
  doctorRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 6,
  },
  doctorBioSection: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
  },
  bioSectionTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  bioText: {
    lineHeight: 20,
    marginBottom: 16,
  },
  doctorAttributes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  attribute: {
    alignItems: 'center',
    flex: 1,
  },
  attributeLabel: {
    marginTop: 4,
    marginBottom: 4,
  },
  attributeValue: {
    fontWeight: 'bold',
  },
  availabilitySection: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
  },
  timeSlot: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
  },
  timeSlotText: {
    fontWeight: 'bold',
    marginLeft: 8,
  },
  scheduleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
  },
  scheduleButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 16,
  },
  videoCallContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    textAlign: 'center',
  },
  videoContainer: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  remoteVideo: {
    width: '100%',
    height: '100%',
  },
  remoteVideoStream: {
    width: '100%',
    height: '100%',
  },
  remoteName: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    color: '#FFFFFF',
    padding: 8,
    borderRadius: 8,
  },
  localVideo: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 100,
    height: 150,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  localVideoStream: {
    width: '100%',
    height: '100%',
  },
  callControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 16,
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  endCallButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '135deg' }],
  },
});

export default TelemedicineScreen;
