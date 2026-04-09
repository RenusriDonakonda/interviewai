import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import InterviewSession from "./pages/InterviewSession";
import ResumeAnalysis from "./pages/ResumeAnalysis";
import Analytics from "./pages/Analytics";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import StarfieldCanvas from "./components/StarfieldCanvas";
import CursorGlow from "./components/CursorGlow";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";

const RequireAuth = ({ children }) => {
  const token = localStorage.getItem("interviewai_token");
  if (!token) {
    return <Navigate to="/auth" replace />;
  }
  return children;
};

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
            <Route
              path="/dashboard"
              element={(
                <RequireAuth>
                  <Dashboard />
                </RequireAuth>
              )}
            />
            <Route
              path="/interview"
              element={(
                <RequireAuth>
                  <InterviewSession />
                </RequireAuth>
              )}
            />
            <Route
              path="/resume"
              element={(
                <RequireAuth>
                  <ResumeAnalysis />
                </RequireAuth>
              )}
            />
            <Route
              path="/analytics"
              element={(
                <RequireAuth>
                  <Analytics />
                </RequireAuth>
              )}
            />
            <Route
              path="/profile"
              element={(
                <RequireAuth>
                  <Profile />
                </RequireAuth>
              )}
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
};

export default App;
