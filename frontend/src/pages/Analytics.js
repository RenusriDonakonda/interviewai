import React, { useEffect, useState } from "react";
import GlassCard from "../components/GlassCard";
import LineChart from "../components/charts/LineChart";
import RadarChart from "../components/charts/RadarChart";
import { api } from "../api";

const Analytics = () => {
  const [history, setHistory] = useState([]);
  const [downloading, setDownloading] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [skills, setSkills] = useState([]);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    api.history().then((data) => setHistory(data.sessions || [])).catch(() => undefined);
    api.resumeSkills().then((data) => setSkills(data.skills || [])).catch(() => undefined);
  }, []);

  const getReport = async (sessionId, openPreview) => {
    if (!sessionId) return;
    setDownloading(sessionId);
    try {
      const blob = await api.report({ sessionId });
      const url = window.URL.createObjectURL(blob);
      if (openPreview) {
        setPreviewUrl(url);
      } else {
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = `interviewai-report-${sessionId.slice(-4)}.pdf`;
        anchor.click();
        window.URL.revokeObjectURL(url);
      }
    } finally {
      setDownloading(null);
    }
  };

  const closePreview = () => {
    if (previewUrl) {
      window.URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl("");
  };

  const buildPreview = (session) => {
    const questions = session.questions || [];
    const answered = questions.filter((q) => q.userAnswer).length;
    const scored = questions.filter((q) => typeof q.similarityScore === "number");
    const strengths = session.strengths?.length
      ? session.strengths
      : [...scored]
        .sort((a, b) => b.similarityScore - a.similarityScore)
        .slice(0, 3)
        .map((q) => q.questionText);

    const improvements = session.improvements?.length
      ? session.improvements
      : [...scored]
        .sort((a, b) => a.similarityScore - b.similarityScore)
        .slice(0, 3)
        .map((q) => q.questionText);

    const best = scored.length ? [...scored].sort((a, b) => b.similarityScore - a.similarityScore)[0] : null;
    const lowest = scored.length ? [...scored].sort((a, b) => a.similarityScore - b.similarityScore)[0] : null;

    const keywords = [...new Set(scored.flatMap((q) => q.keywordsFound || []))].slice(0, 8);
    const feedbackHighlights = scored
      .filter((q) => q.feedback)
      .slice(0, 3)
      .map((q) => ({ text: q.feedback, score: q.similarityScore }));

    const totalTime = questions.reduce((acc, q) => acc + (q.timeSpent || 0), 0);
    const avgConfidence = scored.length
      ? Math.round(scored.reduce((acc, q) => acc + (q.confidenceScore || 0), 0) / scored.length)
      : 0;

    return {
      questions,
      answered,
      strengths: strengths.length ? strengths : ["Keep practicing to unlock detailed insights."],
      improvements: improvements.length ? improvements : ["Complete more answers to see tailored improvements."],
      best,
      lowest,
      keywords,
      feedbackHighlights: feedbackHighlights.length ? feedbackHighlights : [{ text: "Answer more questions to see feedback highlights.", score: null }],
      totalTime,
      avgConfidence
    };
  };

  const lineData = {
    labels: history.length ? history.map((item) => new Date(item.sessionDate).toLocaleDateString()) : ["Week 1", "Week 2", "Week 3"],
    values: history.length ? history.map((item) => item.overallScore || 0) : [60, 70, 80]
  };

  const radarData = {
    labels: skills.length ? skills.map((skill) => skill.skill || skill) : ["React", "Node", "Behavioral"],
    values: skills.length ? skills.map(() => 70) : [80, 74, 68]
  };

  const latestSessionId = history[0]?._id || null;
  const avgScore = history.length
    ? Math.round(history.reduce((acc, item) => acc + (item.overallScore || 0), 0) / history.length)
    : 0;
  const bestScore = history.length
    ? Math.max(...history.map((item) => item.overallScore || 0))
    : 0;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div>
      <section className="section">
        <h2>Your InterviewAI Progress</h2>
        <div className="stats-grid" style={{ marginTop: "24px" }}>
          <GlassCard>
            <div className="section-caption">Average Score</div>
            <div className="stat-number">{avgScore}%</div>
          </GlassCard>
          <GlassCard>
            <div className="section-caption">Best Session</div>
            <div className="stat-number">{bestScore}%</div>
          </GlassCard>
          <GlassCard>
            <div className="section-caption">Total Sessions</div>
            <div className="stat-number">{history.length}</div>
          </GlassCard>
        </div>
      </section>
      <section className="section chart-grid">
        <GlassCard>
          <h3>Performance Over Time</h3>
          <LineChart data={lineData} />
        </GlassCard>
        <GlassCard>
          <h3>Skill Breakdown</h3>
          <RadarChart data={radarData} />
        </GlassCard>
      </section>
      <section className="section">
        <GlassCard>
          <h3>Interview History</h3>
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Score</th>
                <th>Report</th>
              </tr>
            </thead>
            <tbody>
              {history.map((row) => {
                const preview = buildPreview(row);
                const isExpanded = expandedId === row._id;
                return (
                  <React.Fragment key={row._id}>
                    <tr>
                      <td>{new Date(row.sessionDate).toLocaleDateString()}</td>
                      <td>{row.sessionType}</td>
                      <td>{row.overallScore || 0}%</td>
                      <td>
                        <div className="report-actions">
                          <button
                            className="secondary-button"
                            onClick={() => setExpandedId(isExpanded ? null : row._id)}
                          >
                            {isExpanded ? "Hide Preview" : "Preview"}
                          </button>
                          <button
                            className="secondary-button"
                            onClick={() => getReport(row._id, true)}
                            disabled={downloading === row._id}
                          >
                            {downloading === row._id ? "Preparing..." : "PDF Preview"}
                          </button>
                          <button
                            className="secondary-button"
                            onClick={() => getReport(row._id, false)}
                            disabled={downloading === row._id}
                          >
                            Download PDF
                          </button>
                        </div>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="table-preview-row">
                        <td colSpan="4">
                          <div className="report-preview-card">
                            <div className="report-preview-grid">
                              <div>
                                <div className="section-caption">Overall Score</div>
                                <div className="report-score">{row.overallScore || 0}%</div>
                                <div className="section-caption">Answered {preview.answered}/{preview.questions.length}</div>
                              </div>
                              <div className="report-kpi">
                                <div className="section-caption">Avg Confidence</div>
                                <div className="report-score-mini">{preview.avgConfidence}%</div>
                                <div className="section-caption">Total Time</div>
                                <div>{formatTime(preview.totalTime)}</div>
                              </div>
                              <div className="report-kpi">
                                <div className="section-caption">Best Answer</div>
                                <div>{preview.best?.questionText || "Complete a session to see."}</div>
                                {preview.best && <div className="report-score-mini">{preview.best.similarityScore}%</div>}
                              </div>
                              <div className="report-kpi">
                                <div className="section-caption">Needs Focus</div>
                                <div>{preview.lowest?.questionText || "Complete a session to see."}</div>
                                {preview.lowest && <div className="report-score-mini">{preview.lowest.similarityScore}%</div>}
                              </div>
                            </div>
                            <div className="report-preview-grid" style={{ marginTop: "16px" }}>
                              <div>
                                <div className="section-caption">Strengths</div>
                                <ul className="report-list">
                                  {preview.strengths.map((item, idx) => (
                                    <li key={`${row._id}-strength-${idx}`}>{item}</li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <div className="section-caption">Areas for Improvement</div>
                                <ul className="report-list">
                                  {preview.improvements.map((item, idx) => (
                                    <li key={`${row._id}-improve-${idx}`}>{item}</li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <div className="section-caption">Keywords Used</div>
                                <div className="report-tags">
                                  {preview.keywords.length ? preview.keywords.map((keyword) => (
                                    <span className="report-chip" key={`${row._id}-${keyword}`}>{keyword}</span>
                                  )) : <span className="section-caption">No keywords captured yet.</span>}
                                </div>
                              </div>
                            </div>
                            <div className="report-preview-grid" style={{ marginTop: "16px" }}>
                              <div>
                                <div className="section-caption">Feedback Highlights</div>
                                <ul className="report-list">
                                  {preview.feedbackHighlights.map((item, idx) => (
                                    <li key={`${row._id}-feedback-${idx}`}>
                                      {item.text}
                                      {item.score !== null && <span className="report-score-mini"> {item.score}%</span>}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                            <div className="report-breakdown">
                              <div className="section-caption">Question Breakdown</div>
                              {preview.questions.slice(0, 6).map((q, idx) => (
                                <div key={`${row._id}-q-${idx}`} className="report-breakdown-row">
                                  <div>
                                    <div>{q.questionText || "Question"}</div>
                                    <div className="section-caption">Time: {formatTime(q.timeSpent || 0)} • Confidence: {q.confidenceScore ?? 0}%</div>
                                  </div>
                                  <div className="report-score-mini">{q.similarityScore ?? 0}%</div>
                                </div>
                              ))}
                              {!preview.questions.length && (
                                <div className="section-caption">No questions answered yet.</div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
              {!history.length && (
                <tr>
                  <td colSpan="4">No interviews yet. Start your first session.</td>
                </tr>
              )}
            </tbody>
          </table>
          <button
            className="primary-button"
            style={{ marginTop: "16px" }}
            onClick={() => getReport(latestSessionId, false)}
            disabled={!latestSessionId || downloading === latestSessionId}
          >
            {downloading === latestSessionId ? "Generating..." : "Generate Comprehensive Report"}
          </button>
        </GlassCard>
      </section>

      {previewUrl && (
        <div className="modal" role="dialog" aria-modal="true">
          <div className="modal-content">
            <div className="modal-header">
              <h3>InterviewAI Report Preview</h3>
              <button className="secondary-button" onClick={closePreview}>Close</button>
            </div>
            <object data={previewUrl} type="application/pdf" width="100%" height="600px">
              <p>Preview unavailable. Please download the PDF.</p>
            </object>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
