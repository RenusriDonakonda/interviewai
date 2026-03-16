const Question = require("../models/Question");

const pickQuestions = async ({ skills = [], difficulty = "medium", limit = 5 }) => {
  const skillNames = skills.map((skill) => skill.skill || skill);
  const query = skillNames.length ? { skill: { $in: skillNames } } : {};
  const questions = await Question.find(query)
    .sort({ timesUsed: 1 })
    .limit(limit)
    .lean();

  return questions.map((question) => ({
    ...question,
    difficulty
  }));
};

const generateQuestions = async ({ skills, performanceScore }) => {
  let difficulty = "medium";
  if (performanceScore >= 85) difficulty = "hard";
  if (performanceScore <= 60) difficulty = "easy";

  return pickQuestions({ skills, difficulty, limit: 5 });
};

module.exports = {
  generateQuestions
};
