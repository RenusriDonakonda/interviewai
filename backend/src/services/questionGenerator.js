const mongoose = require("mongoose");
const Question = require("../models/Question");
const { generateQuestionsFromSkills } = require("./openaiClient");
const { makeKey, getCache, setCache } = require("./aiCache");

const buildSkillQuestions = (skills, difficulty) => {
  const names = skills.map((skill) => skill.skill || skill).filter(Boolean);
  if (!names.length) return [];
  return names.slice(0, 5).map((name) => ({
    _id: new mongoose.Types.ObjectId(),
    category: "technical",
    skill: name,
    difficulty,
    question: `Explain your experience with ${name} and a project where you applied it.`,
    idealAnswer: `Provide a concise overview of how you have used ${name}, the context of the project, key decisions, and measurable outcomes.`,
    keywords: [name]
  }));
};

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
    const skillQuestions = buildSkillQuestions(skills, difficulty);
    return (skillQuestions.length ? skillQuestions : fallbackQuestionBank(difficulty)).slice(0, limit);
  }

  return questions.map((question) => ({
    ...question,
    difficulty
  }));
};

const generateQuestions = async ({ skills, performanceScore, aiMode = "classic" }) => {
  let difficulty = "medium";
  if (performanceScore >= 85) difficulty = "hard";
  if (performanceScore <= 60) difficulty = "easy";

  const skillQuestions = buildSkillQuestions(skills, difficulty);

  if (aiMode === "llm") {
    const cacheKey = makeKey(["questions", JSON.stringify(skills), difficulty]);
    const cached = getCache(cacheKey);
    if (cached) return cached;

    try {
      const aiResult = await generateQuestionsFromSkills({ skills });
      if (aiResult?.questions?.length) {
        const mapped = aiResult.questions.slice(0, 5).map((item) => ({
          _id: new mongoose.Types.ObjectId(),
          category: "technical",
          skill: item.keywords?.[0] || "General",
          difficulty,
          question: item.question,
          idealAnswer: item.idealAnswer,
          keywords: item.keywords || []
        }));
        setCache(cacheKey, mapped);
        return mapped;
      }
    } catch {
      // fall back silently
    }
  }

  try {
    const picked = await pickQuestions({ skills, difficulty, limit: 5 });
    return picked;
  } catch (error) {
    return skillQuestions.length ? skillQuestions : fallbackQuestionBank(difficulty);
  }
};

module.exports = {
  generateQuestions
};
