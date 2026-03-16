import React, { useState } from "react";

const Logo = ({ withMark = false }) => {
  const [imgFailed, setImgFailed] = useState(false);
  const showImage = withMark && !imgFailed;

  return (
    <div className="logo" aria-label="InterviewAI">
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
