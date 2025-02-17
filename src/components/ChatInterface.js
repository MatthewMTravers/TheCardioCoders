import React, { useState } from 'react';
import { 
  MessageCircle, 
  Send, 
  Dumbbell, 
  Apple, 
  Calendar, 
  ThumbsUp, 
  ThumbsDown, 
  RefreshCw, 
  Bookmark 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ChatInterface = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    {
      id: '1',
      type: 'bot',
      content: "Hello! I'm your fitness assistant. I can help you with workout plans, meal planning, and gym equipment guidance. What would you like to know?",
      rating: null
    }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim()) {
      const newMessages = [
        ...messages,
        { id: Date.now().toString(), type: 'user', content: input },
        { 
          id: (Date.now() + 1).toString(), 
          type: 'bot', 
          content: 'Let me help you with that...', 
          rating: null 
        }
      ];
      setMessages(newMessages);
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

  const handleRating = (messageId, newRating) => {
    setMessages(messages.map(message => {
      if (message.id === messageId) {
        const updatedRating = message.rating === newRating ? null : newRating;
        return { ...message, rating: updatedRating };
      }
      return message;
    }));
  };

  const handleRegenerate = (messageId) => {
    const messageIndex = messages.findIndex(m => m.id === messageId);
    if (messageIndex === -1) return;

    const userMessage = messageIndex > 0 ? messages[messageIndex - 1] : null;
    if (!userMessage || userMessage.type !== 'user') return;

    const newBotMessage = {
      id: Date.now().toString(),
      type: 'bot',
      content: `Regenerated response for: ${userMessage.content}`,
      rating: null
    };

    const newMessages = [...messages];
    newMessages[messageIndex] = newBotMessage;
    setMessages(newMessages);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="flex flex-col w-full max-w-4xl mx-auto p-4 bg-white shadow-lg my-4 rounded-lg">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center">
            <MessageCircle className="w-6 h-6 text-blue-500" />
            <h1 className="text-xl font-bold ml-2">Fitness Assistant</h1>
          </div>
          <button
            onClick={() => navigate('/bookmarks')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
          >
            <Bookmark className="w-5 h-5" />
            My Bookmarks
          </button>
        </div>

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

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className="max-w-[70%]">
                <div
                  className={`p-3 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-blue-500 text-white rounded-br-none'
                      : 'bg-gray-100 text-gray-800 rounded-bl-none'
                  }`}
                >
                  {message.content}
                </div>
                
                {message.type === 'bot' && (
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => handleRating(message.id, 'up')}
                      className={`p-1 rounded hover:bg-gray-100 ${
                        message.rating === 'up' ? 'text-green-500' : 'text-gray-500'
                      }`}
                      title={message.rating === 'up' ? 'Remove rating' : 'Rate up'}
                    >
                      <ThumbsUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleRating(message.id, 'down')}
                      className={`p-1 rounded hover:bg-gray-100 ${
                        message.rating === 'down' ? 'text-red-500' : 'text-gray-500'
                      }`}
                      title={message.rating === 'down' ? 'Remove rating' : 'Rate down'}
                    >
                      <ThumbsDown className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleRegenerate(message.id)}
                      className="p-1 rounded hover:bg-gray-100 text-gray-500"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

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
