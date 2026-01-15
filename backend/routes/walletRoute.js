const express = require("express");
const router = express.Router();
const Wallet = require("../models/wallet");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/wallet-deduct", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { credits } = req.body;

    const wallet = await Wallet.findOneAndUpdate(
      {
        userId,
        balance: { $gte: credits }, // ✅ atomic condition
      },
      {
        $inc: { balance: -credits },
      },
      { new: true }
    );

    if (!wallet) {
      return res
        .status(400)
        .json({ success: false, message: "Insufficient wallet balance" });
    }

    res.status(200).json({
      success: true,
      wallet,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
