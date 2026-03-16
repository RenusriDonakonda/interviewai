const express = require("express");
const { getProfile } = require("../controllers/userController");
const { authMiddleware } = require("../middleware/auth");

const router = express.Router();

router.get("/profile", authMiddleware, getProfile);

module.exports = router;
