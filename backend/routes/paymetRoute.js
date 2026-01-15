const express = require("express");
const router = express.Router();
const Transaction = require("../models/transactionModel");
const razorpay = require("../config/razorpay");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/createOrder", authMiddleware, async (req, res) => {
  try {
    const { amount, credits } = req.body;
    const userId = req.user.id;

    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
    });

    await Transaction.create({
      userId,
      razorpayOrderId: order.id,
      amount,
      credits,
      status: "pending",
    });

    res.status(200).json({
      success: true,
      message: "Order created successfully",
      orderId: order.id,
      amount: order.amount,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
