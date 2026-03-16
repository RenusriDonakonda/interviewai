const PDFDocument = require("pdfkit");

const scoreLabel = (score = 0) => {
  if (score >= 90) return "Outstanding";
  if (score >= 75) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Developing";
  return "Practice More";
};

const generateReport = ({ candidate, sessionDate, sessionType, score, strengths, improvements, questions }) => {
  const doc = new PDFDocument({ margin: 36 });
  doc.font("Courier");

  const header = [
    "+----------------------------------+",
    "¦         INTERVIEWAI REPORT        ¦",
    "¦     Where Intelligence Meets      ¦",
    "¦           Opportunity              ¦",
    "+----------------------------------+"
  ];

  header.forEach((line) => doc.text(line, { align: "center" }));
  doc.moveDown();

  doc.text(`Interview Date: ${sessionDate}`);
  doc.text(`Candidate: ${candidate}`);
  doc.text(`Session Type: ${sessionType}`);
  doc.moveDown();

  const label = scoreLabel(score);
  doc.text(`OVERALL SCORE: ${score}% (${label})`);
  doc.moveDown();

  doc.text("STRENGTHS:");
  (strengths || ["Strong technical vocabulary", "Clear communication style", "Good use of examples"]).forEach((item) => {
    doc.text(`? ${item}`);
  });
  doc.moveDown();

  doc.text("AREAS FOR IMPROVEMENT:");
  (improvements || ["Provide more code examples", "Structure answers using STAR method", "Practice system design questions"]).forEach((item) => {
    doc.text(`? ${item}`);
  });
  doc.moveDown();

  doc.text("QUESTION BREAKDOWN:");
  doc.text("-----------------------------");
  (questions || []).forEach((item, index) => {
    doc.text(`${index + 1}. ${item.questionText}`);
    doc.text(`   Score: ${item.similarityScore || 0}%`);
    doc.text(`   Feedback: ${item.feedback || ""}`);
    doc.text("-----------------------------");
  });

  doc.moveDown();
  doc.text("NEXT STEPS:");
  doc.text("? Practice 3 more technical interviews");
  doc.text("? Focus on system design");
  doc.text("? Review algorithm complexity");
  doc.moveDown();
  doc.text("[Download as PDF]");

  doc.end();
  return doc;
};

module.exports = {
  generateReport
};
