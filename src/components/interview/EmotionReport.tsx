import React from 'react';

interface EmotionReportProps {
  emotionData: { [key: string]: number };
  title?: string;
}

// Color mapping for different emotions
const EMOTION_COLORS = {
  angry: '#F44336', // Red
  disgusted: '#9C27B0', // Purple
  fearful: '#FF9800', // Orange
  happy: '#4CAF50', // Green
  sad: '#2196F3', // Blue
  surprised: '#FFEB3B', // Yellow
  neutral: '#607D8B', // Gray
};

const EmotionReport: React.FC<EmotionReportProps> = ({
  emotionData,
  title = 'Emotion Analysis'
}) => {
  // Sort emotions by value in descending order
  const sortedEmotions = Object.entries(emotionData)
    .sort(([, valueA], [, valueB]) => valueB - valueA);
  
  // Find the dominant emotion
  const dominantEmotion = sortedEmotions.length > 0 ? sortedEmotions[0][0] : 'neutral';
  
  // Calculate percentages for display
  const total = Object.values(emotionData).reduce((sum, val) => sum + val, 0);
  const percentages = {};
  Object.entries(emotionData).forEach(([emotion, value]) => {
    percentages[emotion] = total > 0 ? (value / total) * 100 : 0;
  });
  
  // Generate insights based on dominant emotion
  const getInsights = (emotion: string) => {
    switch(emotion) {
      case 'happy':
        return [
          "Your expressions convey positive energy and enthusiasm",
          "Appropriate happiness can make you appear confident",
          "Balance with some neutral expressions during serious topics"
        ];
      case 'sad':
        return [
          "Your expressions may come across as downcast or disappointed",
          "Consider practicing more neutral facial expressions",
          "This could impact how engaged you appear to others"
        ];
      case 'angry':
        return [
          "Your expressions may come across as frustrated or intense",
          "Consider softening your expression during conversations",
          "Take deep breaths to relax facial muscles if feeling tense"
        ];
      case 'fearful':
        return [
          "Your expressions may convey anxiety or nervousness",
          "Practice confidence-building exercises and breathing techniques",
          "Focus on maintaining a calm, composed expression"
        ];
      case 'disgusted':
        return [
          "Your expressions may appear disapproving or critical",
          "Maintain awareness of your reactions to questions",
          "Try to keep a more neutral expression during challenging topics"
        ];
      case 'surprised':
        return [
          "Your expressions show high reactivity or astonishment",
          "While this can show engagement, excessive surprise may seem exaggerated",
          "Balance with neutral expressions to appear composed"
        ];
      case 'neutral':
        return [
          "Your expressions appear balanced and composed",
          "Neutral expressions work well in many contexts",
          "Consider adding appropriate smiles for warmth when relevant"
        ];
      default:
        return [
          "Your expressions show a mix of emotions",
          "Focus on maintaining appropriate expressions for the context",
          "Practice in front of a mirror to improve awareness"
        ];
    }
  };
  
  // Generate advice based on all emotions
  const getAdvice = (emotions: { [key: string]: number }) => {
    const advice = [];
    
    // Check for specific patterns
    if (emotions.happy > 0.6) {
      advice.push("You appear very happy, which is generally positive but may seem excessive in serious discussions.");
    }
    
    if (emotions.neutral > 0.7) {
      advice.push("Your expression is mostly neutral. Consider adding more emotional range to appear engaged.");
    }
    
    if (emotions.sad > 0.3 || emotions.fearful > 0.3) {
      advice.push("Your expression shows signs of sadness or anxiety. Practice confidence-building exercises.");
    }
    
    if (emotions.angry > 0.2 || emotions.disgusted > 0.2) {
      advice.push("Your expression shows some negative emotions. Focus on maintaining a positive or neutral demeanor.");
    }
    
    // Add a general advice if none of the specific conditions were met
    if (advice.length === 0) {
      advice.push("Your emotional expression appears balanced. Continue practicing awareness of your facial expressions.");
    }
    
    return advice;
  };
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-xl font-bold mb-4">{title}</h3>
      
      <div className="mb-6">
        <h4 className="text-md font-semibold mb-2">Emotional Breakdown</h4>
        <div className="space-y-3">
          {sortedEmotions.map(([emotion, value]) => (
            <div key={emotion} className="w-full">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium capitalize">{emotion}</span>
                <span className="text-sm font-medium">{Math.round(percentages[emotion])}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="h-2.5 rounded-full" 
                  style={{ 
                    width: `${percentages[emotion]}%`,
                    backgroundColor: EMOTION_COLORS[emotion] || '#6C63FF'
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mb-6">
        <h4 className="text-md font-semibold mb-2">Dominant Emotion: <span className="capitalize">{dominantEmotion}</span></h4>
        <div className="p-4 bg-gray-50 rounded-md">
          <ul className="list-disc pl-5 space-y-1">
            {getInsights(dominantEmotion).map((insight, index) => (
              <li key={index} className="text-sm">{insight}</li>
            ))}
          </ul>
        </div>
      </div>
      
      <div>
        <h4 className="text-md font-semibold mb-2">Recommendations</h4>
        <div className="p-4 bg-gray-50 rounded-md">
          <ul className="list-disc pl-5 space-y-1">
            {getAdvice(emotionData).map((advice, index) => (
              <li key={index} className="text-sm">{advice}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default EmotionReport; 