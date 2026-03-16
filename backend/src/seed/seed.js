require("dotenv").config();
const connectDb = require("../config/db");
const Question = require("../models/Question");

const seedQuestions = async () => {
  await Question.deleteMany({});
  await Question.insertMany([
    {
      category: "technical",
      skill: "React",
      difficulty: "medium",
      question: "Explain React lifecycle methods and when to use them.",
      idealAnswer: "React lifecycle methods let you run code at specific points in a component's life, such as mounting, updating, and unmounting.",
      keywords: ["mount", "update", "unmount", "useEffect"],
      company: "Google"
    },
    {
      category: "technical",
      skill: "Node.js",
      difficulty: "medium",
      question: "Describe your experience with Node.js and building APIs.",
      idealAnswer: "Node.js enables event-driven, non-blocking I/O for scalable APIs, often built with Express and connected to databases.",
      keywords: ["event", "non-blocking", "express", "api"],
      company: "Amazon"
    },
    {
      category: "behavioral",
      skill: "Leadership",
      difficulty: "easy",
      question: "Tell me about a time you led a project under a tight deadline.",
      idealAnswer: "Use the STAR method to describe the situation, task, action, and results, highlighting leadership and impact.",
      keywords: ["star", "leadership", "impact"],
      company: "Microsoft"
    }
  ]);
};

connectDb()
  .then(async () => {
    await seedQuestions();
    console.log("Seed complete");
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
