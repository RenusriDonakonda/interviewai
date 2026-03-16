const mongoose = require("mongoose");

const questionBankSchema = new mongoose.Schema(
  {
    category: { type: String, enum: ["technical", "behavioral", "system-design"], required: true },
    skill: { type: String, required: true },
    difficulty: { type: String, enum: ["easy", "medium", "hard"], required: true },
    question: { type: String, required: true },
    idealAnswer: { type: String, required: true },
    keywords: [String],
    company: String,
    timesUsed: { type: Number, default: 0 },
    avgScore: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Question", questionBankSchema);
