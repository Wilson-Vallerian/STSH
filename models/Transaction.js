const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["transfer", "insurance", "requestAgriculture"],
    required: true,
  },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Optional if not transfer
  recipientId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Optional if not transfer
  amount: { type: Number, required: true },
  tax: { type: Number, default: 0 },
  total: { type: Number }, // amount + tax
  insuranceType: { type: String }, // For insurance only
  planType: { type: String }, // For insurance only
  seedType: { type: String }, // For agriculture
  dirtType: { type: String }, // For agriculture
  timestamp: { type: Date, default: Date.now },
});

const Transaction = mongoose.model("Transaction", transactionSchema, "Transactions");

module.exports = Transaction;
