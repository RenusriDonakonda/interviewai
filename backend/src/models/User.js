const mongoose = require("mongoose");

const extractedSkillSchema = new mongoose.Schema({
  skill: { type: String, required: true },
  category: { type: String, required: true },
  confidence: { type: Number, default: 0 }
});

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    createdAt: { type: Date, default: Date.now },
    lastActive: { type: Date, default: Date.now },
    subscription: { type: String, enum: ["free", "pro", "enterprise"], default: "free" },
    resumeUrl: String,
    extractedSkills: [extractedSkillSchema],
    totalInterviews: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    improvementRate: { type: Number, default: 0 },
    theme: { type: String, enum: ["dark", "light"], default: "dark" },
    emailNotifications: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
