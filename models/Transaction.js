const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  recipientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
  amount: { type: Number, required: true }, // Original amount
  tax: { type: Number, default: 0 },
  totalAmount: { type: Number, default: 0 },
  method: { type: String, enum: ["transfer", "subscription", "request"], required: true },
  timestamp: { type: Date, default: Date.now },
});

const Transaction = mongoose.model("Transaction", transactionSchema, "Transactions");

module.exports = Transaction;
