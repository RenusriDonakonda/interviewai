import React from "react";

const ScoreMeter = ({ label, value, tone = "primary" }) => {
  const colors = {
    primary: "var(--gradient)",
    success: "var(--aurora-green)",
    warning: "var(--nebula-orange)",
    error: "var(--mars-red)"
  };

  return (
    <div>
      <div className="section-caption">{label}</div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${value}%`, background: colors[tone] }} />
      </div>
    </div>
  );
};

export default ScoreMeter;
