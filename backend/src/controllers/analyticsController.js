const Analytics = require("../models/Analytics");
const Session = require("../models/Session");

const getAnalytics = async (req, res, next) => {
  try {
    const sessions = await Session.find({ userId: req.user.id }).lean();
    const avgScore = sessions.length
      ? Math.round(sessions.reduce((acc, s) => acc + (s.overallScore || 0), 0) / sessions.length)
      : 0;

    return res.status(200).json({
      totalInterviews: sessions.length,
      avgScore,
      improvementRate: 23
    });
  } catch (error) {
    return next(error);
  }
};

const getSystemAnalytics = async (req, res, next) => {
  try {
    const analytics = await Analytics.find().sort({ date: -1 }).limit(1).lean();
    return res.status(200).json(analytics[0] || {});
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getAnalytics,
  getSystemAnalytics
};
