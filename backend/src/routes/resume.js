const express = require("express");
const multer = require("multer");
const { uploadResume, getSkills } = require("../controllers/resumeController");
const { authMiddleware } = require("../middleware/auth");

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["application/pdf", "text/plain", "application/octet-stream", ""];
    const lowerName = (file.originalname || "").toLowerCase();
    const allowedExt = lowerName.endsWith(".pdf") || lowerName.endsWith(".txt");

    if (!allowedTypes.includes(file.mimetype) && !allowedExt) {
      const error = new Error("Unsupported file type. Please upload a PDF or TXT file.");
      error.status = 400;
      return cb(error);
    }
    if (!allowedExt) {
      const error = new Error("File extension not supported. Please upload a PDF or TXT file.");
      error.status = 400;
      return cb(error);
    }
    return cb(null, true);
  }
});

const uploadMiddleware = (req, res, next) => {
  upload.single("file")(req, res, (err) => {
    if (err) {
      err.status = err.status || 400;
      return next(err);
    }
    return next();
  });
};

router.post("/upload", authMiddleware, uploadMiddleware, uploadResume);
router.get("/skills", authMiddleware, getSkills);

module.exports = router;
