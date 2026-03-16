import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import InterviewSession from "./pages/InterviewSession";
import ResumeAnalysis from "./pages/ResumeAnalysis";
import Analytics from "./pages/Analytics";
import AdminPanel from "./pages/AdminPanel";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import StarfieldCanvas from "./components/StarfieldCanvas";
import CursorGlow from "./components/CursorGlow";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";

const App = () => {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <StarfieldCanvas />
        <CursorGlow />
        <NavBar />
        <main className="page-shell">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/interview" element={<InterviewSession />} />
            <Route path="/resume" element={<ResumeAnalysis />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
};

export default App;
