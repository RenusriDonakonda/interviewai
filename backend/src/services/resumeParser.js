const pdfParse = require("pdf-parse");
const path = require("path");

const skillDatabase = {
  Frontend: ["react", "javascript", "typescript", "css", "html", "redux"],
  Backend: ["node", "express", "python", "flask", "django", "java"],
  Database: ["mongo", "mongodb", "postgres", "mysql", "redis"],
  "Soft Skills": ["leadership", "communication", "collaboration", "problem solving"]
};

const parseResumeBuffer = async (buffer, filename = "") => {
  const lowerName = filename.toLowerCase();
  if (lowerName.endsWith(".txt")) {
    return buffer.toString("utf8");
  }

  try {
    const data = await pdfParse(buffer);
    return data.text || "";
  } catch (error) {
    return buffer.toString("utf8");
  }
};

const normalizeSkill = (skill) => skill.replace(/\b\w/g, (char) => char.toUpperCase());

const extractSkills = (text = "") => {
  const lower = text.toLowerCase();
  const extracted = [];

  Object.entries(skillDatabase).forEach(([category, skills]) => {
    skills.forEach((skill) => {
      if (lower.includes(skill)) {
        const normalized = normalizeSkill(skill);
        if (!extracted.find((item) => item.skill === normalized)) {
          extracted.push({
            skill: normalized,
            category,
            confidence: 0.8
          });
        }
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
