const Session = require("../models/Session");
const Question = require("../models/Question");
const { scoreAnswer, scoreLabel } = require("../services/scoring");
const { generateQuestions } = require("../services/questionGenerator");
const { generateFeedback, generateFeedbackStream } = require("../services/openaiClient");
const { makeKey, getCache, setCache } = require("../services/aiCache");

const startInterview = async (req, res, next) => {
  try {
    const { skills = [], sessionType = "mixed", companyFocus, aiMode = "classic" } = req.body;
    const questions = await generateQuestions({ skills, performanceScore: req.body.performanceScore || 70, aiMode });

    const session = await Session.create({
      userId: req.user.id,
      sessionType,
      companyFocus,
      questions: questions.map((q) => ({
        questionId: q._id,
        questionText: q.question,
        idealAnswer: q.idealAnswer,
        keywordsFound: [],
        timeSpent: 0,
        skill: q.skill,
        category: q.category
      }))
    });

    return res.status(201).json({ sessionId: session._id, questions: session.questions });
  } catch (error) {
    return next(error);
  }
};

const submitAnswer = async (req, res, next) => {
  try {
    const { sessionId, questionId, userAnswer, timeSpent, aiMode = "classic" } = req.body;
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

    let aiFeedback = null;
    if (aiMode === "llm") {
      const cacheKey = makeKey(["feedback", questionEntry.questionText, questionEntry.idealAnswer, userAnswer]);
      const cached = getCache(cacheKey);
      if (cached) {
        aiFeedback = cached;
      } else {
        try {
          aiFeedback = await generateFeedback({
            question: questionEntry.questionText,
            idealAnswer: questionEntry.idealAnswer,
            userAnswer,
            similarityScore
          });
          if (aiFeedback) setCache(cacheKey, aiFeedback);
        } catch {
          // keep fallback
        }
      }

      if (aiFeedback?.feedback) {
        questionEntry.feedback = aiFeedback.feedback;
      }
      if (aiFeedback?.keywords?.length) {
        questionEntry.keywordsFound = aiFeedback.keywords;
      }
    }

    session.overallScore = Math.round(
      session.questions.reduce((acc, q) => acc + (q.similarityScore || 0), 0) / session.questions.length
    );

    await session.save();

    return res.status(200).json({
      similarityScore,
      confidenceScore,
      feedback: questionEntry.feedback,
      keywordsFound: questionEntry.keywordsFound,
      aiFeedback
    });
  } catch (error) {
    return next(error);
  }
};

const submitAnswerStream = async (req, res, next) => {
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

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    let aiFeedback = null;
    const cacheKey = makeKey(["feedback", questionEntry.questionText, questionEntry.idealAnswer, userAnswer]);
    const cached = getCache(cacheKey);
    if (cached) {
      aiFeedback = cached;
    } else {
      try {
        aiFeedback = await generateFeedbackStream({
          question: questionEntry.questionText,
          idealAnswer: questionEntry.idealAnswer,
          userAnswer,
          similarityScore,
          onDelta: (delta) => {
            res.write(`data: ${JSON.stringify({ type: "delta", delta })}\n\n`);
          }
        });
        if (aiFeedback) setCache(cacheKey, aiFeedback);
      } catch {
        // keep fallback
      }
    }

    if (aiFeedback?.feedback) {
      questionEntry.feedback = aiFeedback.feedback;
    }
    if (aiFeedback?.keywords?.length) {
      questionEntry.keywordsFound = aiFeedback.keywords;
    }

    session.overallScore = Math.round(
      session.questions.reduce((acc, q) => acc + (q.similarityScore || 0), 0) / session.questions.length
    );

    await session.save();

    res.write(`data: ${JSON.stringify({
      type: "done",
      similarityScore,
      confidenceScore,
      feedback: questionEntry.feedback,
      keywordsFound: questionEntry.keywordsFound,
      aiFeedback
    })}\n\n`);
    res.end();
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
  submitAnswerStream,
  getHistory
};
