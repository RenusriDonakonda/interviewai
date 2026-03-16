import React from "react";
import GlassCard from "./GlassCard";

const DemoPreview = () => {
  return (
    <GlassCard className="demo-preview">
      <div className="badge">Live Evaluation</div>
      <h3>AI Answer Evaluation</h3>
      <p>Excellent use of technical terms and structured responses. Confidence rising.</p>
      <div>
        <div className="section-caption">Similarity Score</div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: "85%" }} />
        </div>
      </div>
      <div>
        <div className="section-caption">Confidence Level</div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: "78%" }} />
        </div>
      </div>
      <div className="badge">Keywords: React, State, Props</div>
    </GlassCard>
  );
};

export default DemoPreview;
