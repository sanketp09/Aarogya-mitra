
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  participants: number;
  description: string;
}

interface CommunityMember {
  id: string;
  name: string;
  age: number;
  interests: string[];
  online: boolean;
}

interface Message {
  id: string;
  sender: string;
  text: string;
  time: string;
  isUser: boolean;
}

const SocialScreen = () => {
  const { colors, fontSize } = useTheme();
  const [activeTab, setActiveTab] = useState('events');
  const [messageInput, setMessageInput] = useState('');

  const [events] = useState<Event[]>([
    {
      id: '1',
      title: 'Virtual Bingo Night',
      date: 'April 15, 2023',
      time: '7:00 PM',
      participants: 12,
      description: 'Join us for a fun evening of virtual bingo with prizes!'
    },
    {
      id: '2',
      title: 'Book Club Discussion',
      date: 'April 18, 2023',
      time: '3:00 PM',
      participants: 8,
      description: 'We\'ll be discussing "The Thursday Murder Club" by Richard Osman.'
    },
    {
      id: '3',
      title: 'Chair Yoga Session',
      date: 'April 20, 2023',
      time: '10:00 AM',
      participants: 15,
      description: 'Gentle yoga exercises you can do from a chair with instructor Sarah.'
    }
  ]);

  const [members] = useState<CommunityMember[]>([
    {
      id: '1',
      name: 'Eleanor Wilson',
      age: 72,
      interests: ['Reading', 'Gardening', 'Chess'],
      online: true
    },
    {
      id: '2',
      name: 'Robert Thompson',
      age: 68,
      interests: ['Photography', 'Hiking', 'History'],
      online: false
    },
    {
      id: '3',
      name: 'Margaret Davis',
      age: 75,
      interests: ['Cooking', 'Painting', 'Music'],
      online: true
    }
  ]);

  const [messages] = useState<Message[]>([
    {
      id: '1',
      sender: 'John Smith',
      text: 'Hello everyone! How is everyone doing today?',
      time: '10:15 AM',
      isUser: false
    },
    {
      id: '2',
      sender: 'Mary Johnson',
      text: 'I\'m doing great, thanks for asking! Looking forward to the bingo night tomorrow.',
      time: '10:18 AM',
      isUser: false
    },
    {
      id: '3',
      sender: 'You',
      text: 'I\'m excited for bingo night too! Does anyone know if we need to prepare anything?',
      time: '10:22 AM',
      isUser: true
    }
  ]);

  const renderEventItem = ({ item }: { item: Event }) => (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.cardTitle, { color: colors.text, fontSize: fontSize.medium }]}>{item.title}</Text>
      <View style={styles.eventDetails}>
        <View style={styles.eventDetail}>
          <Ionicons name="calendar" size={16} color={colors.primary} />
          <Text style={[styles.eventDetailText, { color: colors.text, fontSize: fontSize.small }]}>
            {item.date}
          </Text>
        </View>
        <View style={styles.eventDetail}>
          <Ionicons name="time" size={16} color={colors.primary} />
          <Text style={[styles.eventDetailText, { color: colors.text, fontSize: fontSize.small }]}>
            {item.time}
          </Text>
        </View>
        <View style={styles.eventDetail}>
          <Ionicons name="people" size={16} color={colors.primary} />
          <Text style={[styles.eventDetailText, { color: colors.text, fontSize: fontSize.small }]}>
            {item.participants} participants
          </Text>
        </View>
      </View>
      <Text style={[styles.cardDescription, { color: colors.text, fontSize: fontSize.small }]}>
        {item.description}
      </Text>
      <TouchableOpacity 
        style={[styles.cardButton, { backgroundColor: colors.primary }]}
        onPress={() => {/* Join event */}}
      >
        <Text style={styles.cardButtonText}>Join Event</Text>
      </TouchableOpacity>
    </View>
  );

  const renderMemberItem = ({ item }: { item: CommunityMember }) => (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.memberHeader}>
        <View style={styles.memberInfo}>
          <Text style={[styles.cardTitle, { color: colors.text, fontSize: fontSize.medium }]}>{item.name}</Text>
          <Text style={[styles.ageText, { color: colors.text, fontSize: fontSize.small }]}>Age: {item.age}</Text>
        </View>
        <View style={[
          styles.onlineIndicator, 
          { backgroundColor: item.online ? '#4CAF50' : '#9E9E9E' }
        ]} />
      </View>
      <Text style={[styles.interestsTitle, { color: colors.text, fontSize: fontSize.small }]}>Interests:</Text>
      <View style={styles.interestTags}>
        {item.interests.map((interest, index) => (
          <View 
            key={index} 
            style={[styles.interestTag, { backgroundColor: colors.secondary }]}
          >
            <Text style={[styles.interestTagText, { color: colors.text, fontSize: fontSize.xsmall }]}>
              {interest}
            </Text>
          </View>
        ))}
      </View>
      <View style={styles.memberActions}>
        <TouchableOpacity 
          style={[styles.memberActionButton, { backgroundColor: colors.primary, opacity: item.online ? 1 : 0.5 }]}
          disabled={!item.online}
          onPress={() => {/* Start chat */}}
        >
          <Ionicons name="chatbubble" size={16} color="#FFF" />
          <Text style={styles.memberActionText}>{item.online ? 'Chat' : 'Offline'}</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.memberActionButton, { backgroundColor: colors.secondary }]}
          onPress={() => {/* Connect */}}
        >
          <Ionicons name="person-add" size={16} color={colors.text} />
          <Text style={[styles.memberActionText, { color: colors.text }]}>Connect</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderMessageItem = ({ item }: { item: Message }) => (
    <View style={[
      styles.messageContainer,
      item.isUser ? styles.userMessageContainer : styles.otherMessageContainer
    ]}>
      {!item.isUser && (
        <Text style={[styles.messageSender, { color: colors.text, fontSize: fontSize.small }]}>
          {item.sender}
        </Text>
      )}
      <View style={[
        styles.messageBubble,
        item.isUser 
          ? { backgroundColor: colors.primary } 
          : { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }
      ]}>
        <Text style={[
          styles.messageText, 
          { color: item.isUser ? '#FFF' : colors.text, fontSize: fontSize.small }
        ]}>
          {item.text}
        </Text>
        <Text style={[
          styles.messageTime,
          { color: item.isUser ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.5)', fontSize: fontSize.xsmall }
        ]}>
          {item.time}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text, fontSize: fontSize.large }]}>
        Virtual Social Club
      </Text>
      
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[
            styles.tab,
            activeTab === 'events' && styles.activeTab,
            { borderBottomColor: activeTab === 'events' ? colors.primary : 'transparent' }
          ]}
          onPress={() => setActiveTab('events')}
        >
          <Text style={[
            styles.tabText,
            { color: activeTab === 'events' ? colors.primary : colors.text, fontSize: fontSize.medium }
          ]}>
            Events
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.tab,
            activeTab === 'members' && styles.activeTab,
            { borderBottomColor: activeTab === 'members' ? colors.primary : 'transparent' }
          ]}
          onPress={() => setActiveTab('members')}
        >
          <Text style={[
            styles.tabText,
            { color: activeTab === 'members' ? colors.primary : colors.text, fontSize: fontSize.medium }
          ]}>
            Members
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.tab,
            activeTab === 'chat' && styles.activeTab,
            { borderBottomColor: activeTab === 'chat' ? colors.primary : 'transparent' }
          ]}
          onPress={() => setActiveTab('chat')}
        >
          <Text style={[
            styles.tabText,
            { color: activeTab === 'chat' ? colors.primary : colors.text, fontSize: fontSize.medium }
          ]}>
            Group Chat
          </Text>
        </TouchableOpacity>
      </View>
      
      {activeTab === 'events' && (
        <FlatList
          data={events}
          renderItem={renderEventItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}
      
      {activeTab === 'members' && (
        <FlatList
          data={members}
          renderItem={renderMemberItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}
      
      {activeTab === 'chat' && (
        <View style={styles.chatContainer}>
          <FlatList
            data={messages}
            renderItem={renderMessageItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.chatListContent}
            style={styles.chatList}
          />
          
          <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <TextInput
              style={[styles.textInput, { color: colors.text, backgroundColor: colors.background }]}
              placeholder="Type your message..."
              placeholderTextColor="gray"
              value={messageInput}
              onChangeText={setMessageInput}
            />
            <TouchableOpacity style={[styles.sendButton, { backgroundColor: colors.primary }]}>
              <Ionicons name="send" size={18} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>
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
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
  },
  activeTab: {},
  tabText: {
    fontWeight: '500',
  },
  listContent: {
    paddingBottom: 20,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  cardTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  eventDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  eventDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  eventDetailText: {
    marginLeft: 4,
  },
  cardDescription: {
    marginBottom: 12,
  },
  cardButton: {
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  cardButtonText: {
    color: '#FFF',
    fontWeight: '500',
  },
  memberHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  memberInfo: {
    flex: 1,
  },
  ageText: {
    marginTop: 2,
  },
  onlineIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  interestsTitle: {
    fontWeight: '500',
    marginBottom: 6,
  },
  interestTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  interestTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    marginRight: 6,
    marginBottom: 6,
  },
  interestTagText: {
    fontWeight: '500',
  },
  memberActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  memberActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flex: 0.48,
  },
  memberActionText: {
    marginLeft: 6,
    fontWeight: '500',
    color: '#FFF',
  },
  chatContainer: {
    flex: 1,
  },
  chatList: {
    flex: 1,
  },
  chatListContent: {
    paddingVertical: 12,
  },
  messageContainer: {
    marginBottom: 12,
    maxWidth: '80%',
  },
  userMessageContainer: {
    alignSelf: 'flex-end',
  },
  otherMessageContainer: {
    alignSelf: 'flex-start',
  },
  messageSender: {
    fontWeight: '500',
    marginBottom: 2,
  },
  messageBubble: {
    borderRadius: 16,
    padding: 12,
    borderTopRightRadius: 4,
  },
  messageText: {
    marginBottom: 4,
  },
  messageTime: {
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderTopWidth: 1,
  },
  textInput: {
    flex: 1,
    padding: 10,
    borderRadius: 20,
    marginRight: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SocialScreen;
