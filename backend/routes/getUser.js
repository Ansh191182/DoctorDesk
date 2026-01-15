const express = require("express");
const router = express.Router();
const User = require("../models/userSchema");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/getUser", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("name email");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
