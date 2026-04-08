const express = require("express");
const { startInterview, submitAnswer, submitAnswerStream, getHistory } = require("../controllers/interviewController");
const { authMiddleware } = require("../middleware/auth");

const router = express.Router();

router.post("/start", authMiddleware, startInterview);
router.post("/submit", authMiddleware, submitAnswer);
router.post("/submit/stream", authMiddleware, submitAnswerStream);
router.get("/history", authMiddleware, getHistory);

module.exports = router;
