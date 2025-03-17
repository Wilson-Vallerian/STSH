const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  age: Number,
  dateOfBirth: String,
  password: { type: String, required: true },
  photoUrl: { type: String, default: "" },
  stshToken: { type: Number, default: 0 },
  role: { type: String, default: "user" },
  transactions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Transaction" }],
  qrCodeUrl: { type: String },
});

// Ensure virtuals are included when converting to JSON
userSchema.set("toJSON", { virtuals: true });
userSchema.set("toObject", { virtuals: true });

const User = mongoose.model("User", userSchema, "Users");

module.exports = User;
