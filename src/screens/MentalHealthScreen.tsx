import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  Modal
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { Camera } from 'expo-camera';

// Mock AI responses for demonstration
const AI_RESPONSES = {
  'feeling sad': "I'm sorry to hear that you're feeling sad. Remember that it's okay to feel this way sometimes. Would you like some suggestions for activities that might help lift your mood?",
  'feeling anxious': "Anxiety can be challenging. Let's try a quick breathing exercise: breathe in for 4 counts, hold for 2, and exhale for 6. Would you like to explore some more techniques for managing anxiety?",
  'trouble sleeping': "Sleep issues can be frustrating. Some tips that might help include establishing a regular sleep schedule, avoiding screens before bed, and creating a calm environment. Would you like more specific suggestions?",
  'feeling lonely': "Feeling lonely is a common experience. Consider reaching out to a friend or family member, joining a local community group, or participating in our Virtual Social Club. Human connection is important for our wellbeing.",
  'meditation': "Meditation can be very beneficial for mental health. Would you like me to guide you through a short 5-minute meditation exercise right now?",
  'hello': "Hello there! I'm your mental health companion. How are you feeling today?",
  'help': "I'm here to provide mental health support and resources. You can talk about how you're feeling, ask for coping strategies, or learn about managing stress, anxiety, depression, or other mental health concerns."
};

// Mock emotions data for facial analysis demonstration
const EMOTIONS = {
  happy: 0,
  sad: 0,
  angry: 0,
  fearful: 0,
  disgusted: 0,
  surprised: 0,
  neutral: 0
};

// Mental health questions for assessment
const MENTAL_HEALTH_QUESTIONS = [
  "How often have you felt down, depressed, or hopeless over the past two weeks?",
  "Do you find it difficult to fall asleep or stay asleep?",
  "How would you rate your energy levels throughout the day?",
  "Do you often feel anxious or worried about different aspects of your life?",
  "How would you describe your ability to concentrate on tasks?",
  "How often do you feel overwhelmed by your responsibilities?",
  "Do you experience frequent mood swings?",
  "How would you rate your overall satisfaction with life currently?"
];

const MoodButton = ({ mood, icon, selected, onPress }) => {
  const { colors } = useTheme();
  
  return (
    <TouchableOpacity
      style={[
        styles.moodButton,
        { 
          backgroundColor: selected ? colors.primary : colors.card,
          borderColor: colors.border
        }
      ]}
      onPress={onPress}
    >
      <Ionicons 
        name={icon} 
        size={24} 
        color={selected ? '#FFFFFF' : colors.text} 
      />
      <Text 
        style={[
          styles.moodButtonText, 
          { color: selected ? '#FFFFFF' : colors.text }
        ]}
      >
        {mood}
      </Text>
    </TouchableOpacity>
  );
};

const ResourceCard = ({ title, description, icon }) => {
  const { colors, fontSize } = useTheme();
  
  return (
    <TouchableOpacity style={[styles.resourceCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Ionicons name={icon} size={24} color={colors.primary} style={styles.resourceIcon} />
      <View style={styles.resourceContent}>
        <Text style={[styles.resourceTitle, { color: colors.text, fontSize: fontSize.medium }]}>
          {title}
        </Text>
        <Text style={[styles.resourceDescription, { color: colors.text, fontSize: fontSize.small }]}>
          {description}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.text} />
    </TouchableOpacity>
  );
};

const ChatBubble = ({ message, isUser }) => {
  const { colors, fontSize } = useTheme();
  
  return (
    <View style={[
      styles.chatBubble,
      isUser ? styles.userBubble : styles.aiBubble,
      { 
        backgroundColor: isUser ? colors.primary : colors.card,
        borderColor: isUser ? colors.primary : colors.border
      }
    ]}>
      <Text style={[
        styles.chatText,
        { 
          color: isUser ? '#FFFFFF' : colors.text,
          fontSize: fontSize.medium
        }
      ]}>
        {message.text}
      </Text>
    </View>
  );
};

const FacialAnalysisButton = ({ onPress, analyzing }) => {
  const { colors } = useTheme();
  
  return (
    <TouchableOpacity
      style={[
        styles.facialAnalysisButton,
        { 
          backgroundColor: analyzing ? colors.error : colors.primary,
          borderColor: colors.border
        }
      ]}
      onPress={onPress}
    >
      <Ionicons 
        name={analyzing ? "stop-circle" : "camera"} 
        size={24} 
        color="#FFFFFF" 
      />
      <Text style={styles.facialAnalysisButtonText}>
        {analyzing ? "Stop Analysis" : "Start Facial Analysis"}
      </Text>
    </TouchableOpacity>
  );
};

const EmotionBar = ({ emotion, value, maxValue }) => {
  const { colors } = useTheme();
  const percentage = (value / maxValue) * 100;
  
  // Colors for different emotions
  const getEmotionColor = (emotion) => {
    switch(emotion) {
      case 'happy': return '#4CAF50';
      case 'sad': return '#2196F3';
      case 'angry': return '#F44336';
      case 'fearful': return '#9C27B0';
      case 'disgusted': return '#795548';
      case 'surprised': return '#FF9800';
      case 'neutral': return '#607D8B';
      default: return colors.primary;
    }
  };
  
  return (
    <View style={styles.emotionBarContainer}>
      <Text style={[styles.emotionLabel, { color: colors.text }]}>
        {emotion.charAt(0).toUpperCase() + emotion.slice(1)}
      </Text>
      <View style={[styles.emotionBarBackground, { backgroundColor: colors.card }]}>
        <View 
          style={[
            styles.emotionBarFill, 
            { 
              width: `${percentage}%`, 
              backgroundColor: getEmotionColor(emotion) 
            }
          ]} 
        />
      </View>
      <Text style={[styles.emotionValue, { color: colors.text }]}>
        {Math.round(value * 100)}%
      </Text>
    </View>
  );
};

const MentalHealthScreen = () => {
  const { colors, fontSize } = useTheme();
  const [activeTab, setActiveTab] = useState('chat');
  const [selectedMood, setSelectedMood] = useState(null);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { id: '1', text: 'Hello! I\'m your mental health companion. How are you feeling today?', isUser: false },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  
  // Facial Analysis State
  const [hasPermission, setHasPermission] = useState(null);
  const [cameraRef, setCameraRef] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentEmotions, setCurrentEmotions] = useState({...EMOTIONS, neutral: 1});
  const [emotionHistory, setEmotionHistory] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [showReport, setShowReport] = useState(false);
  const [reportData, setReportData] = useState(null);
  
  const flatListRef = useRef(null);
  
  useEffect(() => {
    // Scroll to the bottom whenever messages change
    if (flatListRef.current && chatMessages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [chatMessages]);
  
  useEffect(() => {
    // Request camera permissions
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await Camera.requestCameraPermissionsAsync();
        setHasPermission(status === 'granted');
      }
    })();
  }, []);
  
  // Simulated facial analysis function
  const analyzeFacialExpression = () => {
    // This would normally connect to a real facial recognition API
    // For demonstration, we'll generate random emotion values
    
    if (!isAnalyzing) return;
    
    const emotions = { 
      happy: Math.random() * 0.3,
      sad: Math.random() * 0.2,
      angry: Math.random() * 0.1,
      fearful: Math.random() * 0.15,
      disgusted: Math.random() * 0.05,
      surprised: Math.random() * 0.1,
      neutral: Math.random() * 0.4
    };
    
    // Normalize so they add up to 1
    const total = Object.values(emotions).reduce((sum, val) => sum + val, 0);
    const normalizedEmotions = {};
    
    Object.keys(emotions).forEach(key => {
      normalizedEmotions[key] = emotions[key] / total;
    });
    
    setCurrentEmotions(normalizedEmotions);
    
    // Store emotion data with timestamp and current question
    setEmotionHistory(prev => [
      ...prev, 
      { 
        timestamp: new Date().toISOString(),
        question: MENTAL_HEALTH_QUESTIONS[currentQuestionIndex],
        emotions: normalizedEmotions
      }
    ]);
  };
  
  useEffect(() => {
    let interval;
    
    if (isAnalyzing) {
      // Update facial analysis every second
      interval = setInterval(analyzeFacialExpression, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAnalyzing, currentQuestionIndex]);
  
  const toggleFacialAnalysis = () => {
    setIsAnalyzing(!isAnalyzing);
    
    if (isAnalyzing) {
      // If stopping analysis, reset for next question
      setCurrentQuestionIndex(prev => {
        if (prev < MENTAL_HEALTH_QUESTIONS.length - 1) {
          return prev + 1;
        } else {
          // All questions completed, generate report
          generateFacialAnalysisReport();
          return 0;
        }
      });
    }
  };
  
  const recordAnswer = (answer) => {
    setAnswers(prev => [...prev, { 
      question: MENTAL_HEALTH_QUESTIONS[currentQuestionIndex],
      answer, 
      emotions: {...currentEmotions}
    }]);
    
    if (currentQuestionIndex < MENTAL_HEALTH_QUESTIONS.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // All questions answered, generate report
      generateFacialAnalysisReport();
    }
  };
  
  const generateFacialAnalysisReport = () => {
    // Calculate average emotions across all questions
    const avgEmotions = {...EMOTIONS};
    let totalEntries = emotionHistory.length;
    
    if (totalEntries === 0) {
      // If no entries, use neutral as fallback
      setReportData({
        averageEmotions: {...EMOTIONS, neutral: 1},
        dominantEmotion: 'neutral',
        emotionalVariability: 0,
        answers,
        recommendations: [
          "Consider enabling facial analysis for more insights",
          "Regular mental health check-ins are recommended",
          "Practice mindfulness meditation"
        ]
      });
    } else {
      emotionHistory.forEach(entry => {
        Object.keys(entry.emotions).forEach(emotion => {
          avgEmotions[emotion] = (avgEmotions[emotion] || 0) + entry.emotions[emotion];
        });
      });
      
      // Normalize averages
      Object.keys(avgEmotions).forEach(emotion => {
        avgEmotions[emotion] = avgEmotions[emotion] / totalEntries;
      });
      
      // Find dominant emotion
      let dominantEmotion = 'neutral';
      let maxValue = 0;
      
      Object.entries(avgEmotions).forEach(([emotion, value]) => {
        if (value > maxValue) {
          maxValue = value;
          dominantEmotion = emotion;
        }
      });
      
      // Calculate emotional variability (standard deviation)
      const emotionalVariability = calculateEmotionalVariability(emotionHistory);
      
      // Generate personalized recommendations
      const recommendations = generateRecommendations(dominantEmotion, emotionalVariability, answers);
      
      // Set report data
      setReportData({
        averageEmotions: avgEmotions,
        dominantEmotion,
        emotionalVariability,
        answers,
        recommendations
      });
    }
    
    // Show report modal
    setShowReport(true);
  };
  
  // Calculate emotional variability
  const calculateEmotionalVariability = (history) => {
    // This is a simplified measure - would be more sophisticated in a real app
    const emotionChanges = [];
    
    for (let i = 1; i < history.length; i++) {
      let change = 0;
      
      Object.keys(EMOTIONS).forEach(emotion => {
        const diff = Math.abs(
          history[i].emotions[emotion] - 
          history[i-1].emotions[emotion]
        );
        change += diff;
      });
      
      emotionChanges.push(change);
    }
    
    // Calculate average change
    return emotionChanges.length > 0 
      ? emotionChanges.reduce((sum, val) => sum + val, 0) / emotionChanges.length
      : 0;
  };
  
  // Generate recommendations based on facial analysis
  const generateRecommendations = (dominantEmotion, variability, answers) => {
    const recommendations = [];
    
    // Based on dominant emotion
    switch(dominantEmotion) {
      case 'happy':
        recommendations.push("Continue activities that bring you joy");
        recommendations.push("Share your positive experiences with others");
        break;
      case 'sad':
        recommendations.push("Consider speaking with a mental health professional");
        recommendations.push("Engage in activities you enjoy or find meaningful");
        recommendations.push("Establish a regular exercise routine");
        break;
      case 'angry':
        recommendations.push("Practice anger management techniques");
        recommendations.push("Try journaling about your emotions");
        recommendations.push("Take short breaks when feeling overwhelmed");
        break;
      case 'fearful':
        recommendations.push("Try anxiety-reduction techniques like deep breathing");
        recommendations.push("Consider cognitive behavioral therapy approaches");
        recommendations.push("Limit exposure to stress triggers when possible");
        break;
      case 'neutral':
        recommendations.push("Continue regular mental health check-ins");
        recommendations.push("Practice mindfulness meditation");
        break;
      default:
        recommendations.push("Consider speaking with a mental health professional");
        recommendations.push("Practice self-care and stress reduction techniques");
    }
    
    // Based on emotional variability
    if (variability > 0.3) {
      recommendations.push("Your emotional responses show significant variability");
      recommendations.push("Consider mood tracking to identify patterns");
    } else if (variability < 0.1) {
      recommendations.push("Your emotional responses show limited variation");
      recommendations.push("Try expressive activities like art or journaling");
    }
    
    return recommendations;
  };
  
  const handleMoodSelection = (mood) => {
    setSelectedMood(mood);
    
    // Add user's mood as a message
    const userMessage = { id: Date.now().toString(), text: `I'm feeling ${mood} today`, isUser: true };
    setChatMessages([...chatMessages, userMessage]);
    
    // Simulate AI response
    setIsTyping(true);
    setTimeout(() => {
      let response;
      switch (mood) {
        case 'Great':
          response = "I'm glad to hear you're feeling great today! That's wonderful. Is there anything specific that contributed to your positive mood?";
          break;
        case 'Good':
          response = "It's good to hear you're feeling well! Maintaining a positive outlook can help with overall wellbeing. Any highlights from your day so far?";
          break;
        case 'Okay':
          response = "Sometimes feeling okay is just fine. Is there anything on your mind that you'd like to talk about or any way I can support you today?";
          break;
        case 'Sad':
          response = "I'm sorry to hear you're feeling sad. Remember that it's okay to feel this way sometimes. Would you like to talk about what's causing this feeling?";
          break;
        case 'Stressed':
          response = "Stress can be challenging to manage. Would you like some simple relaxation techniques that might help reduce your stress levels?";
          break;
        default:
          response = "Thank you for sharing how you're feeling. I'm here to listen and support you.";
      }
      
      const aiMessage = { id: (Date.now() + 1).toString(), text: response, isUser: false };
      setChatMessages([...chatMessages, userMessage, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };
  
  const handleSendMessage = () => {
    if (chatInput.trim() === '') return;
    
    // Add user message
    const userMessage = { id: Date.now().toString(), text: chatInput, isUser: true };
    setChatMessages([...chatMessages, userMessage]);
    
    // Clear input
    setChatInput('');
    
    // Simulate AI response
    setIsTyping(true);
    setTimeout(() => {
      let response = "I understand you're sharing something important. I'm here to listen and support you. Can you tell me more about how you're feeling?";
      
      // Check for known keywords
      const lowerCaseInput = chatInput.toLowerCase();
      for (const keyword in AI_RESPONSES) {
        if (lowerCaseInput.includes(keyword)) {
          response = AI_RESPONSES[keyword];
          break;
        }
      }
      
      const aiMessage = { id: (Date.now() + 1).toString(), text: response, isUser: false };
      setChatMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };
  
  const renderChatTab = () => (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.chatContainer}
      keyboardVerticalOffset={100}
    >
      <View style={styles.moodTrackerContainer}>
        <Text style={[styles.moodPrompt, { color: colors.text, fontSize: fontSize.medium }]}>
          How are you feeling today?
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.moodButtonsScroll}>
          <MoodButton 
            mood="Great" 
            icon="happy" 
            selected={selectedMood === 'Great'} 
            onPress={() => handleMoodSelection('Great')}
          />
          <MoodButton 
            mood="Good" 
            icon="smile" 
            selected={selectedMood === 'Good'} 
            onPress={() => handleMoodSelection('Good')}
          />
          <MoodButton 
            mood="Okay" 
            icon="help-circle" 
            selected={selectedMood === 'Okay'} 
            onPress={() => handleMoodSelection('Okay')}
          />
          <MoodButton 
            mood="Sad" 
            icon="sad" 
            selected={selectedMood === 'Sad'} 
            onPress={() => handleMoodSelection('Sad')}
          />
          <MoodButton 
            mood="Stressed" 
            icon="flash" 
            selected={selectedMood === 'Stressed'} 
            onPress={() => handleMoodSelection('Stressed')}
          />
        </ScrollView>
      </View>
    
      <FlatList
        ref={flatListRef}
        data={chatMessages}
        renderItem={({ item }) => <ChatBubble message={item} isUser={item.isUser} />}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.chatList}
      />
      
      {isTyping && (
        <View style={[styles.typingIndicator, { backgroundColor: colors.card }]}>
          <Text style={{ color: colors.text }}>AI assistant is typing</Text>
          <ActivityIndicator size="small" color={colors.primary} style={styles.typingDots} />
        </View>
      )}
      
      <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <TextInput
          style={[styles.textInput, { color: colors.text, backgroundColor: colors.background }]}
          placeholder="Type your message..."
          placeholderTextColor="gray"
          value={chatInput}
          onChangeText={setChatInput}
          multiline
        />
        <TouchableOpacity 
          style={[styles.sendButton, { backgroundColor: colors.primary }]}
          onPress={handleSendMessage}
        >
          <Ionicons name="send" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
  
  const renderFacialAnalysisTab = () => (
    <View style={styles.facialAnalysisContainer}>
      <Text style={[styles.sectionTitle, { color: colors.text, fontSize: fontSize.large }]}>
        Facial Expression Analysis
      </Text>
      
      <Text style={[styles.description, { color: colors.text, fontSize: fontSize.medium }]}>
        This tool analyzes your facial expressions while answering mental health questions to provide additional insights about your emotional responses.
      </Text>
      
      {hasPermission === null ? (
        <Text style={{ color: colors.text }}>Requesting camera permission...</Text>
      ) : hasPermission === false ? (
        <Text style={{ color: colors.error }}>Camera access is required for facial analysis.</Text>
      ) : (
        <>
          <View style={styles.cameraContainer}>
            {isAnalyzing ? (
              <Camera
                style={styles.camera}
                type={Camera.Constants.Type.front}
                ref={ref => setCameraRef(ref)}
              />
            ) : (
              <View style={[styles.cameraPlaceholder, { backgroundColor: colors.card }]}>
                <Ionicons name="camera" size={48} color={colors.text} />
                <Text style={{ color: colors.text, marginTop: 10 }}>
                  Press Start to begin facial analysis
                </Text>
              </View>
            )}
          </View>
          
          <View style={styles.questionContainer}>
            <Text style={[styles.questionNumber, { color: colors.primary }]}>
              Question {currentQuestionIndex + 1} of {MENTAL_HEALTH_QUESTIONS.length}
            </Text>
            <Text style={[styles.question, { color: colors.text, fontSize: fontSize.medium }]}>
              {MENTAL_HEALTH_QUESTIONS[currentQuestionIndex]}
            </Text>
            
            <View style={styles.answerButtonsContainer}>
              <TouchableOpacity
                style={[styles.answerButton, { backgroundColor: colors.primary }]}
                onPress={() => recordAnswer("Never/Rarely")}
              >
                <Text style={styles.answerButtonText}>Never/Rarely</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.answerButton, { backgroundColor: colors.primary }]}
                onPress={() => recordAnswer("Sometimes")}
              >
                <Text style={styles.answerButtonText}>Sometimes</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.answerButton, { backgroundColor: colors.primary }]}
                onPress={() => recordAnswer("Often/Always")}
              >
                <Text style={styles.answerButtonText}>Often/Always</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.emotionsContainer}>
            <Text style={[styles.emotionsTitle, { color: colors.text }]}>
              Real-time Emotions:
            </Text>
            
            {Object.entries(currentEmotions).map(([emotion, value]) => (
              <EmotionBar 
                key={emotion} 
                emotion={emotion} 
                value={value} 
                maxValue={Math.max(...Object.values(currentEmotions))}
              />
            ))}
          </View>
          
          <FacialAnalysisButton 
            onPress={toggleFacialAnalysis} 
            analyzing={isAnalyzing} 
          />
        </>
      )}
      
      {/* Facial Analysis Report Modal */}
      <Modal
        visible={showReport}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowReport(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Facial Analysis Report
            </Text>
            
            {reportData && (
              <>
                <Text style={[styles.reportSection, { color: colors.text }]}>
                  Dominant Emotion: {reportData.dominantEmotion.charAt(0).toUpperCase() + reportData.dominantEmotion.slice(1)}
                </Text>
                
                <Text style={[styles.reportSubtitle, { color: colors.text }]}>
                  Average Emotional Response:
                </Text>
                
                {Object.entries(reportData.averageEmotions).map(([emotion, value]) => (
                  <EmotionBar 
                    key={emotion} 
                    emotion={emotion} 
                    value={value} 
                    maxValue={Math.max(...Object.values(reportData.averageEmotions))}
                  />
                ))}
                
                <Text style={[styles.reportSubtitle, { color: colors.text }]}>
                  Emotional Variability: {(reportData.emotionalVariability * 100).toFixed(1)}%
                </Text>
                
                <Text style={[styles.reportSubtitle, { color: colors.text }]}>
                  Recommendations:
                </Text>
                
                {reportData.recommendations.map((recommendation, index) => (
                  <Text key={index} style={[styles.recommendation, { color: colors.text }]}>
                    • {recommendation}
                  </Text>
                ))}
              </>
            )}
            
            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: colors.primary }]}
              onPress={() => {
                setShowReport(false);
                setEmotionHistory([]);
                setAnswers([]);
                setCurrentQuestionIndex(0);
              }}
            >
              <Text style={styles.closeButtonText}>Close Report</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
  
  const renderResourcesTab = () => (
    <ScrollView style={styles.resourcesContainer}>
      <View style={styles.resourceSection}>
        <Text style={[styles.sectionTitle, { color: colors.text, fontSize: fontSize.medium }]}>
          Guided Meditations
        </Text>
        
        <ResourceCard
          title="5-Minute Breathing Exercise"
          description="A quick meditation for stress relief"
          icon="cloud"
        />
        <ResourceCard
          title="Sleep Meditation"
          description="Gentle guidance to help you fall asleep"
          icon="moon"
        />
        <ResourceCard
          title="Morning Mindfulness"
          description="Start your day with clarity and purpose"
          icon="sunny"
        />
      </View>
      
      <View style={styles.resourceSection}>
        <Text style={[styles.sectionTitle, { color: colors.text, fontSize: fontSize.medium }]}>
          Mental Health Articles
        </Text>
        
        <ResourceCard
          title="Understanding Anxiety"
          description="Learn about symptoms and coping strategies"
          icon="information-circle"
        />
        <ResourceCard
          title="Improving Sleep Habits"
          description="Tips for better sleep quality"
          icon="bed"
        />
        <ResourceCard
          title="Building Resilience"
          description="Techniques to bounce back from challenges"
          icon="trending-up"
        />
      </View>
      
      <View style={styles.resourceSection}>
        <Text style={[styles.sectionTitle, { color: colors.text, fontSize: fontSize.medium }]}>
          Crisis Support
        </Text>
        
        <ResourceCard
          title="Crisis Helpline"
          description="24/7 support for urgent mental health needs"
          icon="call"
        />
        <ResourceCard
          title="Find a Therapist"
          description="Connect with mental health professionals"
          icon="people"
        />
      </View>
    </ScrollView>
  );
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text, fontSize: fontSize.large }]}>
        Mental Health Support
      </Text>
      
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'chat' && [styles.activeTab, { borderColor: colors.primary }]
          ]}
          onPress={() => setActiveTab('chat')}
        >
          <Text
            style={[
              styles.tabText,
              { color: colors.text, fontSize: fontSize.medium },
              activeTab === 'chat' && { color: colors.primary, fontWeight: 'bold' }
            ]}
          >
            AI Chatbot
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'facial' && [styles.activeTab, { borderColor: colors.primary }]
          ]}
          onPress={() => setActiveTab('facial')}
        >
          <Text
            style={[
              styles.tabText,
              { color: colors.text, fontSize: fontSize.medium },
              activeTab === 'facial' && { color: colors.primary, fontWeight: 'bold' }
            ]}
          >
            Facial Analysis
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'resources' && [styles.activeTab, { borderColor: colors.primary }]
          ]}
          onPress={() => setActiveTab('resources')}
        >
          <Text
            style={[
              styles.tabText,
              { color: colors.text, fontSize: fontSize.medium },
              activeTab === 'resources' && { color: colors.primary, fontWeight: 'bold' }
            ]}
          >
            Resources
          </Text>
        </TouchableOpacity>
      </View>
      
      {activeTab === 'chat' && renderChatTab()}
      {activeTab === 'facial' && renderFacialAnalysisTab()}
      {activeTab === 'resources' && renderResourcesTab()}
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
  chatContainer: {
    flex: 1,
  },
  moodTrackerContainer: {
    marginBottom: 16,
  },
  moodPrompt: {
    fontWeight: '500',
    marginBottom: 8,
  },
  moodButtonsScroll: {
    flexDirection: 'row',
  },
  moodButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    marginRight: 12,
    borderWidth: 1,
    minWidth: 80,
  },
  moodButtonText: {
    marginTop: 4,
    fontWeight: '500',
  },
  chatList: {
    paddingVertical: 8,
  },
  chatBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    marginBottom: 8,
    borderWidth: 1,
  },
  userBubble: {
    alignSelf: 'flex-end',
    borderTopRightRadius: 4,
  },
  aiBubble: {
    alignSelf: 'flex-start',
    borderTopLeftRadius: 4,
  },
  chatText: {
    lineHeight: 20,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    padding: 8,
    borderRadius: 16,
    marginBottom: 8,
  },
  typingDots: {
    marginLeft: 8,
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
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resourcesContainer: {
    flex: 1,
  },
  resourceSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
  },
  resourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  resourceIcon: {
    marginRight: 16,
  },
  resourceContent: {
    flex: 1,
  },
  resourceTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  resourceDescription: {
    opacity: 0.7,
  },
  facialAnalysisContainer: {
    flex: 1,
    padding: 16,
  },
  description: {
    marginBottom: 20,
  },
  cameraContainer: {
    height: 200,
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  camera: {
    flex: 1,
  },
  cameraPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  questionContainer: {
    marginBottom: 20,
  },
  questionNumber: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  question: {
    fontWeight: '500',
    marginBottom: 16,
  },
  answerButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  answerButton: {
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  answerButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  emotionsContainer: {
    marginVertical: 16,
  },
  emotionsTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emotionBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  emotionLabel: {
    width: 80,
  },
  emotionBarBackground: {
    flex: 1,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 8,
  },
  emotionBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  emotionValue: {
    width: 50,
    textAlign: 'right',
  },
  facialAnalysisButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  facialAnalysisButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    padding: 20,
    borderRadius: 12,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  reportSection: {
    fontWeight: 'bold',
    marginVertical: 8,
  },
  reportSubtitle: {
    fontWeight: '500',
    marginTop: 16,
    marginBottom: 8,
  },
  recommendation: {
    marginVertical: 4,
    paddingLeft: 8,
  },
  closeButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default MentalHealthScreen;
