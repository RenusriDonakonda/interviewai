const User = require("../models/User");
const Question = require("../models/Question");

const listUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password").limit(50).lean();
    return res.status(200).json({ users });
  } catch (error) {
    return next(error);
  }
};

const listQuestions = async (req, res, next) => {
  try {
    const questions = await Question.find().limit(50).lean();
    return res.status(200).json({ questions });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  listUsers,
  listQuestions
};
