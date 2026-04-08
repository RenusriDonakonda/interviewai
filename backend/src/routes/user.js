const express = require("express");
const multer = require("multer");
const { getProfile, updateProfile, uploadAvatar, removeAvatar } = require("../controllers/userController");
const { authMiddleware } = require("../middleware/auth");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 2 * 1024 * 1024 } });

router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);
router.post("/avatar", authMiddleware, upload.single("file"), uploadAvatar);
router.delete("/avatar", authMiddleware, removeAvatar);

module.exports = router;
