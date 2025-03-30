const mongoose = require("mongoose");

const otpRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  email: { type: String, required: true }, // ✅ Add this line
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 180 }, // expires after 3 minutes
});

module.exports = mongoose.model("OTPrequest", otpRequestSchema);
