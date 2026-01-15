const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const Wallet = require("../models/wallet");
const Transaction = require("../models/transactionModel");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/verifyPayment", authMiddleware, async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    const body = razorpayOrderId + "|" + razorpayPaymentId;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid signature" });
    }

    const transaction = await Transaction.findOneAndUpdate(
      { razorpayOrderId, status: "pending" },
      {
        razorpayPaymentId,
        status: "success",
      },
      { new: true }
    );

    if (!transaction) {
      return res
        .status(400)
        .json({ message: "Invalid or duplicate transaction" });
    }

    await Wallet.findOneAndUpdate(
      { userId: transaction.userId },
      { $inc: { balance: transaction.credits } },
      { upsert: true }
    );

    res.json({
      success: true,
      message: "Payment verified & wallet credited",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
