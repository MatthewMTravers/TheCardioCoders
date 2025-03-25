import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ChatInterface from './components/ChatInterface';
import LandingPage from './components/LandingPage';
import ExerciseBookmarksPage from './components/ExerciseBookmarksPage';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />  {/* Landing Page */}
        <Route path="/chat" element={<ChatInterface />} />  {/* Chat Interface */}
        <Route path="/bookmarks" element={<ExerciseBookmarksPage />} />  {/* Bookmarks */}
      </Routes>
    </Router>
  );
};

export default App;