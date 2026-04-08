const User = require("../models/User");

const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.status(200).json(user);
  } catch (error) {
    return next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { name, email, theme, emailNotifications } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (typeof theme === "string") updates.theme = theme;
    if (typeof emailNotifications === "boolean") updates.emailNotifications = emailNotifications;

    if (email) {
      const existing = await User.findOne({ email, _id: { $ne: req.user.id } });
      if (existing) return res.status(400).json({ message: "Email already in use" });
      updates.email = email;
    }

    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true }).select("-password");
    return res.status(200).json(user);
  } catch (error) {
    return next(error);
  }
};

const uploadAvatar = async (req, res, next) => {
  try {
    const buffer = req.file?.buffer;
    if (!buffer) return res.status(400).json({ message: "No image uploaded" });

    const mime = req.file.mimetype || "image/png";
    const base64 = buffer.toString("base64");
    const dataUrl = `data:${mime};base64,${base64}`;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { avatarUrl: dataUrl },
      { new: true }
    ).select("-password");

    return res.status(200).json({ avatarUrl: user.avatarUrl });
  } catch (error) {
    return next(error);
  }
};

const removeAvatar = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { avatarUrl: "" },
      { new: true }
    ).select("-password");

    return res.status(200).json({ avatarUrl: user.avatarUrl });
  } catch (error) {
    return next(error);
  }
};

module.exports = { getProfile, updateProfile, uploadAvatar, removeAvatar };
