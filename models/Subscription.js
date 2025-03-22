const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  email: { type: String, required: true },
  insuranceType: { type: String, required: true },
  planType: { type: String, required: true },
  price: { type: Number, required: true },
  tax: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Subscription", subscriptionSchema);
