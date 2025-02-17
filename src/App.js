import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ChatInterface from './components/ChatInterface';
import LandingPage from './components/LandingPage';
import ExerciseBookmarks from './components/ExerciseBookmarks';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />  {/* Changed path to "/" for landing page */}
        <Route path="/chat" element={<ChatInterface />} />  {/* Changed path to "/chat" for chat interface */}
        <Route path="/bookmarks" element={<ExerciseBookmarks />} />  {/* Changed path to "/bookmarks" for Bookmarks */}
      </Routes>
    </Router>
  );
};

export default App;
