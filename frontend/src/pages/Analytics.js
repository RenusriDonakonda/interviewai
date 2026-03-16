import React, { useEffect, useState } from "react";
import GlassCard from "../components/GlassCard";
import LineChart from "../components/charts/LineChart";
import RadarChart from "../components/charts/RadarChart";
import { api } from "../api";

const Analytics = () => {
  const [history, setHistory] = useState([]);
  const [downloading, setDownloading] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    api.history().then((data) => setHistory(data.sessions || [])).catch(() => undefined);
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

  const lineData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    values: [70, 72, 78, 80, 84, 88]
  };

  const radarData = {
    labels: ["React", "Node", "Behavioral", "System Design", "SQL"],
    values: [82, 74, 80, 65, 70]
  };

  const latestSessionId = history[0]?._id || null;

  return (
    <div>
      <section className="section">
        <h2>Your InterviewAI Progress</h2>
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
              {history.map((row) => (
                <tr key={row._id}>
                  <td>{new Date(row.sessionDate).toLocaleDateString()}</td>
                  <td>{row.sessionType}</td>
                  <td>{row.overallScore || 0}%</td>
                  <td>
                    <div className="report-actions">
                      <button
                        className="secondary-button"
                        onClick={() => getReport(row._id, true)}
                        disabled={downloading === row._id}
                      >
                        {downloading === row._id ? "Preparing..." : "Preview"}
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
              ))}
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
