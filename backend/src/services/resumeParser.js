const pdfParse = require("pdf-parse");

const skillDatabase = {
  Frontend: ["react", "javascript", "typescript", "css", "html", "redux"],
  Backend: ["node", "express", "python", "flask", "django", "java"],
  Database: ["mongo", "mongodb", "postgres", "mysql", "redis"],
  "Soft Skills": ["leadership", "communication", "collaboration", "problem solving"]
};

const parseResumeBuffer = async (buffer) => {
  try {
    const data = await pdfParse(buffer);
    return data.text || "";
  } catch (error) {
    return buffer.toString("utf8");
  }
};

const extractSkills = (text = "") => {
  const lower = text.toLowerCase();
  const extracted = [];

  Object.entries(skillDatabase).forEach(([category, skills]) => {
    skills.forEach((skill) => {
      if (lower.includes(skill)) {
        extracted.push({
          skill: skill.replace(/\b\w/g, (char) => char.toUpperCase()),
          category,
          confidence: 0.8
        });
      }
    });
  });

  return extracted;
};

const detectExperienceLevel = (text = "") => {
  const lower = text.toLowerCase();
  if (lower.includes("senior") || lower.includes("lead")) return "senior";
  if (lower.includes("intern") || lower.includes("junior")) return "junior";
  return "mid";
};

module.exports = {
  parseResumeBuffer,
  extractSkills,
  detectExperienceLevel,
  skillDatabase
};
