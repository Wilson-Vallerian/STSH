const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  seed: { type: Number, required: true },
  dirt: { type: Number, required: true },
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  timestamp: { type: Date, default: Date.now },
});

const Request = mongoose.model("Request", requestSchema);
module.exports = Request;
