import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import GlassCard from "../components/GlassCard";
import { api } from "../api";

const Auth = () => {
  const [mode, setMode] = useState("login");
  const [password, setPassword] = useState("");
  const [form, setForm] = useState({ name: "", email: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const strength = Math.min(100, password.length * 10);

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const payload = { ...form, password };
      const data = mode === "login" ? await api.login(payload) : await api.register(payload);
      localStorage.setItem("interviewai_token", data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section">
      <GlassCard className="form-card">
        <div className="badge">Welcome Back to InterviewAI</div>
        <h2>{mode === "login" ? "Sign In" : "Create Account"}</h2>
        <p className="section-caption">Your next opportunity starts here.</p>

        {mode === "signup" && (
          <div className="input-group">
            <label>Name</label>
            <input
              className="input-field"
              placeholder="Alex Johnson"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
            />
          </div>
        )}
        <div className="input-group">
          <label>Email</label>
          <input
            className="input-field"
            placeholder="alex@email.com"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
          />
        </div>
        <div className="input-group">
          <label>Password</label>
          <input
            className="input-field"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter a strong password"
          />
          <div className="password-strength">
            <span style={{ width: `${strength}%` }} />
          </div>
        </div>
        {error && <div className="badge" style={{ background: "rgba(239, 68, 68, 0.2)" }}>{error}</div>}
        <button className="primary-button" style={{ width: "100%" }} onClick={handleSubmit} disabled={loading}>
          {loading ? "Working..." : mode === "login" ? "Log In" : "Create Account"}
        </button>
        <button
          className="secondary-button"
          style={{ width: "100%", marginTop: "12px" }}
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
        >
          {mode === "login" ? "Need an account? Sign up" : "Have an account? Log in"}
        </button>
      </GlassCard>
    </div>
  );
};

export default Auth;
