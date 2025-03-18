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
  Bookmark,
  Save,
  Download,
  Trash2,
  Eye
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';

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
  const [loading, setLoading] = useState(false);
  const [savedExercises, setSavedExercises] = useState([]);
  const [showSavedExercises, setShowSavedExercises] = useState(false);
  const [expandedExercises, setExpandedExercises] = useState({});

  const sendMessage = async (userMessage) => {
    setLoading(true);
    const newUserMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: userMessage
    };
    
    setMessages(prev => [...prev, newUserMessage]);

    try {
      const response = await fetch("http://127.0.0.1:5000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await response.json();
      const newBotMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: data.answer,
        rating: null
      };
      
      setMessages(prev => [...prev, newBotMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: "Sorry, I couldn't process that request.",
        rating: null
      };
      
      setMessages(prev => [...prev, errorMessage]);
    }

    setLoading(false);
  };

  const handleSend = () => {
    if (input.trim()) {
      sendMessage(input);
      setInput('');
    }
  };

  const handleQuickAction = (action) => {
    const quickActions = {
      workout: "I need a workout plan",
      meal: "Help me create a meal plan",
      equipment: "Guide me through gym equipment"
    };
    sendMessage(quickActions[action]);
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

  const handleRegenerate = async (messageId) => {
    const messageIndex = messages.findIndex(m => m.id === messageId);
    if (messageIndex === -1) return;

    const userMessage = messageIndex > 0 ? messages[messageIndex - 1] : null;
    if (!userMessage || userMessage.type !== 'user') return;

    setLoading(true);
    
    try {
      const response = await fetch("http://127.0.0.1:5000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage.content }),
      });

      const data = await response.json();
      
      const newBotMessage = {
        id: Date.now().toString(),
        type: 'bot',
        content: data.answer,
        rating: null
      };

      const newMessages = [...messages];
      newMessages[messageIndex] = newBotMessage;
      setMessages(newMessages);
    } catch (error) {
      console.error("Error regenerating response:", error);
      const newBotMessage = {
        id: Date.now().toString(),
        type: 'bot',
        content: "Sorry, I couldn't regenerate a response.",
        rating: null
      };

      const newMessages = [...messages];
      newMessages[messageIndex] = newBotMessage;
      setMessages(newMessages);
    }
    
    setLoading(false);
  };

  const saveExercise = (exerciseText) => {
    if (!savedExercises.includes(exerciseText)) {
      setSavedExercises(prev => [...prev, exerciseText]);
    }
  };

  const removeExercise = (index) => {
    setSavedExercises(prev => prev.filter((_, i) => i !== index));
  };

  // Simplified download function - directly generates PDF
  const downloadExercisesPDF = () => {
    if (savedExercises.length === 0) return;
    
    // Create new PDF document
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text("My Saved Fitness Exercises", 20, 20);
    
    // Set normal text font
    doc.setFontSize(12);
    
    let yPosition = 30;
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const maxWidth = pageWidth - (margin * 2);
    
    // Add date
    const today = new Date();
    doc.text(`Generated on: ${today.toLocaleDateString()}`, margin, yPosition);
    yPosition += 10;
    
    // Add exercises
    savedExercises.forEach((exercise, index) => {
      // Add exercise number
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      yPosition += 10;
      
      // Check if we need a new page
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.text(`Exercise ${index + 1}:`, margin, yPosition);
      yPosition += 7;
      
      // Reset to normal font
      doc.setFontSize(12);
      doc.setFont(undefined, 'normal');
      
      // Split exercise content into lines to handle long text properly
      const splitText = doc.splitTextToSize(exercise, maxWidth);
      
      // Check if we need to add a new page for this exercise
      if (yPosition + (splitText.length * 7) > 270) {
        doc.addPage();
        yPosition = 20;
      }
      
      // Add exercise content
      doc.text(splitText, margin, yPosition);
      yPosition += (splitText.length * 7) + 10;
    });
    
    // Save the PDF
    doc.save('Fitness_Exercises.pdf');
  };

  // Function to format message content with line breaks
  const formatContent = (content) => {
    return content.split('\n').map((line, i) => (
      <React.Fragment key={i}>
        {line}
        <br />
      </React.Fragment>
    ));
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="flex flex-col w-full max-w-4xl mx-auto p-4 bg-white shadow-lg my-4 rounded-lg">
        {/* Header */}
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

        {/* Quick Actions */}
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
                  {message.type === 'bot' ? (
                    <>
                      <div className="whitespace-pre-line">{formatContent(message.content)}</div>
                      {message.id !== '1' && (
                        <button 
                          onClick={() => saveExercise(message.content)} 
                          className="mt-2 px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                        >
                          <Save className="w-4 h-4 inline-block mr-1" /> Save
                        </button>
                      )}
                    </>
                  ) : (
                    message.content
                  )}
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
                      disabled={loading}
                    >
                      <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Saved Exercises Toggle & Download - SIMPLIFIED */}
        {savedExercises.length > 0 && (
          <div className="p-4 border-t bg-gray-50 text-right">
            <button 
              onClick={() => setShowSavedExercises(!showSavedExercises)} 
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 mr-2"
            >
              <Eye className="w-5 h-5 inline-block mr-1" /> {showSavedExercises ? "Hide Saved Exercises" : "Show Saved Exercises"}
            </button>
            <button 
              onClick={downloadExercisesPDF} 
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              <Download className="w-5 h-5 inline-block mr-1" /> Download PDF
            </button>
          </div>
        )}

        {/* Saved Exercises List */}
        {showSavedExercises && savedExercises.length > 0 && (
          <div className="p-4 border-t bg-gray-50">
            <h2 className="text-lg font-semibold mb-2">Saved Exercises</h2>
            <ul className="list-none text-gray-700">
              {savedExercises.map((exercise, idx) => {
                const isExpanded = expandedExercises[idx];
                const previewText = exercise.split('\n')[0].slice(0, 100) + "..."; // Show first 100 characters

                return (
                  <li key={idx} className="bg-yellow-100 p-3 rounded-md mb-2 shadow">
                    <div className="flex justify-between items-center">
                      <div className="whitespace-pre-line overflow-hidden">
                        {isExpanded ? formatContent(exercise) : previewText}
                      </div>
                      <div className="flex items-center">
                        <button
                          onClick={() =>
                            setExpandedExercises((prev) => ({
                              ...prev,
                              [idx]: !prev[idx],
                            }))
                          }
                          className="ml-2 text-blue-500 hover:text-blue-700"
                        >
                          {isExpanded ? "Show Less ▲" : "Show More ▼"}
                        </button>
                        <button
                          onClick={() => removeExercise(idx)}
                          className="ml-3 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

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
              disabled={loading}
            />
            <button
              onClick={handleSend}
              className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              disabled={loading}
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
