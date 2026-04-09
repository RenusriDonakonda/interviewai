const errorMessages = {
  400: "Hmm, something's not right. Let's try that again.",
  401: "Your session has expired. Please log in to continue your InterviewAI journey.",
  403: "This area requires InterviewAI Pro access.",
  404: "The interview universe is vast, but we couldn't find that page.",
  429: "You've practiced a lot! Take a quick break, then come back.",
  500: "Our AI is taking a cosmic pause. Please try again in a moment.",
  503: "InterviewAI is experiencing high traffic. Your opportunity awaits shortly."
};

const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  console.error("API error:", err);
  let message = errorMessages[status] || err.message || errorMessages[500];
  if (status === 400 && err.message) {
    message = err.message;
  }
  res.status(status).json({ message });
};

module.exports = errorHandler;
