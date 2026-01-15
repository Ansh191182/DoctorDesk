const express = require("express");
const router = express.Router();

const Wallet = require("../models/wallet");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/wallet", authMiddleware, async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ userId: req.user.id });

    res.json({
      success: true,
      balance: wallet?.balance || 0,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
