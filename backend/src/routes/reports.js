const express = require("express");
const { generateReportHandler } = require("../controllers/reportController");
const { authMiddleware } = require("../middleware/auth");

const router = express.Router();

router.post("/generate", authMiddleware, generateReportHandler);

module.exports = router;
