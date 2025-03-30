const mongoose = require("mongoose");

const otpRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 180 },
});

module.exports = mongoose.model("OTPrequest", otpRequestSchema);
