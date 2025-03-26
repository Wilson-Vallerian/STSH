const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["transfer", "insurance", "requestAgriculture"],
    required: true,
    default: "transfer",
  },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  recipientId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // for non-transfer
  amount: { type: Number, required: true },
  tax: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  seedType: String,
  dirtType: String,
  insuranceType: String,
  planType: String,
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Transaction", transactionSchema);
