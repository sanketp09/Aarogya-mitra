
import React, { useState, useRef, useEffect } from 'react';
import { Heart, Send, User, Bot, Mic, FileText, ArrowRight, Bookmark, ExternalLink } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useToast } from './ui/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useIsMobile } from '@/hooks/use-mobile';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface Resource {
  id: string;
  title: string;
  category: string;
  description: string;
  link?: string;
}

interface Assessment {
  id: string;
  question: string;
  options: { text: string; value: number; }[];
}

const AIHealth = () => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState('ai');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // AI Assistant state
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm your AI health assistant. I can help you with medication information, health tips, or answer questions about senior care. How can I assist you today?",
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);
  const [loading, setLoading] = useState(false);

  // Mental Health state
  const [resources] = useState<Resource[]>([
    {
      id: '1',
      title: 'Managing Anxiety in Later Life',
      category: 'Anxiety',
      description: 'Learn effective strategies to manage anxiety and stress in your daily life.',
      link: 'https://www.nimh.nih.gov/health/topics/anxiety-disorders',
    },
    {
      id: '2',
      title: 'Depression: Signs and Support',
      category: 'Depression',
      description: 'Recognize signs of depression and discover support options available to you.',
      link: 'https://www.nia.nih.gov/health/depression-and-older-adults',
    },
    {
      id: '3',
      title: 'Sleep Hygiene Tips for Better Rest',
      category: 'Sleep',
      description: 'Improve your sleep quality with these evidence-based recommendations.',
    },
    {
      id: '4',
      title: 'Mindfulness Meditation Guide',
      category: 'Mindfulness',
      description: 'A beginner\'s guide to practicing mindfulness meditation for mental wellbeing.',
    },
  ]);

  const [assessments] = useState<Assessment[]>([
    {
      id: '1',
      question: 'How often have you been bothered by feeling down, depressed, or hopeless over the past 2 weeks?',
      options: [
        { text: 'Not at all', value: 0 },
        { text: 'Several days', value: 1 },
        { text: 'More than half the days', value: 2 },
        { text: 'Nearly every day', value: 3 },
      ],
    },
    {
      id: '2',
      question: 'How often have you had little interest or pleasure in doing things over the past 2 weeks?',
      options: [
        { text: 'Not at all', value: 0 },
        { text: 'Several days', value: 1 },
        { text: 'More than half the days', value: 2 },
        { text: 'Nearly every day', value: 3 },
      ],
    },
  ]);

  const [currentAssessment, setCurrentAssessment] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [wellnessScore, setWellnessScore] = useState<number | null>(null);
  const [showResources, setShowResources] = useState(true);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // AI Assistant handlers
  const handleSend = () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage]);
    setInput('');
    setLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponses: { [key: string]: string } = {
        medication: "It's important to take your medications as prescribed. If you're experiencing side effects, please consult with your doctor before making any changes.",
        pain: "For minor pain, you might try a warm compress or gentle stretching. If pain persists, please consult with your healthcare provider.",
        sleep: "Establishing a regular sleep schedule can help improve sleep quality. Try avoiding screens before bedtime and create a comfortable sleep environment.",
        hello: "Hello! How are you feeling today? Is there something specific I can help you with?",
        hi: "Hi there! How can I assist you with your health needs today?",
        anxiety: "Anxiety can be challenging to manage. Deep breathing exercises, mindfulness, and regular physical activity can all help reduce anxiety symptoms. Would you like me to suggest some specific techniques?",
        depression: "I'm sorry to hear you're feeling down. It's important to talk with a healthcare provider about your feelings. In the meantime, regular exercise, social connection, and consistent sleep patterns can help support your mental health.",
        lonely: "Feeling lonely is common and it's okay to acknowledge these feelings. Consider joining community groups, participating in virtual social clubs, or reconnecting with old friends. Regular video calls with loved ones can also help maintain important social connections."
      };

      // Simple keyword matching for demo purposes
      const keyword = Object.keys(aiResponses).find(key => 
        input.toLowerCase().includes(key)
      );

      const responseText = keyword 
        ? aiResponses[keyword]
        : "I'm here to help with health-related questions. Could you provide more details about what you'd like to know?";

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: responseText,
        sender: 'ai',
        timestamp: new Date(),
      };

      setMessages(prevMessages => [...prevMessages, aiMessage]);
      setLoading(false);
    }, 1500);
  };

  const handleVoiceInput = () => {
    toast({
      title: "Voice Recognition",
      description: "Voice input activated. Please speak your question.",
    });
    
    // Simulate voice recognition
    setTimeout(() => {
      setInput("What medications should I take for pain?");
      toast({
        title: "Voice Recognized",
        description: "Your question has been captured.",
      });
    }, 2000);
  };

  // Mental Health handlers
  const handleResourceClick = (resource: Resource) => {
    if (resource.link) {
      toast({
        title: "Opening External Resource",
        description: `Opening ${resource.title} in a new tab.`,
      });
      // In a real app, this would open the link in a new tab
    } else {
      toast({
        title: "Resource Selected",
        description: `Viewing ${resource.title}`,
      });
    }
  };

  const handleSaveResource = (resource: Resource) => {
    toast({
      title: "Resource Saved",
      description: `${resource.title} has been saved to your library.`,
    });
  };

  const handleAnswerSelect = (value: number) => {
    const newAnswers = [...answers];
    newAnswers[currentAssessment] = value;
    setAnswers(newAnswers);
    
    if (currentAssessment < assessments.length - 1) {
      setCurrentAssessment(currentAssessment + 1);
    } else {
      // Calculate score (simple sum for demo)
      const score = Math.max(0, 100 - (newAnswers.reduce((sum, val) => sum + val, 0) * 20));
      setWellnessScore(score);
      setShowResources(true);
    }
  };

  const restartAssessment = () => {
    setAnswers([]);
    setCurrentAssessment(0);
    setWellnessScore(null);
  };

  const toggleView = () => {
    if (wellnessScore !== null) {
      setShowResources(!showResources);
    }
  };

  // Render AI Assistant
  const renderAIAssistant = () => (
    <div className="flex flex-col h-full">
      <Card className="flex-grow flex flex-col bg-gray-50/50 mb-4 overflow-hidden">
        <CardContent className="flex-grow overflow-y-auto p-4 h-[50vh] md:h-[60vh]">
          <div className="space-y-4">
            {messages.map((message) => (
              <div 
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <Avatar className={`h-8 w-8 ${message.sender === 'user' ? 'ml-2' : 'mr-2'}`}>
                    <AvatarFallback>{message.sender === 'user' ? <User size={16} /> : <Bot size={16} />}</AvatarFallback>
                  </Avatar>
                  <div 
                    className={`rounded-lg px-4 py-2 ${
                      message.sender === 'user' 
                        ? 'bg-care-primary text-white' 
                        : 'bg-white border border-gray-200'
                    }`}
                  >
                    <p>{message.text}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="flex">
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarFallback><Bot size={16} /></AvatarFallback>
                  </Avatar>
                  <div className="rounded-lg px-4 py-2 bg-white border border-gray-200">
                    <div className="flex space-x-1">
                      <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '600ms' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </CardContent>
      </Card>
      
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={handleVoiceInput}
          className="flex-none"
        >
          <Mic className="h-4 w-4" />
        </Button>
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          className="flex-grow"
        />
        <Button onClick={handleSend} disabled={!input.trim() || loading} className="flex-none bg-care-primary hover:bg-care-secondary">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  // Render Mental Health Assessment
  const renderMentalHealthAssessment = () => (
    <div className="max-w-2xl mx-auto h-full">
      {wellnessScore === null ? (
        <Card>
          <CardHeader>
            <CardTitle>Mental Wellness Assessment</CardTitle>
            <CardDescription>
              Answer a few questions to help us understand how you're feeling. This is not a diagnostic tool, but can help identify areas where support might be beneficial.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <h3 className="text-lg font-medium">
                Question {currentAssessment + 1} of {assessments.length}
              </h3>
              <p className="text-base">{assessments[currentAssessment].question}</p>
              <div className="space-y-2">
                {assessments[currentAssessment].options.map((option, index) => (
                  <Button
                    key={index}
                    variant={answers[currentAssessment] === option.value ? "default" : "outline"}
                    className="w-full justify-start h-auto py-3 px-4 mb-2"
                    onClick={() => handleAnswerSelect(option.value)}
                  >
                    {option.text}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex justify-between items-center mb-6">
            <Button variant="outline" onClick={toggleView}>
              {showResources ? "View Assessment Results" : "View Resources"}
            </Button>
            <Button variant="ghost" onClick={restartAssessment}>
              Retake Assessment
            </Button>
          </div>

          {showResources ? (
            <div className="grid gap-4 md:grid-cols-2 overflow-y-auto max-h-[60vh]">
              {resources.map(resource => (
                <Card key={resource.id} className="h-full flex flex-col">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                          {resource.category}
                        </span>
                        <CardTitle className="mt-2">{resource.title}</CardTitle>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleSaveResource(resource)}
                      >
                        <Bookmark className="h-5 w-5" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p>{resource.description}</p>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full bg-care-primary hover:bg-care-secondary"
                      onClick={() => handleResourceClick(resource)}
                    >
                      {resource.link ? (
                        <>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Visit Resource
                        </>
                      ) : (
                        <>
                          <FileText className="h-4 w-4 mr-2" />
                          Read Article
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Your Mental Wellness Score</CardTitle>
                <CardDescription>
                  Based on your responses, we've created a preliminary wellness assessment.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Wellness Score</span>
                    <span className="font-medium">{wellnessScore}%</span>
                  </div>
                  <Progress value={wellnessScore} className="h-3" />
                </div>
                
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-medium text-blue-800 mb-2">What this means</h3>
                  <p className="text-blue-700 text-sm">
                    {wellnessScore >= 70 
                      ? "You appear to be managing well overall. Continue practicing good self-care!" 
                      : wellnessScore >= 40 
                        ? "You may be experiencing some difficulties. Consider reviewing our resources or speaking with a professional." 
                        : "Your responses suggest you might benefit from professional support. Please consider speaking with a healthcare provider."}
                  </p>
                </div>
                
                <Button 
                  className="w-full bg-care-primary hover:bg-care-secondary"
                  onClick={toggleView}
                >
                  View Recommended Resources
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-6 md:ml-64 animate-fade-in">
      <div className="flex items-center mb-6">
        {activeTab === 'ai' ? (
          <Bot className="h-8 w-8 text-care-primary mr-3" />
        ) : (
          <Heart className="h-8 w-8 text-red-500 mr-3" />
        )}
        <h1 className="text-3xl font-bold">
          {activeTab === 'ai' ? 'AI Health Assistant' : 'Mental Health Support'}
        </h1>
      </div>

      <Tabs defaultValue="ai" className="w-full mb-6" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="ai" className="text-lg">AI Assistant</TabsTrigger>
          <TabsTrigger value="mental" className="text-lg">Mental Health</TabsTrigger>
        </TabsList>
        
        <TabsContent value="ai" className="h-full">
          {renderAIAssistant()}
        </TabsContent>
        
        <TabsContent value="mental" className="h-full">
          {renderMentalHealthAssessment()}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIHealth;
