import React, { useState } from 'react';
import { MessageCircle, Send, Dumbbell, Apple, Calendar } from 'lucide-react';

const ChatInterface = () => {
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      content: "Hello! I'm your fitness assistant. I can help you with workout plans, meal planning, and gym equipment guidance. What would you like to know?"
    }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim()) {
      setMessages([...messages, 
        { type: 'user', content: input },
        { type: 'bot', content: 'Let me help you with that...' } // Placeholder for actual bot response
      ]);
      setInput('');
    }
  };

  const handleQuickAction = (action) => {
    const quickActions = {
      workout: "I need a workout plan",
      meal: "Help me create a meal plan",
      equipment: "Guide me through gym equipment"
    };
    setInput(quickActions[action]);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Main Chat Interface */}
      <div className="flex flex-col w-full max-w-4xl mx-auto p-4 bg-white shadow-lg my-4 rounded-lg">
        {/* Header */}
        <div className="flex items-center p-4 border-b">
          <MessageCircle className="w-6 h-6 text-blue-500" />
          <h1 className="text-xl font-bold ml-2">Fitness Assistant</h1>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex gap-2 p-4">
          <button
            onClick={() => handleQuickAction('workout')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
          >
            <Dumbbell className="w-4 h-4" />
            Workout Plan
          </button>
          <button
            onClick={() => handleQuickAction('meal')}
            className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors"
          >
            <Apple className="w-4 h-4" />
            Meal Plan
          </button>
          <button
            onClick={() => handleQuickAction('equipment')}
            className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 transition-colors"
          >
            <Calendar className="w-4 h-4" />
            Equipment Guide
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] p-3 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-blue-500 text-white rounded-br-none'
                    : 'bg-gray-100 text-gray-800 rounded-bl-none'
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div className="border-t p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about workouts, meal plans, or equipment..."
              className="flex-1 p-2 border rounded-lg focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={handleSend}
              className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
