import React, { useEffect, useState } from "react";
import GlassCard from "./GlassCard";

const testimonials = [
  {
    quote: "InterviewAI helped me land my first role. The feedback felt like a mentor guiding me.",
    name: "Alicia R.",
    title: "Frontend Engineer"
  },
  {
    quote: "The analytics dashboard showed exactly where to improve. I felt ready in days.",
    name: "Marcus T.",
    title: "Data Analyst"
  },
  {
    quote: "The AI evaluation was spot on. I used the STAR tips to nail my behavioral rounds.",
    name: "Priya S.",
    title: "Product Manager"
  }
];

const TestimonialCarousel = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="carousel">
      {testimonials.map((item, index) => (
        <div
          key={item.name}
          className={`carousel-item ${index === activeIndex ? "active" : ""}`}
        >
          <GlassCard>
            <div className="badge">Success Story</div>
            <p>{item.quote}</p>
            <div>
              <strong>{item.name}</strong>
              <div className="section-caption">{item.title}</div>
            </div>
          </GlassCard>
        </div>
      ))}
    </div>
  );
};

export default TestimonialCarousel;
