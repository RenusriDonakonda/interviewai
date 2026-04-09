import React, { useState } from "react";

const Logo = ({ withMark = false, size = "md" }) => {
  const [imgFailed, setImgFailed] = useState(false);
  const showImage = withMark && !imgFailed;
  const sizeClass = size === "lg" ? "logo-lg" : "";

  return (
    <div className={`logo ${sizeClass}`.trim()} aria-label="InterviewAI">
      {showImage && (
        <img
          src="/interviewai-logo.png"
          alt="InterviewAI"
          className="logo-img"
          onError={() => setImgFailed(true)}
        />
      )}
      {withMark && !showImage && <span className="logo-mark" aria-hidden="true" />}
      <span>INTERVIEW</span>
      <span className="ai-glow">AI</span>
    </div>
  );
};

export default Logo;
