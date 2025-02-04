import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ChatInterface from './components/ChatInterface';  // Add this import
import LandingPage from './components/LandingPage';     // Add this import

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />  {/* Changed path to "/" for landing page */}
        <Route path="/chat" element={<ChatInterface />} />  {/* Changed path to "/chat" for chat interface */}
      </Routes>
    </Router>
  );
};

export default App;
