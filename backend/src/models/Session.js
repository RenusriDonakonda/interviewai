const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  questionId: mongoose.Schema.Types.ObjectId,
  questionText: String,
  userAnswer: String,
  idealAnswer: String,
  similarityScore: Number,
  confidenceScore: Number,
  feedback: String,
  keywordsFound: [String],
  timeSpent: Number,
  skill: String,
  category: String
});

const sessionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    sessionDate: { type: Date, default: Date.now },
    sessionType: { type: String, enum: ["technical", "behavioral", "mixed"], default: "mixed" },
    companyFocus: String,
    questions: [questionSchema],
    overallScore: Number,
    strengths: [String],
    improvements: [String],
    reportGenerated: { type: Boolean, default: false },
    reportUrl: String
  },
  { timestamps: true }
);

module.exports = mongoose.model("Session", sessionSchema);
