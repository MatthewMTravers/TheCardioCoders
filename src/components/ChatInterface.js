import React, { useState } from "react";
import { MessageCircle, Send, Dumbbell, Apple, Calendar } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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

  const sendMessage = async (userMessage) => {
    setLoading(true);
    setMessages((prev) => [...prev, { type: "user", content: userMessage }]);

    try {
      const response = await fetch(`http://127.0.0.1:5000/chat/stream?message=${userMessage}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let partialMessage = "";
      let firstChunkReceived = false;

      // Function to process each chunk of the stream
      const processChunk = (chunk) => {
        const lines = chunk.split('\n\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.substring(6); // Remove 'data: ' prefix
            partialMessage += data + " ";
            setMessages((prev) => {
              const lastMessage = prev[prev.length - 1];
              if (lastMessage && lastMessage.type === "bot" && lastMessage.content.endsWith(".")) {
                return [...prev.slice(0, -1), { type: "bot", content: partialMessage.trim() + "." }];
              } else {
                return [...prev, { type: "bot", content: partialMessage.trim() + "." }];
              }
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
          // Stream finished, add any remaining partial message
          if (partialMessage) {
            setMessages((prev) => {
              const lastMessage = prev[prev.length - 1];
              if (lastMessage && lastMessage.type === "bot" && lastMessage.content.endsWith(".")) {
                return [...prev.slice(0, -1), { type: "bot", content: partialMessage.trim() }];
              } else {
                return [...prev, { type: "bot", content: partialMessage.trim() }];
              }
            });
          }
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
    setInput('');
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
        <div className="flex gap-2 p-4">
          <button
            onClick={() => handleQuickAction("workout")}
            className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
          >
            <Dumbbell className="w-4 h-4" />
            Workout Plan
          </button>
          <button
            onClick={() => handleQuickAction("meal")}
            className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors"
          >
            <Apple className="w-4 h-4" />
            Meal Plan
          </button>
          <button
            onClick={() => handleQuickAction("equipment")}
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
              className={`flex ${
                message.type === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[70%] p-3 rounded-lg ${
                  message.type === "user"
                    ? "bg-blue-500 text-white rounded-br-none"
                    : "bg-gray-100 text-gray-800 rounded-bl-none"
                }`}
              >
                {message.type === "bot" ? (
                  <ReactMarkdown
                  remarkPlugins={[remarkGfm]} //this allows for bullet point support
                  components={{
                    h1: ({ node, ...props }) => <h1 className="text-2xl font-bold" {...props} />,
                    h2: ({ node, ...props }) => <h2 className="text-xl font-semibold" {...props} />,
                    h3: ({ node, ...props }) => <h3 className="text-lg font-medium" {...props} />,
                    ul: ({ node, ...props }) => <ul className="list-disc pl-5" {...props} />,
                    ol: ({ node, ...props }) => <ol className="list-decimal pl-5" {...props} />,
                    li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                    p: ({ node, ...props }) => <p className="mb-2" {...props} />,
                  }}
                  >
                    {message.content}
                  </ReactMarkdown>
                ) : (
                  message.content  
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-800 p-3 rounded-lg">
                . . .
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
              placeholder="Ask about workouts, meal plans, or equipment..."
              className="flex-1 p-2 border rounded-lg focus:outline-none focus:border-blue-500"
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