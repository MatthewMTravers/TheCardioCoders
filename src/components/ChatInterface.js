import React, { useState } from "react";
import { MessageCircle, Send, Dumbbell, Apple, Calendar, Youtube } from "lucide-react";

// VideoLinks component to display exercise video recommendations
const VideoLinks = ({ videoLinks }) => {
  if (!videoLinks || videoLinks.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
      <h3 className="text-md font-bold mb-2">Exercise Demonstrations</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {videoLinks.map((link, index) => (
          <div key={index} className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
            <h4 className="font-semibold text-sm capitalize">{link.exercise}</h4>
            <p className="text-xs text-gray-600 mb-1">
              Difficulty: <span className="capitalize">{link.difficulty}</span>
            </p>
            <div className="flex space-x-2 mt-2">
              <a
                href={link.video_url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-red-600 text-white px-2 py-1 rounded text-xs text-center hover:bg-red-700 transition-colors flex-1 flex items-center justify-center"
              >
                <Youtube className="w-3 h-3 mr-1" />
                Full Video
              </a>
              <a
                href={link.short_url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-700 text-white px-2 py-1 rounded text-xs text-center hover:bg-gray-800 transition-colors flex-1 flex items-center justify-center"
              >
                <Youtube className="w-3 h-3 mr-1" />
                Short
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ChatInterface = () => {
  const [messages, setMessages] = useState([
    {
      type: "bot",
      content:
        "Hello! I'm your fitness assistant. I can help you with workout plans, meal planning, and gym equipment guidance. What would you like to know?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [videoLinks, setVideoLinks] = useState([]);

  const sendMessage = async (userMessage) => {
    setLoading(true);
    setMessages((prev) => [...prev, { type: "user", content: userMessage }]);
    setVideoLinks([]); // Clear previous video links

    try {
      const response = await fetch(`http://127.0.0.1:5000/chat/stream?message=${encodeURIComponent(userMessage)}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let partialMessage = "";
      let firstChunkReceived = false;
      let collectingVideoLinks = false;
      let videoLinksData = "";

      // Function to process each chunk of the stream
      const processChunk = (chunk) => {
        const lines = chunk.split('\n\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.substring(6); // Remove 'data: ' prefix
            
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

            // Set loading to false as soon as the first chunk is received
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

        readChunk(); // Read the next chunk
      };

      readChunk(); // Start reading the stream

    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        { type: "bot", content: "Sorry, I couldn't process that request." },
      ]);
      setLoading(false);
    }

    setInput("");
  };

  const handleSend = () => {
    if (input.trim()) {
      sendMessage(input);
      setInput("");
    }
  };

  const handleQuickAction = (action) => {
    const quickActions = {
      workout: "I need a workout plan",
      meal: "Help me create a meal plan",
      equipment: "Guide me through gym equipment",
    };
    const selectedMessage = quickActions[action];
    setInput(selectedMessage);
    sendMessage(selectedMessage);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="flex flex-col w-full max-w-4xl mx-auto p-4 bg-white shadow-lg my-4 rounded-lg">
        {/* Header */}
        <div className="flex items-center p-4 border-b">
          <MessageCircle className="w-6 h-6 text-blue-500" />
          <h1 className="text-xl font-bold ml-2">Fitness Assistant</h1>
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
            onClick={() => sendMessage("Show me how to do a proper push-up")}
            className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition-colors whitespace-nowrap"
          >
            <Youtube className="w-4 h-4" />
            Exercise Demos
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.type === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.type === "user"
                    ? "bg-blue-500 text-white rounded-br-none"
                    : "bg-gray-100 text-gray-800 rounded-bl-none"
                }`}
              >
                {message.content}
                
                {/* Show video links below the last bot message if available */}
                {message.type === "bot" && 
                 index === messages.length - 1 && 
                 videoLinks.length > 0 && 
                 <VideoLinks videoLinks={videoLinks} />}
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

        {/* Input Area */}
        <div className="border-t p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask about workouts, meal plans, or specific exercises..."
              className="flex-1 p-2 border rounded-lg focus:outline-none focus:border-blue-500"
              disabled={loading}
            />
            <button
              onClick={handleSend}
              className={`p-2 ${loading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'} text-white rounded-lg transition-colors`}
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