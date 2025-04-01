const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  recipientId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  amount: { type: Number, required: true },
  method: {
    type: String,
    enum: ["transfer", "topup", "loan", "request", "insurance"],
    required: true,
  },
  tax: { type: Number, default: 0 },
  timestamp: { type: Date, default: Date.now },
});

const Transaction = mongoose.model("Transaction", transactionSchema, "Transactions");

module.exports = Transaction;
