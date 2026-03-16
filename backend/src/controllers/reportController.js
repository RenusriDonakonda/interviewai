const { generateReport } = require("../services/reportGenerator");
const Session = require("../models/Session");

const generateReportHandler = async (req, res, next) => {
  try {
    const { sessionId } = req.body;
    const session = await Session.findById(sessionId).lean();
    if (!session) return res.status(404).json({ message: "Session not found" });

    const doc = generateReport({
      candidate: req.user.email,
      sessionDate: new Date(session.sessionDate).toDateString(),
      sessionType: session.sessionType,
      score: session.overallScore,
      strengths: session.strengths || ["Strong technical vocabulary", "Clear communication style"],
      improvements: session.improvements || ["Provide more examples", "Structure answers using STAR"],
      questions: session.questions || []
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=interviewai-report.pdf");
    doc.pipe(res);
  } catch (error) {
    return next(error);
  }
};

module.exports = { generateReportHandler };
