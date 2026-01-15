const mongoose = require("mongoose");
const User = require("./userSchema");
const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: User,
    },

    razorpayOrderId: String,
    razorpayPaymentId: String,
    amount: Number,
    credits: Number,

    status: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("Transaction", transactionSchema);
