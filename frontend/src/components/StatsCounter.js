import React, { useEffect, useState } from "react";

const StatsCounter = ({ value, label, suffix = "" }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1200;
    const step = Math.ceil(value / (duration / 24));
    const timer = setInterval(() => {
      start += step;
      if (start >= value) {
        start = value;
        clearInterval(timer);
      }
      setCount(start);
    }, 24);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <div className="glass-card">
      <div className="stat-number">{count.toLocaleString()}{suffix}</div>
      <div className="section-caption">{label}</div>
    </div>
  );
};

export default StatsCounter;
