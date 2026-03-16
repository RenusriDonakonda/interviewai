import React from "react";

const ProgressRing = ({ value = 75 }) => {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  const showConfetti = value >= 90;

  return (
    <div style={{ position: "relative", width: "120px", height: "120px" }}>
      <svg className="score-ring" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={radius} stroke="rgba(255,255,255,0.1)" strokeWidth="10" fill="none" />
        <circle
          cx="60"
          cy="60"
          r={radius}
          stroke="url(#grad)"
          strokeWidth="10"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1.4s ease" }}
        />
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#A855F7" />
          </linearGradient>
        </defs>
        <text x="50%" y="54%" textAnchor="middle" fill="#FFFFFF" fontSize="20" fontWeight="600">
          {value}%
        </text>
      </svg>
      {showConfetti && (
        <div className="confetti">
          {Array.from({ length: 12 }).map((_, index) => (
            <span key={index} className="confetti-piece" />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProgressRing;
