import React, { useState, useEffect, useRef, useCallback } from 'react';
import EmotionDetector from './interview/EmotionDetector';
import EmotionReport from './interview/EmotionReport';
import { Button } from './ui/button';
import { ArrowLeft, Camera, Download, RefreshCw, ChevronRight } from 'lucide-react';

// Questions for mental health assessment
const MENTAL_HEALTH_QUESTIONS = [
  "How often have you felt down, depressed, or hopeless over the past two weeks?",
  "Do you find it difficult to fall asleep or stay asleep?",
  "How would you rate your energy levels throughout the day?",
  "Do you often feel anxious or worried about different aspects of your life?",
  "How would you describe your ability to concentrate on tasks?",
  "How often do you feel overwhelmed by your responsibilities?",
  "Do you experience frequent mood swings?",
  "How would you rate your overall satisfaction with life currently?",
  "How often do you feel isolated or lonely?",
  "Have you noticed changes in your appetite or weight recently?",
  "Do you find yourself avoiding social interactions or activities you once enjoyed?",
  "How would you rate your ability to cope with stress?",
  "Do you ever experience unexplained physical symptoms like headaches or stomach pain?",
  "How often do you feel irritable or easily annoyed?",
  "Do you struggle with feelings of worthlessness or excessive guilt?",
  "How often do you have trouble controlling your emotions?",
  "Do you find it hard to relax even when you have time to rest?",
  "Do you feel that your emotions interfere with your daily activities?",
  "How often do you feel mentally exhausted?",
  "Do you have supportive relationships you can rely on when needed?",
  "How would you rate your overall mental wellbeing?",
  "Do you practice any self-care activities regularly?",
  "Have you noticed any recurring negative thought patterns?",
  "How often do you feel hopeful about your future?",
  "Would you consider seeking professional help for mental health concerns?"
];

// Answer options for mental health questions
const ANSWER_OPTIONS = [
  { value: "never", label: "Never/Rarely" },
  { value: "sometimes", label: "Sometimes" },
  { value: "often", label: "Often/Always" }
];

const MentalHealthAnalysis: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('questions');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Array<{question: string, answer: string, emotions: any}>>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [emotionData, setEmotionData] = useState<{ [key: string]: number }>({});
  const [currentEmotions, setCurrentEmotions] = useState<{ [key: string]: number }>({
    angry: 0,
    disgusted: 0,
    fearful: 0,
    happy: 0,
    sad: 0,
    surprised: 0,
    neutral: 1
  });
  const [showReport, setShowReport] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  const [emotionHistory, setEmotionHistory] = useState<Array<any>>([]);
  const reportRef = useRef<HTMLDivElement>(null);
  
  // Handle emotion data from the detector
  const handleEmotionCapture = useCallback((emotions: { [key: string]: number }) => {
    setCurrentEmotions(emotions);
    
    if (isRecording) {
      // Store emotion data with timestamp and current question
      setEmotionHistory(prev => [
        ...prev,
        {
          timestamp: new Date().toISOString(),
          question: MENTAL_HEALTH_QUESTIONS[currentQuestionIndex],
          emotions: emotions
        }
      ]);
    }
  }, [isRecording, currentQuestionIndex]);
  
  // Record answer and move to next question
  const recordAnswer = (answer: string) => {
    setAnswers(prev => [
      ...prev,
      {
        question: MENTAL_HEALTH_QUESTIONS[currentQuestionIndex],
        answer,
        emotions: { ...currentEmotions }
      }
    ]);
    
    // Add to emotion history
    setEmotionHistory(prev => [
      ...prev,
      {
        timestamp: new Date().toISOString(),
        question: MENTAL_HEALTH_QUESTIONS[currentQuestionIndex],
        answer,
        emotions: { ...currentEmotions }
      }
    ]);
    
    // Move to next question or show report
    if (currentQuestionIndex < MENTAL_HEALTH_QUESTIONS.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      generateReport();
    }
  };
  
  // Toggle recording state
  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };
  
  // Reset the assessment
  const resetAssessment = () => {
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setEmotionHistory([]);
    setShowReport(false);
    setReportData(null);
    setActiveTab('questions');
  };
  
  // Generate the final report
  const generateReport = () => {
    // Calculate average emotions across all questions
    const avgEmotions = {
      angry: 0,
      disgusted: 0,
      fearful: 0,
      happy: 0,
      sad: 0,
      surprised: 0,
      neutral: 0
    };
    
    let totalEntries = emotionHistory.length;
    
    if (totalEntries === 0) {
      setReportData({
        averageEmotions: { ...avgEmotions, neutral: 1 },
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
          if (avgEmotions[emotion] !== undefined) {
            avgEmotions[emotion] += entry.emotions[emotion] || 0;
          }
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
          maxValue = value as number;
          dominantEmotion = emotion;
        }
      });
      
      // Calculate emotional variability
      const emotionalVariability = calculateEmotionalVariability(emotionHistory);
      
      // Generate personalized recommendations
      const recommendations = generateRecommendations(dominantEmotion, emotionalVariability, answers);
      
      // Calculate mental health score
      const mentalHealthScore = calculateMentalHealthScore(answers);
      
      // Set report data
      setReportData({
        averageEmotions: avgEmotions,
        dominantEmotion,
        emotionalVariability,
        mentalHealthScore,
        answers,
        recommendations,
        concernAreas: identifyConcernAreas(answers)
      });
    }
    
    setShowReport(true);
    setActiveTab('report');
  };
  
  // Calculate emotional variability
  const calculateEmotionalVariability = (history: any[]) => {
    // This is a simplified measure - would be more sophisticated in a real app
    const emotionChanges = [];
    
    for (let i = 1; i < history.length; i++) {
      let change = 0;
      
      Object.keys(history[i].emotions).forEach(emotion => {
        const prevValue = history[i-1].emotions[emotion] || 0;
        const currentValue = history[i].emotions[emotion] || 0;
        const diff = Math.abs(currentValue - prevValue);
        change += diff;
      });
      
      emotionChanges.push(change);
    }
    
    // Calculate average change
    return emotionChanges.length > 0 
      ? emotionChanges.reduce((sum, val) => sum + val, 0) / emotionChanges.length
      : 0;
  };
  
  // Generate recommendations based on analysis
  const generateRecommendations = (dominantEmotion: string, variability: number, answerData: any[]) => {
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
    
    // Analyze answer patterns
    const negativeResponseCount = answerData.filter(a => a.answer === 'often').length;
    
    if (negativeResponseCount > 10) {
      recommendations.push("Your responses indicate several areas of concern. Professional support is recommended.");
    } else if (negativeResponseCount > 5) {
      recommendations.push("Your responses show some areas that may benefit from attention. Consider speaking with a counselor.");
    }
    
    return recommendations;
  };
  
  // Calculate a mental health score based on answers
  const calculateMentalHealthScore = (answerData: any[]) => {
    if (answerData.length === 0) return { score: 0, level: 'unknown' };
    
    // Simple scoring: never=0, sometimes=1, often=2 (higher score = more concerns)
    let totalPoints = 0;
    
    answerData.forEach(answer => {
      if (answer.answer === 'never') totalPoints += 0;
      else if (answer.answer === 'sometimes') totalPoints += 1;
      else if (answer.answer === 'often') totalPoints += 2;
    });
    
    // Calculate percentage
    const maxPoints = answerData.length * 2;
    const score = Math.round((totalPoints / maxPoints) * 100);
    
    // Determine level
    let level;
    if (score < 30) level = 'low concern';
    else if (score < 60) level = 'moderate concern';
    else level = 'high concern';
    
    return { score, level };
  };
  
  // Identify specific areas of concern
  const identifyConcernAreas = (answerData: any[]) => {
    const concerns = [];
    
    // Check for sleep issues
    if (answerData[1]?.answer === 'often') {
      concerns.push("Sleep Difficulties");
    }
    
    // Check for anxiety
    if (answerData[3]?.answer === 'often' || answerData[16]?.answer === 'often') {
      concerns.push("Anxiety");
    }
    
    // Check for depression
    if (answerData[0]?.answer === 'often' && answerData[14]?.answer === 'often') {
      concerns.push("Depression");
    }
    
    // Check for social isolation
    if (answerData[8]?.answer === 'often' && answerData[10]?.answer === 'often') {
      concerns.push("Social Isolation");
    }
    
    // Check for stress
    if (answerData[5]?.answer === 'often' && answerData[11]?.answer === 'often') {
      concerns.push("Stress Management");
    }
    
    return concerns;
  };
  
  const renderQuestionsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Mental Health Assessment</h3>
          <p className="text-sm text-gray-500">
            Question {currentQuestionIndex + 1} of {MENTAL_HEALTH_QUESTIONS.length}
          </p>
        </div>
        
        <Button 
          variant={isRecording ? "destructive" : "outline"}
          size="sm"
          onClick={toggleRecording}
        >
          <Camera className="mr-2 h-4 w-4" />
          {isRecording ? "Stop Analysis" : "Start Facial Analysis"}
        </Button>
      </div>
      
      <div className="bg-gray-50 p-4 rounded-lg">
        <h2 className="text-xl font-medium mb-4">
          {MENTAL_HEALTH_QUESTIONS[currentQuestionIndex]}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-6">
          {ANSWER_OPTIONS.map((option) => (
            <Button
              key={option.value}
              variant="outline"
              className="w-full justify-start py-6"
              onClick={() => recordAnswer(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>
      
      {isRecording && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <EmotionDetector
              width={480}
              height={320}
              onEmotionCapture={handleEmotionCapture}
              isActive={isRecording}
            />
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-3">Real-time Emotion Analysis</h3>
            <p className="text-sm text-gray-500 mb-4">
              Your facial expressions are being analyzed as you answer the questions.
              This provides additional insights into your emotional responses.
            </p>
            
            {Object.keys(currentEmotions).length > 0 && (
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                {Object.entries(currentEmotions)
                  .sort(([, a], [, b]) => (b as number) - (a as number))
                  .map(([emotion, value]) => (
                    <div key={emotion} className="mb-2">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm capitalize">{emotion}</span>
                        <span className="text-sm">{Math.round((value as number) * 100)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full bg-blue-600"
                          style={{ width: `${(value as number) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))
                }
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
  
  const renderReportTab = () => (
    <div className="space-y-6" ref={reportRef}>
      {reportData ? (
        <>
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h2 className="text-2xl font-bold mb-2">Mental Health Assessment Report</h2>
            <p className="text-gray-600">
              Based on your responses and facial expression analysis
            </p>
            
            {reportData.mentalHealthScore && (
              <div className="mt-6 mb-4">
                <h3 className="text-lg font-semibold mb-3">Overall Assessment</h3>
                <div 
                  className={`inline-block px-4 py-2 rounded-full text-white font-medium ${
                    reportData.mentalHealthScore.level === 'high concern' 
                      ? 'bg-red-500' 
                      : reportData.mentalHealthScore.level === 'moderate concern'
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                  }`}
                >
                  {reportData.mentalHealthScore.level === 'high concern' 
                    ? 'High level of concern' 
                    : reportData.mentalHealthScore.level === 'moderate concern'
                      ? 'Moderate level of concern'
                      : 'Low level of concern'
                  }
                </div>
                
                <div className="mt-4">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Concern Level</span>
                    <span className="text-sm font-medium">{reportData.mentalHealthScore.score}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full ${
                        reportData.mentalHealthScore.level === 'high concern' 
                          ? 'bg-red-500' 
                          : reportData.mentalHealthScore.level === 'moderate concern'
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                      }`}
                      style={{ width: `${reportData.mentalHealthScore.score}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
            
            {reportData.concernAreas && reportData.concernAreas.length > 0 && (
              <div className="mt-6 mb-4">
                <h3 className="text-lg font-semibold mb-2">Areas of Concern</h3>
                <div className="flex flex-wrap gap-2">
                  {reportData.concernAreas.map((area: string, index: number) => (
                    <span 
                      key={index}
                      className="bg-red-100 text-red-800 text-sm font-medium px-3 py-1 rounded-full"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Emotional Response Analysis</h3>
              <EmotionReport 
                emotionData={reportData.averageEmotions}
                title="Your Emotional Responses During Assessment"
              />
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold mb-3">Recommendations</h3>
              <ul className="space-y-2">
                {reportData.recommendations.map((recommendation: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-800 rounded-full mr-2 flex-shrink-0">
                      {index + 1}
                    </span>
                    <span>{recommendation}</span>
                  </li>
                ))}
              </ul>
              
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-100 rounded-md">
                <p className="text-sm text-yellow-800">
                  <strong>Important Note:</strong> This assessment is not a clinical diagnosis. 
                  If you're experiencing significant distress, please consult with a healthcare professional.
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between">
            <Button onClick={resetAssessment} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Start New Assessment
            </Button>
            
            <Button>
              <Download className="mr-2 h-4 w-4" />
              Download Report
            </Button>
          </div>
        </>
      ) : (
        <div className="p-12 text-center">
          <p>No report data available. Please complete the assessment first.</p>
          <Button 
            onClick={() => setActiveTab('questions')}
            className="mt-4"
          >
            Go to Assessment
          </Button>
        </div>
      )}
    </div>
  );
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex border-b">
        <button
          onClick={() => setActiveTab('questions')}
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === 'questions' 
              ? 'border-b-2 border-blue-600 text-blue-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Assessment
        </button>
        <button
          onClick={() => setActiveTab('report')}
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === 'report' 
              ? 'border-b-2 border-blue-600 text-blue-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          disabled={!showReport}
        >
          Report
        </button>
      </div>
      
      {activeTab === 'questions' && renderQuestionsTab()}
      {activeTab === 'report' && renderReportTab()}
    </div>
  );
};

export default MentalHealthAnalysis; 