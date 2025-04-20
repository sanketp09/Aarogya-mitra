import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Brain, Download, Smile, RefreshCw } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import EmotionDetector from '@/components/interview/EmotionDetector';
import EmotionReport from '@/components/interview/EmotionReport';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

// Mental Health Assessment Questions
const MENTAL_HEALTH_QUESTIONS = [
  {
    id: 1,
    question: "How often have you felt down, depressed, or hopeless in the past 2 weeks?",
    options: [
      { value: 0, text: "Not at all" },
      { value: 1, text: "Several days" },
      { value: 2, text: "More than half the days" },
      { value: 3, text: "Nearly every day" }
    ],
    category: "depression"
  },
  {
    id: 2,
    question: "How often have you had little interest or pleasure in doing things you usually enjoy?",
    options: [
      { value: 0, text: "Not at all" },
      { value: 1, text: "Several days" },
      { value: 2, text: "More than half the days" },
      { value: 3, text: "Nearly every day" }
    ],
    category: "depression"
  },
  {
    id: 3,
    question: "How often have you felt nervous, anxious, or on edge?",
    options: [
      { value: 0, text: "Not at all" },
      { value: 1, text: "Several days" },
      { value: 2, text: "More than half the days" },
      { value: 3, text: "Nearly every day" }
    ],
    category: "anxiety"
  },
  {
    id: 4,
    question: "How often have you been unable to stop or control worrying?",
    options: [
      { value: 0, text: "Not at all" },
      { value: 1, text: "Several days" },
      { value: 2, text: "More than half the days" },
      { value: 3, text: "Nearly every day" }
    ],
    category: "anxiety"
  },
  {
    id: 5,
    question: "How often have you had trouble falling or staying asleep, or sleeping too much?",
    options: [
      { value: 0, text: "Not at all" },
      { value: 1, text: "Several days" },
      { value: 2, text: "More than half the days" },
      { value: 3, text: "Nearly every day" }
    ],
    category: "sleep"
  },
  {
    id: 6,
    question: "How often have you felt tired or had little energy?",
    options: [
      { value: 0, text: "Not at all" },
      { value: 1, text: "Several days" },
      { value: 2, text: "More than half the days" },
      { value: 3, text: "Nearly every day" }
    ],
    category: "energy"
  },
  {
    id: 7,
    question: "How often have you had a poor appetite or been overeating?",
    options: [
      { value: 0, text: "Not at all" },
      { value: 1, text: "Several days" },
      { value: 2, text: "More than half the days" },
      { value: 3, text: "Nearly every day" }
    ],
    category: "appetite"
  },
  {
    id: 8,
    question: "How often have you felt bad about yourself — or that you are a failure or have let yourself or your family down?",
    options: [
      { value: 0, text: "Not at all" },
      { value: 1, text: "Several days" },
      { value: 2, text: "More than half the days" },
      { value: 3, text: "Nearly every day" }
    ],
    category: "self-esteem"
  },
  {
    id: 9,
    question: "How often have you had trouble concentrating on things, such as reading or watching TV?",
    options: [
      { value: 0, text: "Not at all" },
      { value: 1, text: "Several days" },
      { value: 2, text: "More than half the days" },
      { value: 3, text: "Nearly every day" }
    ],
    category: "concentration"
  },
  {
    id: 10,
    question: "How often have you felt that you were moving or speaking so slowly that other people could have noticed?",
    options: [
      { value: 0, text: "Not at all" },
      { value: 1, text: "Several days" },
      { value: 2, text: "More than half the days" },
      { value: 3, text: "Nearly every day" }
    ],
    category: "motor"
  }
];

const MentalSupportPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Emotion detection states
  const [emotionData, setEmotionData] = useState<{ [key: string]: number }>({});
  const [isRecording, setIsRecording] = useState(true); // Start recording by default
  const [facialAnalysisEnabled, setFacialAnalysisEnabled] = useState(true);
  const [facialAnalysisError, setFacialAnalysisError] = useState<string | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);
  
  // Mental assessment states
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{[key: number]: number}>({});
  const [assessmentCompleted, setAssessmentCompleted] = useState(false);
  const [mentalHealthScore, setMentalHealthScore] = useState(0);
  
  // Handle emotion data updates from the detector
  const handleEmotionCapture = useCallback((emotions: { [key: string]: number }) => {
    if (isRecording) {
      setEmotionData(prevEmotions => {
        const newEmotions = { ...prevEmotions };
        
        // If no previous data, just use the new data
        if (Object.keys(newEmotions).length === 0) {
          return emotions;
        }
        
        // Weight factor - use stronger weight for new data to make detection more responsive
        const newDataWeight = 0.3; // 30% new data, 70% old data
        
        // Calculate a weighted average with more weight to new data
        Object.entries(emotions).forEach(([emotion, value]) => {
          const prevValue = prevEmotions[emotion] || 0;
          newEmotions[emotion] = (prevValue * (1 - newDataWeight)) + (value * newDataWeight);
        });
        
        return newEmotions;
      });
      
      // Log detection success for debugging
      console.log("Emotion data updated", Object.entries(emotions)
        .sort(([, a], [, b]) => b - a)[0]);
    }
  }, [isRecording]);

  // Handle facial analysis errors
  const handleFacialAnalysisError = useCallback((error: string) => {
    console.error("Facial analysis error:", error);
    setFacialAnalysisError(error);
    setFacialAnalysisEnabled(false);
    
    toast({
      title: "Facial Analysis Disabled",
      description: "We'll continue with just the questionnaire. " + error,
      variant: "destructive",
    });
    
    // Set default emotion data when facial analysis fails
    if (Object.keys(emotionData).length === 0) {
      setEmotionData({
        neutral: 1,
        happy: 0,
        sad: 0,
        angry: 0,
        fearful: 0,
        disgusted: 0,
        surprised: 0
      });
    }
  }, [emotionData, toast]);
  
  // Toggle facial analysis on/off
  const toggleFacialAnalysis = useCallback(() => {
    setFacialAnalysisEnabled(prev => !prev);
    
    if (!facialAnalysisEnabled) {
      setFacialAnalysisError(null);
    }
    
    toast({
      title: facialAnalysisEnabled ? "Facial Analysis Disabled" : "Facial Analysis Enabled",
      description: facialAnalysisEnabled 
        ? "The assessment will continue without facial emotion analysis." 
        : "Your facial expressions will be analyzed during the assessment.",
    });
  }, [facialAnalysisEnabled, toast]);
  
  // Answer a mental health question
  const handleAnswer = (questionId: number, value: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
    
    if (currentQuestionIndex < MENTAL_HEALTH_QUESTIONS.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Complete the assessment
      completeAssessment();
    }
  };
  
  // Calculate final results and stop recording
  const completeAssessment = () => {
    // Calculate mental health score (0-30 scale)
    const totalScore = Object.values(answers).reduce((sum, value) => sum + value, 0);
    setMentalHealthScore(totalScore);
    
    // Stop emotion recording
    setIsRecording(false);
    setAssessmentCompleted(true);
    
    toast({
      title: "Assessment complete",
      description: "Your mental health assessment and facial analysis are ready.",
    });
  };
  
  // Reset the assessment
  const resetAssessment = () => {
    setCurrentQuestionIndex(0);
    setAnswers({});
    setAssessmentCompleted(false);
    setEmotionData({});
    setIsRecording(true);
  };
  
  // Generate PDF report
  const generatePDF = async () => {
    if (!reportRef.current) return;
    
    try {
      toast({
        title: "Generating PDF",
        description: "Please wait...",
      });
      
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        logging: false,
        useCORS: true,
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
      });
      
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save('mental-health-report.pdf');
      
      toast({
        title: "PDF Generated",
        description: "Your comprehensive health report has been downloaded.",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Error",
        description: "Failed to generate PDF report.",
        variant: "destructive",
      });
    }
  };
  
  // Get severity level based on score
  const getSeverityLevel = (score: number) => {
    if (score <= 5) return "minimal";
    if (score <= 10) return "mild";
    if (score <= 15) return "moderate";
    if (score <= 20) return "moderately severe";
    return "severe";
  };
  
  // Get recommendations based on severity
  const getRecommendations = (severity: string) => {
    switch (severity) {
      case "minimal":
        return "Your symptoms suggest minimal levels of depression and anxiety. Continue with self-care practices.";
      case "mild":
        return "Your symptoms suggest mild levels of depression and anxiety. Consider lifestyle changes and self-help resources.";
      case "moderate":
        return "Your symptoms suggest moderate levels of depression and anxiety. Consider speaking with a mental health professional.";
      case "moderately severe":
        return "Your symptoms suggest moderately severe levels of depression and anxiety. We recommend consulting with a mental health professional soon.";
      case "severe":
        return "Your symptoms suggest severe levels of depression and anxiety. Please seek professional help as soon as possible.";
      default:
        return "Please consult with a healthcare provider for a complete evaluation.";
    }
  };
  
  return (
    <Layout>
      <div className="container px-2 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Button
              variant="ghost"
              onClick={() => navigate("/mentalhealth")}
              size="sm"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <h1 className="text-lg font-bold ml-2">Mental Health Assessment</h1>
          </div>
          
          {assessmentCompleted && (
            <Button 
              onClick={generatePDF} 
              variant="outline" 
              size="sm"
            >
              <Download className="h-4 w-4 mr-1" />
              Download
            </Button>
          )}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* Left Side - Facial Analysis */}
          <Card>
            <CardHeader className="py-2 px-3">
              <CardTitle className="text-sm font-medium flex items-center">
                <Smile className="h-4 w-4 mr-1 text-blue-500" />
                Facial Expression Analysis
              </CardTitle>
              <div className="flex items-center">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={toggleFacialAnalysis} 
                  className="text-xs"
                >
                  {facialAnalysisEnabled ? "Disable" : "Enable"} Facial Analysis
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="px-3 pb-3">
                {facialAnalysisEnabled ? (
                  <div className="w-full h-[400px] relative bg-black rounded-md overflow-hidden">
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 5 }}>
                      <EmotionDetector
                        width={640}
                        height={480}
                        onEmotionCapture={handleEmotionCapture}
                        isActive={isRecording && facialAnalysisEnabled}
                        onError={(error) => {
                          console.error("Facial analysis error:", error);
                          handleFacialAnalysisError(error);
                          
                          // Set default neutral emotion data if facial analysis fails
                          setEmotionData({
                            neutral: 1,
                            happy: 0,
                            sad: 0,
                            angry: 0,
                            fearful: 0,
                            disgusted: 0,
                            surprised: 0
                          });
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="h-[400px] bg-gray-100 flex items-center justify-center rounded-md">
                    <div className="text-center p-4">
                      <Smile className="h-16 w-16 mx-auto text-gray-400 mb-2" />
                      <p className="text-gray-500 font-medium">Facial Analysis {facialAnalysisError ? "Failed" : "Disabled"}</p>
                      {facialAnalysisError && (
                        <div>
                          <p className="text-xs text-gray-500 mt-2 max-w-[250px]">{facialAnalysisError}</p>
                          <p className="text-xs text-blue-500 mt-2">Continuing with questionnaire only</p>
                        </div>
                      )}
                      {!facialAnalysisError && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={toggleFacialAnalysis} 
                          className="mt-3 text-xs"
                        >
                          Enable Facial Analysis
                        </Button>
                      )}
                    </div>
                  </div>
                )}
                
                {isRecording && facialAnalysisEnabled && (
                  <div className="mt-2 bg-blue-50 p-2 rounded border border-blue-100">
                    <p className="text-xs text-blue-700">
                      <strong>Facial analysis in progress</strong>: Try to respond naturally to the questions while facing the camera.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Right Side - Mental Health Assessment or Results */}
          <Card>
            <CardHeader className="py-2 px-3">
              <CardTitle className="text-sm font-medium flex items-center">
                <Brain className="h-4 w-4 mr-1 text-purple-500" />
                {assessmentCompleted ? "Assessment Results" : "Mental Health Questions"}
              </CardTitle>
              {!assessmentCompleted && (
                <CardDescription className="text-xs">
                  Question {currentQuestionIndex + 1} of {MENTAL_HEALTH_QUESTIONS.length}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="px-3 pb-3">
              {!assessmentCompleted ? (
                <div>
                  <div className="mb-2">
                    <Progress value={((currentQuestionIndex + 1) / MENTAL_HEALTH_QUESTIONS.length) * 100} className="h-1" />
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded">
                    <h3 className="font-medium text-sm mb-1">
                      {MENTAL_HEALTH_QUESTIONS[currentQuestionIndex].question}
                    </h3>
                    <div className="space-y-1 mt-2">
                      {MENTAL_HEALTH_QUESTIONS[currentQuestionIndex].options.map((option) => (
                        <Button
                          key={option.value}
                          variant="outline"
                          className="w-full justify-start text-left py-1.5 px-2 text-xs"
                          onClick={() => handleAnswer(MENTAL_HEALTH_QUESTIONS[currentQuestionIndex].id, option.value)}
                        >
                          {option.text}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div ref={reportRef}>
                  <div className="space-y-3">
                    <div className="bg-gray-50 p-3 rounded">
                      <h3 className="font-medium text-sm mb-1">Mental Health Score</h3>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-lg font-bold">{mentalHealthScore}/{MENTAL_HEALTH_QUESTIONS.length * 3}</p>
                          <p className="text-xs text-gray-500 capitalize">{getSeverityLevel(mentalHealthScore)} symptoms</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <Brain className="h-5 w-5 text-blue-600" />
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="text-xs">{getRecommendations(getSeverityLevel(mentalHealthScore))}</p>
                      </div>
                    </div>
                    
                    <EmotionReport 
                      emotionData={emotionData}
                      title="Facial Expression Analysis Results"
                    />
                    
                    <div className="flex justify-between">
                      <Button 
                        variant="outline"
                        onClick={resetAssessment}
                        size="sm"
                        className="text-xs"
                      >
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Retake
                      </Button>
                      <Button
                        onClick={generatePDF}
                        size="sm"
                        className="text-xs"
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Download Report
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default MentalSupportPage; 