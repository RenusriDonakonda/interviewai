import React, { useEffect, useRef } from "react";

const StarfieldCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationFrame;
    let stars = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      stars = Array.from({ length: Math.min(200, Math.floor(canvas.width / 6)) }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1.6 + 0.4,
        alpha: Math.random() * 0.8 + 0.2,
        speed: Math.random() * 0.2 + 0.05
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#0B0E1F";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      stars.forEach((star) => {
        star.y += star.speed;
        if (star.y > canvas.height) {
          star.y = 0;
          star.x = Math.random() * canvas.width;
        }
        ctx.beginPath();
        ctx.fillStyle = `rgba(255,255,255,${star.alpha})`;
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrame = requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  return (
    <div className="starfield">
      <canvas ref={canvasRef} />
      <div className="comet" style={{ top: "10%", left: "-30%", animationDelay: "2s" }} />
      <div className="comet" style={{ top: "40%", left: "-50%", animationDelay: "6s" }} />
      <div className="comet" style={{ top: "70%", left: "-40%", animationDelay: "10s" }} />
    </div>
  );
};

export default StarfieldCanvas;
