const express = require("express");
const { listUsers, listQuestions } = require("../controllers/adminController");
const { getSystemAnalytics } = require("../controllers/analyticsController");
const { createQuestion, updateQuestion, deleteQuestion } = require("../controllers/questionController");
const { authMiddleware, adminOnly } = require("../middleware/auth");

const router = express.Router();

router.get("/users", authMiddleware, adminOnly, listUsers);
router.get("/analytics", authMiddleware, adminOnly, getSystemAnalytics);
router.get("/questions", authMiddleware, adminOnly, listQuestions);
router.post("/questions", authMiddleware, adminOnly, createQuestion);
router.put("/questions/:id", authMiddleware, adminOnly, updateQuestion);
router.delete("/questions/:id", authMiddleware, adminOnly, deleteQuestion);

module.exports = router;
