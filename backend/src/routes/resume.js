const express = require("express");
const multer = require("multer");
const { uploadResume, getSkills } = require("../controllers/resumeController");
const { authMiddleware } = require("../middleware/auth");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/upload", authMiddleware, upload.single("file"), uploadResume);
router.get("/skills", authMiddleware, getSkills);

module.exports = router;
