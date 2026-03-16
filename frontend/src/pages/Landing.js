import React from "react";
import { useNavigate } from "react-router-dom";
import GlassCard from "../components/GlassCard";
import DemoPreview from "../components/DemoPreview";
import StatsCounter from "../components/StatsCounter";
import TestimonialCarousel from "../components/TestimonialCarousel";
import Logo from "../components/Logo";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div>
      <section className="hero">
        <div>
          <Logo withMark />
          <h1 className="hero-title">
            <span className="gradient-text">Where Intelligence Meets Opportunity</span>
          </h1>
          <p className="hero-subtitle">
            Let&#39;s practice with purpose. InterviewAI delivers AI-powered evaluation, personalized feedback, and
            performance analytics for every interview stage.
          </p>
          <div className="hero-actions">
            <button className="primary-button" onClick={() => navigate("/auth")}>
              Start Practicing
            </button>
            <button className="secondary-button" onClick={() => navigate("/dashboard")}>
              View Demo
            </button>
          </div>
        </div>
        <DemoPreview />
      </section>

      <section className="section">
        <h2 className="section-title">Core Features</h2>
        <p className="section-caption">Speak with confidence. Backed by intelligence.</p>
        <div className="features-grid">
          {[
            "AI Answer Evaluation",
            "Resume-Based Questions",
            "Performance Analytics",
            "Personalized Feedback"
          ].map((feature) => (
            <GlassCard key={feature}>
              <h3>{feature}</h3>
              <p className="section-caption">Precision insights tuned for career readiness.</p>
            </GlassCard>
          ))}
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">InterviewAI By The Numbers</h2>
        <div className="stats-grid">
          <StatsCounter value={10000} label="Interviews Analyzed" suffix="+" />
          <StatsCounter value={92} label="Average Confidence Lift" suffix="%" />
          <StatsCounter value={24} label="Always-On Coaching" suffix="/7" />
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">Success Stories</h2>
        <p className="section-caption">Your next opportunity is one interview away.</p>
        <TestimonialCarousel />
      </section>
    </div>
  );
};

export default Landing;
