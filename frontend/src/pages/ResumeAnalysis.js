import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import GlassCard from "../components/GlassCard";
import { api } from "../api";

const ResumeAnalysis = () => {
  const [skills, setSkills] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [experience, setExperience] = useState("mid");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.resumeSkills()
      .then((data) => setSkills(data.skills || []))
      .catch(() => undefined);
  }, []);

  const handleUpload = async (file) => {
    if (!file) return;
    setLoading(true);
    setError("");
    try {
      const data = await api.resumeUpload(file);
      setSkills(data.skills || []);
      setExperience(data.experience || "mid");
      const questionData = await api.startInterview({ skills: data.skills || [], sessionType: "technical" });
      setQuestions(questionData.questions || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const onDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    handleUpload(file);
  };

  return (
    <div>
      <section className="section">
        <GlassCard>
          <h2>Upload Your Resume</h2>
          <div
            className="glass-card"
            style={{ marginTop: "16px", textAlign: "center" }}
            onDragOver={(event) => event.preventDefault()}
            onDrop={onDrop}
          >
            <p>Drag & drop your resume or browse</p>
            <p className="section-caption">Accepted: PDF or TXT (max 2MB)</p>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.txt"
              style={{ display: "none" }}
              onChange={(event) => handleUpload(event.target.files?.[0])}
            />
            <button className="secondary-button" onClick={() => fileRef.current?.click()}>
              Browse Files
            </button>
            {loading && <div className="section-caption">Uploading...</div>}
            {error && <div className="badge" style={{ background: "rgba(239, 68, 68, 0.2)" }}>{error}</div>}
          </div>
        </GlassCard>
      </section>

      <section className="section">
        <GlassCard>
          <h3>Extracted Skills</h3>
          <div className="section-caption">Experience Level: {experience}</div>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {skills.map((skill) => (
              <span className="badge" key={skill.skill || skill}>#{skill.skill || skill}</span>
            ))}
          </div>
        </GlassCard>
      </section>

      <section className="section">
        <GlassCard>
          <h3>InterviewAI Generated Questions</h3>
          <ol>
            {questions.map((item) => (
              <li key={item.questionId || item._id}>{item.questionText || item.question}</li>
            ))}
          </ol>
          <button className="primary-button" onClick={() => navigate("/interview")}>
            Start AI Interview with These Questions
          </button>
        </GlassCard>
      </section>
    </div>
  );
};

export default ResumeAnalysis;
