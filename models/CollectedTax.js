const mongoose = require("mongoose");

const collectedTaxSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  email: { type: String, required: true },
  method: { type: String, enum: ["loan", "transfer", "insurance"], required: true },
  taxCollected: { type: Number, required: true },
  transactionAmount: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
});

const CollectedTax = mongoose.model("CollectedTax", collectedTaxSchema, "CollectedTaxes");

module.exports = CollectedTax;
