import React, { useState } from 'react';
import { Users, Calendar, Video, MessageSquare, User, Send } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { useToast } from './ui/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

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

const SocialClub = () => {
  const { toast } = useToast();
  const [messageInput, setMessageInput] = useState('');
  const [activeTab, setActiveTab] = useState('events');
  
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
    },
    {
      id: '4',
      name: 'James Miller',
      age: 70,
      interests: ['Woodworking', 'Bird watching', 'Puzzles'],
      online: false
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
    },
    {
      id: '4',
      sender: 'Robert Davis',
      text: 'Just bring your enthusiasm! Everything else will be provided by the host.',
      time: '10:25 AM',
      isUser: false
    }
  ]);

  const handleJoinEvent = (event: Event) => {
    toast({
      title: "Event Joined",
      description: `You've registered for ${event.title} on ${event.date}`,
    });
  };

  const handleConnectMember = (member: CommunityMember) => {
    toast({
      title: "Connection Request Sent",
      description: `A connection request has been sent to ${member.name}`,
    });
  };

  const handleStartChat = (member: CommunityMember) => {
    toast({
      title: "Chat Started",
      description: `Starting a conversation with ${member.name}`,
    });
  };
  
  const handleSendMessage = () => {
    if (messageInput.trim()) {
      toast({
        title: "Message Sent",
        description: "Your message has been sent to the group chat",
      });
      setMessageInput('');
    }
  };

  // New function to handle joining a virtual meeting room using Jitsi
  const handleJoinVirtualRoom = (event: Event) => {
    // Create a room name based on the event title (remove spaces and special characters)
    const roomName = event.title.toLowerCase().replace(/[^a-z0-9]/g, '-');
    
    // Create a Jitsi Meet URL with the room name
    const jitsiUrl = `https://meet.jit.si/${roomName}`;
    
    // Show toast notification
    toast({
      title: "Joining Virtual Room",
      description: `Opening ${event.title} meeting room...`,
    });
    
    // Redirect to the Jitsi Meet URL in a new tab
    window.open(jitsiUrl, '_blank');
  };

  return (
    <div className="container mx-auto px-4 py-6 md:ml-64 animate-fade-in">
      <div className="flex items-center mb-6">
        <Users className="h-8 w-8 text-care-primary mr-3" />
        <h1 className="text-3xl font-bold">Virtual Social Club</h1>
      </div>

      <Tabs defaultValue="events" className="w-full mb-6" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="events" className="text-lg">Upcoming Events</TabsTrigger>
          <TabsTrigger value="community" className="text-lg">Community Members</TabsTrigger>
          <TabsTrigger value="chat" className="text-lg">Group Chat</TabsTrigger>
        </TabsList>
        
        <TabsContent value="events" className="space-y-4">
          {events.map(event => (
            <Card key={event.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{event.title}</CardTitle>
                    <CardDescription className="mt-1">
                      <Calendar className="h-4 w-4 inline mr-1" />
                      {event.date} at {event.time}
                    </CardDescription>
                  </div>
                  <Button 
                    className="bg-care-primary hover:bg-care-secondary"
                    onClick={() => handleJoinEvent(event)}
                  >
                    Join Event
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p>{event.description}</p>
                <div className="mt-2 text-sm text-gray-500">
                  <Users className="h-4 w-4 inline mr-1" />
                  {event.participants} participants registered
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => handleJoinVirtualRoom(event)}
                >
                  <Video className="h-4 w-4 mr-2" />
                  Enter Virtual Room
                </Button>
              </CardFooter>
            </Card>
          ))}
        </TabsContent>
        
        <TabsContent value="community" className="space-y-4">
          {members.map(member => (
            <Card key={member.id}>
              <CardHeader>
                <div className="flex items-center">
                  <Avatar className="h-12 w-12 mr-3">
                    <AvatarFallback>
                      <User className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-grow">
                    <CardTitle className="flex items-center">
                      {member.name}
                      <div className={`ml-2 h-3 w-3 rounded-full ${member.online ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    </CardTitle>
                    <CardDescription>Age: {member.age}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-medium mb-1">Interests:</p>
                <div className="flex flex-wrap gap-1">
                  {member.interests.map(interest => (
                    <span 
                      key={interest} 
                      className="px-2 py-1 bg-gray-100 text-gray-800 rounded-md text-xs font-medium"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={() => handleConnectMember(member)}
                  className="flex-1 mr-2"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Connect
                </Button>
                <Button 
                  className="flex-1 bg-care-primary hover:bg-care-secondary"
                  onClick={() => handleStartChat(member)}
                  disabled={!member.online}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  {member.online ? 'Chat Now' : 'Offline'}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </TabsContent>
        
        <TabsContent value="chat" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Community Group Chat</CardTitle>
              <CardDescription>Connect with other community members</CardDescription>
            </CardHeader>
            <CardContent className="max-h-96 overflow-y-auto space-y-4">
              {messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.isUser 
                        ? 'bg-care-primary text-white' 
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {!message.isUser && (
                      <div className="font-semibold mb-1">{message.sender}</div>
                    )}
                    <div>{message.text}</div>
                    <div className={`text-xs mt-1 text-right ${message.isUser ? 'text-gray-200' : 'text-gray-500'}`}>
                      {message.time}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
            <CardFooter>
              <div className="flex w-full gap-2">
                <Input 
                  placeholder="Type a message..." 
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  className="flex-grow"
                />
                <Button onClick={handleSendMessage} className="bg-care-primary hover:bg-care-secondary">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Upcoming community events sheet */}
      {activeTab !== 'events' && (
        <Sheet>
          <SheetTrigger asChild>
            <Button 
              className="fixed right-20 bottom-20 md:bottom-24 h-14 w-14 rounded-full bg-care-tertiary hover:bg-care-secondary shadow-lg"
            >
              <Calendar className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Upcoming Events</SheetTitle>
              <SheetDescription>Quick view of all upcoming community events</SheetDescription>
            </SheetHeader>
            <div className="mt-6 space-y-4">
              {events.map(event => (
                <div key={event.id} className="border-b pb-3">
                  <h3 className="font-semibold">{event.title}</h3>
                  <p className="text-sm text-gray-500">
                    <Calendar className="h-3 w-3 inline mr-1" />
                    {event.date} at {event.time}
                  </p>
                </div>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
};

export default SocialClub;