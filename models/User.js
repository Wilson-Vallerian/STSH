const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  age: Number,
  dateOfBirth: String,
  password: { type: String, required: true },
  photoUrl: { type: String, default: "" },
  stshToken: { type: Number, default: 0 },
  totalToken: { type: Number, default: 0 },
  role: { type: String, default: "user" },
  transactions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Transaction" }],
  qrCodeUrl: { type: String },
});

const User = mongoose.model("User", userSchema, "Users");

module.exports = User;
