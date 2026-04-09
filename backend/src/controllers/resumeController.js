const { parseResumeBuffer, extractSkills, detectExperienceLevel } = require("../services/resumeParser");
const User = require("../models/User");

const uploadResume = async (req, res, next) => {
  try {
    const buffer = req.file?.buffer;
    if (!buffer) return res.status(400).json({ message: "No file uploaded" });

    const filename = req.file?.originalname || "";
    const text = await parseResumeBuffer(buffer, filename);
    const skills = extractSkills(text);
    const experience = detectExperienceLevel(text);

    await User.findByIdAndUpdate(req.user.id, {
      extractedSkills: skills,
      resumeFilename: filename
    });

    return res.status(200).json({ skills, experience, filename });
  } catch (error) {
    return next(error);
  }
};

const getSkills = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("extractedSkills resumeFilename");
    return res.status(200).json({ skills: user?.extractedSkills || [], filename: user?.resumeFilename || "" });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  uploadResume,
  getSkills
};
