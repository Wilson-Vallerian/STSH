const mongoose = require("mongoose");

const RequestSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    seedType: { type: String, required: true },
    seedAmount: { type: Number, required: true },
    dirtType: { type: String, required: true },
    dirtAmount: { type: Number, required: true },
    address: { type: String, required: true },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  },
  { timestamps: true } // Automatically adds createdAt & updatedAt fields
);

module.exports = mongoose.model("Request", RequestSchema);
