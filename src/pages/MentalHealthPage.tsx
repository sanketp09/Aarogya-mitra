import React from 'react';
import Layout from '../components/Layout';
import MentalHealthAnalysis from '../components/MentalHealthAnalysis';

const MentalHealthPage: React.FC = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold mb-6">AROGYA MITRA Mental Health</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Comprehensive Mental Health Assessment</h2>
          <p className="text-gray-600 mb-4">
            Take our in-depth mental health assessment with facial expression analysis to get personalized insights and recommendations.
          </p>
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
            <p className="text-sm text-blue-700">
              <strong>New Feature:</strong> Our assessment now includes optional facial expression analysis to provide deeper insights into your emotional responses.
            </p>
          </div>
          
          <MentalHealthAnalysis />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Meditation Exercises</h2>
            <p className="text-gray-600 mb-4">
              Practice mindfulness and relaxation with our guided meditation sessions.
            </p>
            <ul className="space-y-3">
              <li className="flex p-3 bg-gray-50 rounded-md">
                <span className="mr-3">🧘</span>
                <div>
                  <h3 className="font-medium">5-Minute Breathing Exercise</h3>
                  <p className="text-sm text-gray-500">Perfect for quick stress relief</p>
                </div>
              </li>
              <li className="flex p-3 bg-gray-50 rounded-md">
                <span className="mr-3">🌿</span>
                <div>
                  <h3 className="font-medium">Nature Sound Meditation</h3>
                  <p className="text-sm text-gray-500">Relax with calming nature sounds</p>
                </div>
              </li>
              <li className="flex p-3 bg-gray-50 rounded-md">
                <span className="mr-3">🌙</span>
                <div>
                  <h3 className="font-medium">Sleep Meditation</h3>
                  <p className="text-sm text-gray-500">Improve your sleep quality</p>
                </div>
              </li>
            </ul>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Mental Health Resources</h2>
            <p className="text-gray-600 mb-4">
              Helpful articles and resources for maintaining good mental health.
            </p>
            <ul className="space-y-3">
              <li className="flex p-3 bg-gray-50 rounded-md">
                <span className="mr-3">📝</span>
                <div>
                  <h3 className="font-medium">Understanding Anxiety</h3>
                  <p className="text-sm text-gray-500">Learn about anxiety symptoms and management</p>
                </div>
              </li>
              <li className="flex p-3 bg-gray-50 rounded-md">
                <span className="mr-3">📚</span>
                <div>
                  <h3 className="font-medium">Coping with Loneliness</h3>
                  <p className="text-sm text-gray-500">Strategies for seniors to combat isolation</p>
                </div>
              </li>
              <li className="flex p-3 bg-gray-50 rounded-md">
                <span className="mr-3">🏥</span>
                <div>
                  <h3 className="font-medium">Finding Mental Health Support</h3>
                  <p className="text-sm text-gray-500">Directory of services for seniors</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Mood Tracker</h2>
          <p className="text-gray-600 mb-4">
            Monitor your emotional wellbeing over time by tracking your daily mood.
          </p>
          <div className="flex flex-wrap gap-3 mb-4">
            <button className="flex items-center justify-center flex-col p-3 border rounded-md hover:bg-gray-50">
              <span className="text-2xl mb-1">😊</span>
              <span className="text-sm">Happy</span>
            </button>
            <button className="flex items-center justify-center flex-col p-3 border rounded-md hover:bg-gray-50">
              <span className="text-2xl mb-1">😐</span>
              <span className="text-sm">Neutral</span>
            </button>
            <button className="flex items-center justify-center flex-col p-3 border rounded-md hover:bg-gray-50">
              <span className="text-2xl mb-1">😢</span>
              <span className="text-sm">Sad</span>
            </button>
            <button className="flex items-center justify-center flex-col p-3 border rounded-md hover:bg-gray-50">
              <span className="text-2xl mb-1">😠</span>
              <span className="text-sm">Angry</span>
            </button>
            <button className="flex items-center justify-center flex-col p-3 border rounded-md hover:bg-gray-50">
              <span className="text-2xl mb-1">😰</span>
              <span className="text-sm">Anxious</span>
            </button>
          </div>
          <div className="flex justify-end">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
              Track Today's Mood
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MentalHealthPage; 