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
  Eye,
  Video,
  PlayCircle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import VideoLinks from "./VideoLinks";

const ChatInterface = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    {
      id: '1',
      type: 'bot',
      content:
        "Hello! I'm your fitness assistant. I can help you with workout plans, meal planning, and gym equipment guidance. What would you like to know?",
      rating: null,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [savedExercises, setSavedExercises] = useState([]);
  const [showSavedExercises, setShowSavedExercises] = useState(false);
  const [expandedExercises, setExpandedExercises] = useState({});
  
  // New state for video functionality
  const [videoUrl, setVideoUrl] = useState(null);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [videoLinks, setVideoLinks] = useState([]);

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input.trim());
    setInput('');
  };
  
  const sendMessage = async (userMessage, isRegeneration = false) => {
    setLoading(true);
    setVideoUrl(null);
    setShowVideoPlayer(false);
  
    if (!isRegeneration) {
      const newUserMessage = {
        id: Date.now().toString(),
        type: 'user',
        content: userMessage,
      };
      setMessages((prev) => [...prev, newUserMessage]);
    }
  
    try {
      const response = await fetch(`http://127.0.0.1:5000/chat/stream?message=${userMessage}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let partialMessage = '';
      let firstChunkReceived = false;
      const botMessageId = (Date.now() + 1).toString();
      let collectingVideoLinks = false;
      let videoLinksData = "";

      // Function to process each chunk of the stream
      const processChunk = (chunk) => {
        const lines = chunk.split('\n\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            let data = line.substring(6);
  
            // Video URL detection
            const videoMatch = data.match(/(https?:\/\/\S+\.(?:mp4|avi|mov|webm)|youtube\.com\/watch\?v=[\w-]+|youtu\.be\/[\w-]+)/);
            if (videoMatch) {
              setVideoUrl(videoMatch[1]);
              setShowVideoPlayer(true);
            }
  
            // Markdown formatting
            if (
              data.match(/^#{1,6}\s/) ||
              data.match(/^\*\s/) ||
              data.match(/^\d+\.\s/) ||
              data.match(/^\*\*.+\*\*$/) ||
              data.match(/^\*.+\*$/)
            ) {
              data = '\n\n' + data;
            } else if (data.trim().length > 0 && !partialMessage.endsWith('\n')) {
              data = ' ' + data;
            }
  
            partialMessage += data;
  
            setMessages((prev) => {
              const lastMessage = prev[prev.length - 1];
              if (lastMessage?.type === 'bot') {
                return [...prev.slice(0, -1), { ...lastMessage, content: partialMessage.trim() }];
              } else {
                return [
                  ...prev,
                  { id: botMessageId, type: 'bot', content: partialMessage.trim(), rating: null },
                ];
              }
            });
            
            // Handle video links special messages
            if (data === 'VIDEO_LINKS_START') {
              collectingVideoLinks = true;
              videoLinksData = "";
              continue;
            }
            
            if (data === 'VIDEO_LINKS_END') {
              collectingVideoLinks = false;
              try {
                const parsedLinks = JSON.parse(videoLinksData);
                setVideoLinks(parsedLinks);
              } catch (e) {
                console.error('Error parsing video links:', e);
              }
              continue;
            }
            
            if (collectingVideoLinks) {
              videoLinksData += data;
              continue;
            }
            
            // Handle normal message content
            partialMessage += data + " ";
            
            // Update the last bot message with the new content
            setMessages((prev) => {
              const updatedMessages = [...prev];
              const lastMessageIndex = updatedMessages.findIndex(msg => msg.type === "bot" && msg.partial);
              
              if (lastMessageIndex !== -1) {
                // Update existing partial message
                updatedMessages[lastMessageIndex] = {
                  ...updatedMessages[lastMessageIndex],
                  content: partialMessage.trim(),
                };
              } else {
                // Add new bot message
                updatedMessages.push({
                  type: "bot",
                  content: partialMessage.trim(),
                  partial: true,
                });
              }
              
              return updatedMessages;
            });
  
            if (!firstChunkReceived) {
              setLoading(false);
              firstChunkReceived = true;
            }
          }
        }
      };
  
      const readChunk = async () => {
        const { done, value } = await reader.read();

        if (done) {
          // Stream finished, add any remaining partial message and mark as complete
          setMessages((prev) => {
            return prev.map(msg => 
              msg.partial ? { ...msg, partial: false } : msg
            );
          });
          return;
        }

        const chunk = decoder.decode(value);
        processChunk(chunk);
        readChunk();
      };
  
      readChunk();
    } catch (err) {
      console.error('Error sending message:', err);
  
      const isVideoAction = userMessage.toLowerCase().includes('video');
      if (isVideoAction) {
        const fallbackVideoUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
        setVideoUrl(fallbackVideoUrl);
        setShowVideoPlayer(true);
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            type: 'bot',
            content: "I couldn't process the request fully, but here's a sample video.",
            rating: null,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            type: 'bot',
            content: "Sorry, I couldn't process that request.",
            rating: null,
          },
        ]);
      }
  
      setLoading(false);
    }
  };
  
  const handleRegenerate = () => {
    const reversedMessages = [...messages].reverse();
    const lastBotMessage = reversedMessages.find((msg) => msg.type === 'bot' && msg.id !== '1');
  
    if (lastBotMessage) {
      const precedingUserMessage = reversedMessages.find((msg, index, arr) =>
        msg.type === 'user' &&
        arr.slice(0, index).find((m) => m.type === 'bot')?.id === lastBotMessage.id
      );
  
      setMessages((prev) => prev.filter((msg) => msg.id !== lastBotMessage.id));
  
      if (precedingUserMessage) {
        sendMessage(precedingUserMessage.content, true);
      }
    }
  };
  
  const saveExercise = (content) => {
    setSavedExercises((prev) => [...prev, content]);
  };

  const removeExercise = (index) => {
    setSavedExercises((prev) => prev.filter((_, i) => i !== index));
    setExpandedExercises((prev) => {
      const updated = { ...prev };
      delete updated[index];
      return updated;
    });
  };

  const handleRating = (messageId, direction) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId
          ? { ...msg, rating: msg.rating === direction ? null : direction }
          : msg
      )
    );
  };

  const downloadExercisesPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text('Saved Exercises', 10, 10);
    savedExercises.forEach((exercise, index) => {
      doc.text(`${index + 1}. ${exercise}`, 10, 20 + index * 10);
    });
    doc.save('saved_exercises.pdf');
  };

  const formatContent = (content) => (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: (props) => <h1 className="text-2xl font-bold mb-2" {...props} />,
        h2: (props) => <h2 className="text-xl font-semibold mb-2" {...props} />,
        h3: (props) => <h3 className="text-lg font-medium mb-2" {...props} />,
        ul: (props) => <ul className="list-disc pl-5 mb-2" {...props} />,
        ol: (props) => <ol className="list-decimal pl-5 mb-2" {...props} />,
        li: (props) => <li className="mb-1" {...props} />,
        p: (props) => <p className="mb-2" {...props} />,
      }}
    >
      {content}
    </ReactMarkdown>
  );

  const handleQuickAction = (action) => {
    const quickActions = {
      workout: 'I need a workout plan',
      meal: 'Help me create a meal plan',
      equipment: 'Guide me through gym equipment',
      video: 'Show me a fitness demonstration video'
    };
    sendMessage(quickActions[action]);
    setInput('');
  };

  const isLastBotMessage = (messageId) => {
    const botMessages = messages.filter(msg => msg.type === 'bot' && msg.id !== '1');
    return botMessages.length > 0 && botMessages[botMessages.length - 1].id === messageId;
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
          <div className="flex items-center gap-2">
            {videoUrl && (
              <button
                onClick={() => setShowVideoPlayer(!showVideoPlayer)}
                className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
              >
                <Video className="w-5 h-5" />
                {showVideoPlayer ? "Hide Video" : "Show Video"}
              </button>
            )}
            <button
              onClick={() => navigate('/bookmarks')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
            >
              <Bookmark className="w-5 h-5" />
              My Bookmarks
            </button>
          </div>
        </div>
  

        {/* Quick Actions */}
        <div className="flex gap-2 p-4 overflow-x-auto">
          <button
            onClick={() => handleQuickAction("workout")}
            className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors whitespace-nowrap"
          >
            <Dumbbell className="w-4 h-4" />
            Workout Plan
          </button>
          <button
            onClick={() => handleQuickAction("meal")}
            className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors whitespace-nowrap"
          >
            <Apple className="w-4 h-4" />
            Meal Plan
          </button>
          <button
            onClick={() => handleQuickAction("equipment")}
            className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 transition-colors whitespace-nowrap"
          >
            <Calendar className="w-4 h-4" />
            Equipment Guide
          </button>
          <button
            onClick={() => handleQuickAction("video")}
            className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition-colors"
          >
            <PlayCircle className="w-4 h-4" />
            Fitness Video
          </button>
        </div>

        {/* Video Player */}
        {videoUrl && showVideoPlayer && (
          <div className="p-4 border-b bg-gray-50">
            <div className="w-full aspect-video">
              {videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be') ? (
                <iframe 
                  src={videoUrl.replace('watch?v=', 'embed/').split('&')[0]}
                  title="YouTube Video"
                  className="w-full h-full"
                  allowFullScreen
                />
              ) : (
                <video 
                  controls 
                  className="w-full h-full"
                >
                  <source src={videoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              )}
            </div>
          </div>
        )}

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className="max-w-[80%]">
                <div
                  className={`p-3 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-blue-500 text-white rounded-br-none'
                      : 'bg-gray-100 text-gray-800 rounded-bl-none'
                  }`}
                >
                  {message.type === 'bot' ? (
                    <>
                      {formatContent(message.content)}
                      {message.id !== '1' && (
                        <button onClick={() => saveExercise(message.content)} className="mt-2 px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600">
                          <Save className="w-4 h-4 inline-block mr-1" /> Save
                        </button>
                      )}
                    </>
                  ) : message.content}
                </div>
                {message.type === 'bot' && message.id !== '1' && (
                  <div className="flex items-center gap-2 mt-2">
                    <button onClick={() => handleRating(message.id, 'up')} className={`p-1 rounded hover:bg-gray-100 ${message.rating === 'up' ? 'text-green-500' : 'text-gray-500'}`}>
                      <ThumbsUp className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleRating(message.id, 'down')} className={`p-1 rounded hover:bg-gray-100 ${message.rating === 'down' ? 'text-red-500' : 'text-gray-500'}`}>
                      <ThumbsDown className="w-4 h-4" />
                    </button>
                    {isLastBotMessage(message.id) && (
                      <button
                        onClick={() => handleRegenerate(message.id)}
                        disabled={loading}
                        className="p-1 rounded hover:bg-gray-100 text-gray-500"
                      >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                      </button>
                    )}
                  </div>
                )}
                {message.type === "bot" && message.id !== '1' && videoLinks.length > 0 && index === messages.length - 1 && (
                  <VideoLinks videoLinks={videoLinks} />
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-800 p-3 rounded-lg">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "600ms" }}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Saved Exercises Toggle & Download */}
        {savedExercises.length > 0 && (
          <div className="p-4 border-t bg-gray-50 text-right">
            <button onClick={() => setShowSavedExercises(!showSavedExercises)} className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 mr-2">
              <Eye className="w-5 h-5 inline-block mr-1" /> {showSavedExercises ? "Hide Saved Exercises" : "Show Saved Exercises"}
            </button>
            <button onClick={downloadExercisesPDF} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
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
                const previewText = exercise.split('\n')[0].slice(0, 100) + "...";
                return (
                  <li key={idx} className="bg-yellow-100 p-3 rounded-md mb-2 shadow">
                    <div className="flex justify-between items-start">
                      <div className="whitespace-pre-line overflow-hidden">{isExpanded ? formatContent(exercise) : previewText}</div>
                      <div className="flex flex-col ml-3 items-end gap-2">
                        <button onClick={() => setExpandedExercises((prev) => ({ ...prev, [idx]: !prev[idx] }))} className="text-blue-500 hover:text-blue-700 text-sm">
                          {isExpanded ? "Show Less ▲" : "Show More ▼"}
                        </button>
                        <button onClick={() => removeExercise(idx)} className="text-red-500 hover:text-red-700">
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
        <div className="border-t p-4 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask about workouts, meal plans, or equipment..."
            className="flex-1 p-2 border rounded-lg focus:outline-none focus:border-blue-500"
            disabled={loading}
          />
          <button onClick={handleSend} disabled={loading} className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
