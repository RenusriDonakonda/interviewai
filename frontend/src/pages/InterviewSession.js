import React, { useEffect, useState } from "react";
import GlassCard from "../components/GlassCard";
import ScoreMeter from "../components/ScoreMeter";
import LoadingSpinner from "../components/LoadingSpinner";
import { api } from "../api";

const InterviewSession = () => {
  const [answer, setAnswer] = useState("");
  const [timeLeft, setTimeLeft] = useState(150);
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState({ sessionId: null, questions: [] });
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    api.startInterview({ sessionType: "technical", skills: [] })
      .then((data) => {
        setSession(data);
        setActiveQuestion(data.questions?.[0] || null);
      })
      .catch((err) => setError(err.message));
  }, []);

  const handleSubmit = async () => {
    if (!activeQuestion) return;
    setLoading(true);
    setError("");
    try {
      const result = await api.submitAnswer({
        sessionId: session.sessionId,
        questionId: activeQuestion.questionId,
        userAnswer: answer,
        timeSpent: 150 - timeLeft
      });
      setAnalysis(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const minutes = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const seconds = String(timeLeft % 60).padStart(2, "0");

  return (
    <div>
      <section className="section">
        <GlassCard>
          <h2>Interview Session #{session.sessionId?.slice(-4) || "123"}</h2>
          <div className="section-caption">Question 1 of {session.questions.length || 5}</div>
          <h3>{activeQuestion?.questionText || "Explain how React manages component state and props."}</h3>
          <div className="input-group">
            <label>Your Answer</label>
            <textarea
              className="textarea-field"
              rows="5"
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
              placeholder="Type your answer here..."
            />
            <div className="section-caption">{answer.length} characters</div>
          </div>
          <div className="badge">Time Remaining: {minutes}:{seconds}</div>
          {error && <div className="badge" style={{ background: "rgba(239, 68, 68, 0.2)" }}>{error}</div>}
          <div style={{ marginTop: "16px" }}>
            <button className="primary-button" onClick={handleSubmit} disabled={loading}>
              Submit Answer
            </button>
          </div>
          {loading && (
            <div style={{ marginTop: "16px" }}>
              <LoadingSpinner />
            </div>
          )}
        </GlassCard>
      </section>

      <section className="section">
        <GlassCard>
          <h3>AI Analysis</h3>
          <ScoreMeter label="Similarity Score" value={analysis?.similarityScore || 85} />
          <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", marginTop: "20px" }}>
            <div className="confidence-orb">
              <div className="confidence-level">{analysis?.confidenceScore ? `${analysis.confidenceScore}%` : "High"}</div>
            </div>
            <div>
              <div className="section-caption">Feedback</div>
              <p>{analysis?.feedback || "Excellent use of technical terms with clear flow. Add a brief example to strengthen clarity."}</p>
              <div className="section-caption">Keywords Detected</div>
              {(analysis?.keywordsFound || ["React", "State", "Props"]).map((keyword) => (
                <span className="badge" key={keyword}>{keyword}</span>
              ))}
            </div>
          </div>
        </GlassCard>
      </section>
    </div>
  );
};

export default InterviewSession;
