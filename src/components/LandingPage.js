import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Dumbbell, Brain, Apple, BarChart, ArrowRight, MessageCircle } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  const handleChatClick = () => {
    navigate('/chat');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-20 pb-16">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-5xl font-bold mb-6 text-gray-900">
            Your Personal Fitness Journey Starts Here
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Get personalized workout plans, nutrition advice, and equipment guidance from our AI-powered fitness assistant
          </p>
          <button 
            onClick={handleChatClick}
            className="bg-blue-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
          >
            Start Chatting Now
            <MessageCircle className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
          Everything You Need to Succeed
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard 
            icon={<Dumbbell className="w-8 h-8 text-blue-600" />}
            title="Custom Workout Plans"
            description="Get personalized exercise routines based on your goals, experience, and available equipment"
          />
          <FeatureCard 
            icon={<Apple className="w-8 h-8 text-green-600" />}
            title="Nutrition Guidance"
            description="Receive tailored meal plans and nutritional advice to support your fitness journey"
          />
          <FeatureCard 
            icon={<Brain className="w-8 h-8 text-purple-600" />}
            title="Expert Knowledge"
            description="Access comprehensive information about proper form, equipment usage, and exercise variations"
          />
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            How It Works
          </h2>
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col gap-8">
              <Step 
                number="1"
                title="Tell us your goals"
                description="Whether you want to build muscle, lose weight, or improve fitness, we'll customize your plan"
              />
              <Step 
                number="2"
                title="Get your personalized plan"
                description="Receive detailed workout routines and nutrition guidance tailored to your needs"
              />
              <Step 
                number="3"
                title="Track your progress"
                description="Stay motivated with progress tracking and regular check-ins"
              />
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="bg-blue-600 rounded-2xl p-8 md:p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Transform Your Fitness Journey?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of users who have already achieved their fitness goals
          </p>
          <button 
            onClick={handleChatClick}
            className="bg-white text-blue-600 px-8 py-4 rounded-full text-lg font-semibold hover:bg-blue-50 transition-colors inline-flex items-center gap-2"
          >
            Get Started
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper Components
const FeatureCard = ({ icon, title, description }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div className="mb-4">{icon}</div>
    <h3 className="text-xl font-semibold mb-2 text-gray-900">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

const Step = ({ number, title, description }) => (
  <div className="flex items-start gap-4">
    <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold">
      {number}
    </div>
    <div>
      <h3 className="text-xl font-semibold mb-2 text-gray-900">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  </div>
);

export default LandingPage;