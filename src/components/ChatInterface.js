import React, { useState } from "react";
import { MessageCircle, Send, Dumbbell, Apple, Calendar, Save, Printer, Trash2, Eye } from "lucide-react";
import ReactMarkdown from "react-markdown";
import jsPDF from "jspdf";

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
  const [savedExercises, setSavedExercises] = useState([]);
  const [showSavedExercises, setShowSavedExercises] = useState(false);
  const [expandedExercises, setExpandedExercises] = useState({});

  const sendMessage = async (userMessage) => {
    setLoading(true);
    setMessages((prev) => [...prev, { type: "user", content: userMessage }]);

    try {
      const response = await fetch("http://127.0.0.1:5000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await response.json();
      setMessages((prev) => [...prev, { type: "bot", content: data.answer }]);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        { type: "bot", content: "Sorry, I couldn't process that request." },
      ]);
    }

    setLoading(false);
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
    setInput("");
    sendMessage(selectedMessage);
  };

  const saveExercise = (exerciseText) => {
    if (!savedExercises.includes(exerciseText)) {
      setSavedExercises((prev) => [...prev, exerciseText]);
    }
  };

  const removeExercise = (index) => {
    setSavedExercises((prev) => prev.filter((_, i) => i !== index));
  };

  const printExercises = () => {
    if (savedExercises.length === 0) return;
    const doc = new jsPDF();
    doc.setFont("helvetica");
    doc.setFontSize(14);
    doc.text("Saved Exercises", 10, 10);
    doc.setFontSize(12);

    savedExercises.forEach((exercise, index) => {
      doc.text(`${index + 1}. ${exercise}`, 10, 20 + index * 10, { maxWidth: 180 });
    });

    doc.save("Saved_Exercises.pdf");
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
          <button onClick={() => handleQuickAction("workout")} className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors">
            <Dumbbell className="w-4 h-4" /> Workout Plan
          </button>
          <button onClick={() => handleQuickAction("meal")} className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors">
            <Apple className="w-4 h-4" /> Meal Plan
          </button>
          <button onClick={() => handleQuickAction("equipment")} className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 transition-colors">
            <Calendar className="w-4 h-4" /> Equipment Guide
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div key={index} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[70%] p-3 rounded-lg ${message.type === "user" ? "bg-blue-500 text-white rounded-br-none" : "bg-gray-100 text-gray-800 rounded-bl-none"}`}>
                {message.type === "bot" ? (
                  <>
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                    {/* Disable Save button for the first bot message */}
                    {index !== 0 && (
                      <button onClick={() => saveExercise(message.content)} className="mt-2 px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600">
                        <Save className="w-4 h-4 inline-block mr-1" /> Save
                      </button>
                    )}
                  </>
                ) : (
                  message.content
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Saved Exercises Toggle & Print */}
        {savedExercises.length > 0 && (
          <div className="p-4 border-t bg-gray-50 text-right">
            <button onClick={() => setShowSavedExercises(!showSavedExercises)} className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 mr-2">
              <Eye className="w-5 h-5 inline-block mr-1" /> {showSavedExercises ? "Hide Saved Exercises" : "Show Saved Exercises"}
            </button>
            <button onClick={printExercises} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              <Printer className="w-5 h-5 inline-block mr-1" /> Print Saved Exercises
            </button>
          </div>
        )}

        {/* Saved Exercises List */}
        {/* Saved Exercises List */}
{showSavedExercises && savedExercises.length > 0 && (
  <div className="p-4 border-t bg-gray-50">
    <h2 className="text-lg font-semibold mb-2">Saved Exercises</h2>
    <ul className="list-none text-gray-700">
      {savedExercises.map((exercise, idx) => {
        const isExpanded = expandedExercises[idx];
        const previewText = exercise.split("\n")[0].slice(0, 100) + "..."; // Show first 100 characters

        return (
          <li key={idx} className="bg-yellow-100 p-3 rounded-md mb-2 shadow">
            <div className="flex justify-between items-center">
              <span>{isExpanded ? exercise : previewText}</span>
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
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about workouts, meal plans, or equipment..." className="flex-1 p-2 border rounded-lg focus:outline-none focus:border-blue-500" />
            <button onClick={handleSend} className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors" disabled={loading}>
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
