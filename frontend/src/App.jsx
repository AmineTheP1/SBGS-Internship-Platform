import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Chatbot from "./components/Chatbot";
import Home from "./pages/Home";
import Apply from "./pages/Apply";
import HRPortal from "./pages/HRPortal";
import Contact from "./pages/Contact";
import Dashboard from "./components/Dashboard";
import CandidateDetails from './pages/CandidateDetails';
import UserTypeSelection from './pages/UserTypeSelection';
import CandidateLogin from './pages/CandidateLogin';
import CandidateDashboard from './pages/CandidateDashboard';
import SupervisorLogin from './pages/SupervisorLogin';
import SupervisorDashboard from './pages/SupervisorDashboard';

function App() {
  return (
    <div className="bg-gray-50 min-h-screen font-poppins">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/apply" element={<Apply />} />
        <Route path="/login" element={<UserTypeSelection />} />
        <Route path="/hr-login" element={<HRPortal />} />
        <Route path="/candidate-login" element={<CandidateLogin />} />
        <Route path="/supervisor-login" element={<SupervisorLogin />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/admin" element={<Dashboard />} />
        <Route path="/candidate-dashboard" element={<CandidateDashboard />} />
        <Route path="/supervisor-dashboard" element={<SupervisorDashboard />} />
        <Route path="/candidature/:id" element={<CandidateDetails />} />
      </Routes>
      <Footer />
      <Chatbot />
    </div>
  );
}

export default App;
