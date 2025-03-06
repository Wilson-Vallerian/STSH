const mongoose = require("mongoose");

const LoanSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ["debt", "paid"], default: "debt" },
  approval: { type: Boolean, default: false }, // false = not yet approved, true = approved
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Loan", LoanSchema);
