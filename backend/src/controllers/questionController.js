const Question = require("../models/Question");

const createQuestion = async (req, res, next) => {
  try {
    const question = await Question.create(req.body);
    return res.status(201).json(question);
  } catch (error) {
    return next(error);
  }
};

const updateQuestion = async (req, res, next) => {
  try {
    const question = await Question.findByIdAndUpdate(req.params.id, req.body, { new: true });
    return res.status(200).json(question);
  } catch (error) {
    return next(error);
  }
};

const deleteQuestion = async (req, res, next) => {
  try {
    await Question.findByIdAndDelete(req.params.id);
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createQuestion,
  updateQuestion,
  deleteQuestion
};
