import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  User,
  Bot,
  Mic,
  Loader2,
  Volume2,
  Speaker,
  Headphones,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useToast } from "./ui/use-toast";
import { Card, CardContent } from "./ui/card";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { useLanguage } from "../context/LanguageContext";

// Define types for SpeechRecognition - needed for TypeScript
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

// Import the Google Generative AI library
import { GoogleGenerativeAI } from "@google/generative-ai";

// Your new API key from Google AI Studio
const API_KEY = "AIzaSyBS4f26epLRkFGSQbIQi_VFQvbFGMd9O6c";

interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
}

const AIAssistant = () => {
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Welcome to your health assistant. How can I help you today?",
      sender: "ai",
      timestamp: new Date(),
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const [modelInitialized, setModelInitialized] = useState(false);
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [initializationError, setInitializationError] = useState<string | null>(
    null
  );
  const genAIRef = useRef<any>(null);
  const modelRef = useRef<any>(null);
  const speechSynthesisRef = useRef<SpeechSynthesis | null>(null);

  // State for language selection
  const [selectedLanguage, setSelectedLanguage] = useState("english");

  // State for voice selection
  const [availableVoices, setAvailableVoices] = useState<
    SpeechSynthesisVoice[]
  >([]);
  const [selectedVoice, setSelectedVoice] = useState("");

  // State for real-time conversation mode
  const [realtimeMode, setRealtimeMode] = useState(false);
  const [listeningForRealtime, setListeningForRealtime] = useState(false);

  // Initialize chat session on first load with a slight delay to ensure everything is loaded
  useEffect(() => {
    const timer = setTimeout(() => {
      initializeGeminiChat();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Initialize available voices
  useEffect(() => {
    const initVoices = () => {
      if (!window.speechSynthesis) return;

      const synth = window.speechSynthesis;
      const voices = synth.getVoices();

      if (voices.length > 0) {
        setAvailableVoices(voices);
        // Default to a voice that matches the current language preference
        const langCode =
          selectedLanguage === "english"
            ? "en"
            : selectedLanguage === "hindi"
            ? "hi"
            : selectedLanguage === "marathi"
            ? "mr"
            : "en";

        const matchingVoice = voices.find((voice) =>
          voice.lang.startsWith(langCode)
        );
        setSelectedVoice(matchingVoice ? matchingVoice.name : voices[0].name);
      }
    };

    // Call initVoices when speechSynthesis voices are ready or when the component mounts
    if (window.speechSynthesis) {
      initVoices();
      window.speechSynthesis.onvoiceschanged = initVoices;
    }

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, [selectedLanguage]);

  const initializeGeminiChat = async () => {
    try {
      setInitializationError(null);
      console.log("Initializing Gemini chat...");

      // Initialize the API with your new API key
      genAIRef.current = new GoogleGenerativeAI(API_KEY);
      console.log("GoogleGenerativeAI initialized");

      // Try to initialize with the latest model first, then fall back to older models if necessary
      try {
        modelRef.current = await genAIRef.current.getGenerativeModel({
          model: "gemini-1.5-pro",
        });
        console.log("Using model: gemini-1.5-pro");
      } catch (modelError) {
        console.warn("Failed to use gemini-1.5-pro, trying gemini-1.0-pro");
        try {
          modelRef.current = await genAIRef.current.getGenerativeModel({
            model: "gemini-1.0-pro",
          });
          console.log("Using model: gemini-1.0-pro");
        } catch (fallbackError) {
          console.warn(
            "Failed to use gemini-1.0-pro, trying legacy gemini-pro"
          );
          modelRef.current = await genAIRef.current.getGenerativeModel({
            model: "gemini-pro",
          });
          console.log("Using model: gemini-pro");
        }
      }

      console.log("Model retrieved:", modelRef.current);

      const initialHistory = [
        {
          role: "user",
          parts: [
            {
              text: `You are a healthcare assistant providing information about health, wellness, diet, and medical topics.
                  - Provide evidence-based health information when available
                  - Clearly state when information is general advice versus medical guidance
                  - Always remind users to consult healthcare professionals for medical concerns
                  - For dietary plans, consider nutritional balance and individual needs
                  - Avoid making specific diagnoses or recommending specific medications
                  - Focus on preventive care and healthy lifestyle choices
                  - Be respectful of cultural differences in health practices
                  - Provide information in a clear, accessible manner`,
            },
          ],
        },
      ];

      setChatHistory(initialHistory);
      setModelInitialized(true);

      // Test the model with a simple query to verify it's working
      try {
        const result = await modelRef.current.generateContent(
          "Send a simple ping response to confirm connectivity"
        );
        console.log("Test response received:", result.response.text());
      } catch (testError) {
        console.error("Test message failed:", testError);
        setInitializationError(`Test message failed: ${testError.message}`);
      }
      console.log("Gemini chat initialization complete");
    } catch (error) {
      console.error("Error initializing Gemini chat:", error);
      setInitializationError(`${error.message}`);
      setModelInitialized(false);

      toast({
        title: "Initialization Error",
        description: `Failed to initialize the health assistant: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initialize speech recognition if available
    if ("SpeechRecognition" in window || "webkitSpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      // Map language to speech recognition language code
      const langMap: Record<string, string> = {
        english: "en-US",
        hindi: "hi-IN",
        marathi: "mr-IN",
      };
      recognitionRef.current.lang = langMap[selectedLanguage] || "en-US";

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;

        if (realtimeMode && listeningForRealtime) {
          // For real-time mode, we want to send the message right away
          sendMessage(transcript);
        } else {
          // For regular mode, just update the input field
          setInput(transcript);
        }

        setIsListening(false);
        setListeningForRealtime(false);

        toast({
          title: "Voice Recognized",
          description: "Your voice input has been captured",
        });
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
        setListeningForRealtime(false);
        toast({
          title: "Voice Recognition Error",
          description: "Failed to recognize speech",
          variant: "destructive",
        });
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        setListeningForRealtime(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [toast, selectedLanguage, realtimeMode]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      console.log("Sending message to Gemini:", userMessage.text);

      // Check if model is initialized
      if (!modelRef.current) {
        console.log("Model not initialized, trying to reinitialize...");
        await initializeGeminiChat();

        // Wait a moment for the model to be set in state
        await new Promise((resolve) => setTimeout(resolve, 1000));

        if (!modelRef.current) {
          console.error("Failed to initialize model after retry");
          throw new Error(
            "Model could not be initialized. Please refresh and try again."
          );
        }
      }

      // Check which API approach to use based on what's available
      let response;

      // Try the chat approach first (may not be available in all models/versions)
      try {
        console.log("Attempting to use chat history approach");

        // Update chat history with the user's message
        const updatedHistory = [
          ...chatHistory,
          { role: "user", parts: [{ text: userMessage.text }] },
        ];

        // Generate content from the model using the entire chat history
        console.log("Generating content using history:", updatedHistory);
        const result = await modelRef.current.generateContent({
          contents: updatedHistory,
          generationConfig: {
            temperature: 0.7,
            topP: 0.8,
            topK: 40,
            maxOutputTokens: 1024,
          },
        });

        response = result.response.text();

        // Update the chat history with the AI's response
        setChatHistory([
          ...updatedHistory,
          { role: "model", parts: [{ text: response }] },
        ]);
      } catch (chatError) {
        console.warn("Chat approach failed:", chatError);
        console.log("Falling back to simple prompt approach");

        // Fall back to simple prompt approach without chat history
        const contextPrompt = `
          As a healthcare assistant, provide information about health, wellness, diet, and medical topics.
          User question: ${userMessage.text}
          Your helpful response:
        `;

        const result = await modelRef.current.generateContent(contextPrompt);
        response = result.response.text();
      }

      console.log("Processed response from Gemini:", response);

      // Fix for too many asterisks issue - replace markdown formatting with plain text
      response = response.replace(/\\/g, "");

      // Add AI response to messages
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: "ai",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);

      // If in real-time mode, speak the response automatically
      if (realtimeMode) {
        handleTextToSpeech(response);
      }
    } catch (error) {
      console.error("Error getting Gemini response:", error);

      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `Sorry, I encountered an error: ${error.message}. Please try again later.`,
        sender: "ai",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);

      toast({
        title: "Connection Error",
        description: `Failed to connect to the Gemini AI service: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSend = () => {
    sendMessage(input);
  };

  const handleVoiceInput = () => {
    if (!recognitionRef.current) {
      toast({
        title: "Voice Recognition Not Available",
        description: "Your browser does not support voice recognition",
        variant: "destructive",
      });
      return;
    }

    if (isListening) {
      recognitionRef.current.abort();
      setIsListening(false);
      return;
    }

    try {
      setIsListening(true);
      recognitionRef.current.start();
      toast({
        title: "Voice Recognition",
        description: "Listening... Speak now",
      });
    } catch (error) {
      console.error("Error starting voice recognition:", error);
      setIsListening(false);
      toast({
        title: "Voice Recognition Error",
        description: "Failed to start voice recognition",
        variant: "destructive",
      });
    }
  };

  const handleRealtimeVoiceInput = () => {
    if (!recognitionRef.current) {
      toast({
        title: "Voice Recognition Not Available",
        description: "Your browser does not support voice recognition",
        variant: "destructive",
      });
      return;
    }

    if (listeningForRealtime) {
      recognitionRef.current.abort();
      setListeningForRealtime(false);
      return;
    }

    try {
      setListeningForRealtime(true);
      recognitionRef.current.start();
      toast({
        title: "Real-time Voice Recognition",
        description:
          "Listening... Speak now and your message will be sent automatically",
      });
    } catch (error) {
      console.error("Error starting voice recognition:", error);
      setListeningForRealtime(false);
      toast({
        title: "Voice Recognition Error",
        description: "Failed to start voice recognition",
        variant: "destructive",
      });
    }
  };

  const handleTextToSpeech = (text: string) => {
    if (!window.speechSynthesis) {
      console.error("Speech synthesis not available");
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    // Set voice based on selectedVoice
    const voices = window.speechSynthesis.getVoices();
    const selectedVoiceObj = voices.find(
      (voice) => voice.name === selectedVoice
    );
    if (selectedVoiceObj) {
      utterance.voice = selectedVoiceObj;
    }

    // Set language based on selected language
    const langMap: Record<string, string> = {
      english: "en-US",
      hindi: "hi-IN",
      marathi: "mr-IN",
    };
    utterance.lang = langMap[selectedLanguage] || "en-US";

    // Add event handlers for debugging
    utterance.onstart = () => console.log("Speech started");
    utterance.onend = () => console.log("Speech ended");
    utterance.onerror = (e) => console.error("Speech error:", e);

    // Speak the text
    window.speechSynthesis.speak(utterance);
  };

  const handleRetryInitialization = () => {
    setInitializationError(null);
    initializeGeminiChat();
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-6 flex flex-col h-[85vh]">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Health Assistant</h1>

        {/* Language selector moved to top right */}
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium">Language:</label>
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="english">English</option>
            <option value="hindi">Hindi</option>
            <option value="marathi">Marathi</option>
          </select>
        </div>
      </div>

      {!modelInitialized && (
        <div className="p-4 bg-yellow-100 rounded-md mb-4">
          <p>Initializing AI model... Please wait.</p>
          {initializationError && (
            <div className="mt-2">
              <p className="text-red-600 font-medium">
                Error: {initializationError}
              </p>
              <button
                onClick={handleRetryInitialization}
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Retry Initialization
              </button>
            </div>
          )}
        </div>
      )}

      {/* Voice Settings Section */}
      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-lg font-medium mb-2">Voice Settings</h2>
        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
          <div className="flex-1">
            <label className="text-sm font-medium block mb-1">
              Voice Selection:
            </label>
            <select
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value)}
              className="w-full p-2 border rounded"
            >
              {availableVoices.map((voice) => (
                <option key={voice.name} value={voice.name}>
                  {voice.name} ({voice.lang})
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <label className="text-sm font-medium block mb-1">
              Real-time Conversation Mode:
            </label>
            <div className="flex items-center space-x-2">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={realtimeMode}
                  onChange={() => setRealtimeMode(!realtimeMode)}
                  className="rounded border-gray-300"
                />
                <span className="ml-2">Enable Real-time Mode</span>
              </label>
            </div>
          </div>
        </div>

        {/* Real-time conversation controls */}
        {realtimeMode && (
          <div className="mt-4 p-3 bg-blue-50 rounded-md">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-blue-800">
                  Real-time Voice Conversation
                </h3>
                <p className="text-sm text-blue-600">
                  Speak naturally and receive spoken responses
                </p>
              </div>
              <Button
                onClick={handleRealtimeVoiceInput}
                className={`${
                  listeningForRealtime
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-blue-500 hover:bg-blue-600"
                } text-white px-4 py-2 rounded-lg flex items-center`}
              >
                {listeningForRealtime ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Listening...
                  </>
                ) : (
                  <>
                    <Headphones className="h-5 w-5 mr-2" />
                    Start Speaking
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>

      <Card className="flex-grow flex flex-col bg-gray-50/50 mb-4 overflow-hidden w-full">
        <CardContent className="flex-grow overflow-y-auto p-4 w-full">
          <div className="space-y-4 w-full">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                } w-full`}
              >
                <div
                  className={`flex items-start max-w-[80%] ${
                    message.sender === "user" ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <Avatar
                    className={`h-8 w-8 flex-shrink-0 ${
                      message.sender === "user" ? "ml-2" : "mr-2"
                    }`}
                  >
                    <AvatarFallback>
                      {message.sender === "user" ? (
                        <User size={16} />
                      ) : (
                        <Bot size={16} />
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={`rounded-lg px-4 py-2 ${
                      message.sender === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-white border border-gray-200"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.text}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    {message.sender === "ai" && !realtimeMode && (
                      <Button
                        onClick={() => handleTextToSpeech(message.text)}
                        className="mt-2 flex items-center text-sm text-blue-500"
                      >
                        <Speaker className="h-4 w-4 mr-1" />
                        Speak
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start w-full">
                <div className="flex items-start">
                  <Avatar className="h-8 w-8 mr-2 flex-shrink-0">
                    <AvatarFallback>
                      <Bot size={16} />
                    </AvatarFallback>
                  </Avatar>
                  <div className="rounded-lg px-4 py-2 bg-white border border-gray-200">
                    <div className="flex space-x-1">
                      <div
                        className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      ></div>
                      <div
                        className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      ></div>
                      <div
                        className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "600ms" }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </CardContent>
      </Card>

      {/* Regular text input */}
      <div className="flex gap-2 w-full">
        {!realtimeMode && (
          <Button
            variant={isListening ? "default" : "outline"}
            size="icon"
            onClick={handleVoiceInput}
            className={`flex-none ${
              isListening ? "bg-red-500 hover:bg-red-600" : ""
            }`}
          >
            {isListening ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </Button>
        )}
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about health, diet, or wellness..."
          onKeyPress={(e) => e.key === "Enter" && handleSend()}
          className="flex-grow"
          disabled={isListening || realtimeMode}
        />
        <Button
          onClick={handleSend}
          disabled={
            !input.trim() || loading || !modelInitialized || realtimeMode
          }
          className="flex-none bg-blue-600 hover:bg-blue-700"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>

      <div className="mt-4 text-sm text-gray-500 text-center">
        <p>
          ⚠ The health assistant provides general information only, not medical
          advice.
        </p>
      </div>
    </div>
  );
};

export default AIAssistant;
