const mongoose = require("mongoose");

const analyticsSchema = new mongoose.Schema(
  {
    date: { type: Date, default: Date.now },
    totalUsers: Number,
    totalInterviews: Number,
    avgScore: Number,
    popularSkills: [
      {
        skill: String,
        count: Number
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Analytics", analyticsSchema);
