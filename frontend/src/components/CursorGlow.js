import React, { useEffect, useRef, useState } from "react";

const CursorGlow = () => {
  const glowRef = useRef(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const canHover = window.matchMedia("(pointer: fine)").matches;
    setEnabled(canHover);
    if (!canHover) return;

    const handleMove = (event) => {
      if (!glowRef.current) return;
      const interactive = event.target.closest("button, a, input, textarea, select");
      glowRef.current.style.transform = `translate(${event.clientX}px, ${event.clientY}px) scale(${interactive ? 1.2 : 1})`;
      glowRef.current.style.opacity = "1";
    };

    const handleLeave = () => {
      if (glowRef.current) {
        glowRef.current.style.opacity = "0";
      }
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseleave", handleLeave);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseleave", handleLeave);
    };
  }, []);

  if (!enabled) return null;

  return <div className="cursor-glow" ref={glowRef} />;
};

export default CursorGlow;
