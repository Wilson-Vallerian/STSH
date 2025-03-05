const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  age: Number,
  dateOfBirth: String,
  password: { type: String, required: true },
  photoUrl: { type: String, default: "" },
  stshToken: { type: Number, default: 0 },
  loan: { type: Number, default: 0 }, 
  totalToken: { type: Number, default: 0 },
  role: { type: String, default: "user" },
  
  // Transaction History (Reference to Transactions)
  transactions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Transaction" }]
});

userSchema.pre("save", function (next) {
  this.totalToken = this.stshToken + this.loan;
  next();
});

const User = mongoose.model("User", userSchema, "Users");

module.exports = User;
