const Session = require("../models/Session");
const Question = require("../models/Question");
const { scoreAnswer, scoreLabel } = require("../services/scoring");
const { generateQuestions } = require("../services/questionGenerator");

const startInterview = async (req, res, next) => {
  try {
    const { skills = [], sessionType = "mixed", companyFocus } = req.body;
    const questions = await generateQuestions({ skills, performanceScore: req.body.performanceScore || 70 });

    const session = await Session.create({
      userId: req.user.id,
      sessionType,
      companyFocus,
      questions: questions.map((q) => ({
        questionId: q._id,
        questionText: q.question,
        idealAnswer: q.idealAnswer,
        keywordsFound: [],
        timeSpent: 0
      }))
    });

    return res.status(201).json({ sessionId: session._id, questions: session.questions });
  } catch (error) {
    return next(error);
  }
};

const submitAnswer = async (req, res, next) => {
  try {
    const { sessionId, questionId, userAnswer, timeSpent } = req.body;
    const session = await Session.findById(sessionId);
    if (!session) return res.status(404).json({ message: "Session not found" });

    const questionEntry = session.questions.find((q) => String(q.questionId) === String(questionId));
    if (!questionEntry) return res.status(404).json({ message: "Question not found" });

    const questionDoc = await Question.findById(questionId);
    const keywords = questionDoc?.keywords || [];

    const { similarityScore, confidenceScore, keywordsFound } = scoreAnswer(userAnswer, questionEntry.idealAnswer, keywords);
    const { label } = scoreLabel(similarityScore);

    questionEntry.userAnswer = userAnswer;
    questionEntry.similarityScore = similarityScore;
    questionEntry.confidenceScore = confidenceScore;
    questionEntry.feedback = `${label}: Strong structure with room for richer examples.`;
    questionEntry.keywordsFound = keywordsFound;
    questionEntry.timeSpent = timeSpent || 0;

    session.overallScore = Math.round(
      session.questions.reduce((acc, q) => acc + (q.similarityScore || 0), 0) / session.questions.length
    );

    await session.save();

    return res.status(200).json({
      similarityScore,
      confidenceScore,
      feedback: questionEntry.feedback,
      keywordsFound
    });
  } catch (error) {
    return next(error);
  }
};

const getHistory = async (req, res, next) => {
  try {
    const sessions = await Session.find({ userId: req.user.id }).sort({ sessionDate: -1 }).lean();
    return res.status(200).json({ sessions });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  startInterview,
  submitAnswer,
  getHistory
};
