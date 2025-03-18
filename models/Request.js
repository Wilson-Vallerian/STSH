const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  seedType: { type: String, required: true },
  seedAmount: { type: Number, required: true },
  dirtType: { type: String, required: true },
  dirtAmount: { type: Number, required: true },
  address: { type: String, required: true },
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  approval: { type: Boolean, default: false },
  totalPrice: { type: Number, default: 0 },
  timestamp: { type: Date, default: Date.now }
});

const Request = mongoose.model("Request", requestSchema, "Requests");

module.exports = Request;
