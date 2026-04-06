const mongoose = require("mongoose");
const Question = require("../models/Question");

const fallbackQuestionBank = (difficulty) => [
  {
    _id: new mongoose.Types.ObjectId(),
    category: "technical",
    skill: "React",
    difficulty,
    question: "Explain how React manages state and props.",
    idealAnswer: "React uses props to pass data down and state to manage internal component data. Hooks like useState and useEffect help manage state and side effects.",
    keywords: ["props", "state", "useState", "useEffect"]
  },
  {
    _id: new mongoose.Types.ObjectId(),
    category: "technical",
    skill: "Node.js",
    difficulty,
    question: "How does Node.js handle asynchronous operations?",
    idealAnswer: "Node.js uses an event loop and non-blocking I/O. Async tasks are handled via callbacks, promises, or async/await.",
    keywords: ["event loop", "non-blocking", "promises"]
  },
  {
    _id: new mongoose.Types.ObjectId(),
    category: "behavioral",
    skill: "Communication",
    difficulty,
    question: "Describe a time you handled a difficult stakeholder conversation.",
    idealAnswer: "Use the STAR method to explain the situation, your actions to clarify expectations, and the positive outcome.",
    keywords: ["STAR", "communication", "stakeholder"]
  }
];

const pickQuestions = async ({ skills = [], difficulty = "medium", limit = 5 }) => {
  const skillNames = skills.map((skill) => skill.skill || skill);
  const query = skillNames.length ? { skill: { $in: skillNames } } : {};
  const questions = await Question.find(query)
    .sort({ timesUsed: 1 })
    .limit(limit)
    .lean();

  if (!questions.length) {
    return fallbackQuestionBank(difficulty).slice(0, limit);
  }

  return questions.map((question) => ({
    ...question,
    difficulty
  }));
};

const generateQuestions = async ({ skills, performanceScore }) => {
  let difficulty = "medium";
  if (performanceScore >= 85) difficulty = "hard";
  if (performanceScore <= 60) difficulty = "easy";

  try {
    return await pickQuestions({ skills, difficulty, limit: 5 });
  } catch (error) {
    return fallbackQuestionBank(difficulty);
  }
};

module.exports = {
  generateQuestions
};
