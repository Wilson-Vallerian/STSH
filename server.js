require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Environment variables
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// Check if MONGO_URI is present
if (!MONGO_URI) {
  // console.error("❌ No MONGO_URI provided in .env file!");
  process.exit(1);
}

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB successfully!");
  } catch (error) {
    // console.error("❌ MongoDB connection error:", error.message);
    process.exit(1);
  }
}

// Start server only after DB is connected
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
  });
});

// Basic route to check that API is running
app.get("/", (req, res) => {
  res.send("✅ API is running...");
});

// Define User Schema & Model
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  age: Number,
  dateOfBirth: String,
  // In development, storing plain text password (not recommended for production)
  password: { type: String, required: true },
  stshToken: { type: Number, default: 0 },
  role: { type: String, default: "user" },
});

const User = mongoose.model("User", userSchema, "Users");

// Registration Route
app.post("/register", async (req, res) => {
  try {
    let { name, email, age, dateOfBirth, password } = req.body;

    // Basic validation
    if (!email || !password || !name) {
      return res.status(400).json({
        message: "Missing required fields: name, email, password",
        status: "FAILED",
      });
    }

    email = email.toLowerCase(); // standardize email

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User already exists", status: "FAILED" });
    }

    // Create and save new user
    const newUser = new User({
      name,
      email,
      age,
      dateOfBirth,
      password,
      stshToken: 0,
      role: "user",
    });
    await newUser.save();

    res.status(201).json({
      message: "User registered successfully!",
      status: "SUCCESS",
      user: newUser,
    });
  } catch (error) {
    // console.error("❌ Registration Error:", error);
    res.status(500).json({
      message: "Registration error",
      status: "FAILED",
      error: error.message,
    });
  }
});

// Login Route
app.post("/login", async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required", status: "FAILED" });
    }

    email = email.toLowerCase();

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .json({ message: "User not found", status: "FAILED" });
    }

    // Compare plain-text passwords
    if (user.password !== password) {
      return res
        .status(401)
        .json({ message: "Incorrect password", status: "FAILED" });
    }

    res.json({
      message: "Login successful!",
      status: "SUCCESS",
      user,
    });
  } catch (error) {
    // console.error("❌ Login Error:", error);
    res.status(500).json({
      message: "Login error",
      status: "FAILED",
      error: error.message,
    });
  }
});

// Update User Name
app.put("/updateName", async (req, res) => {
  try {
    const { userId, newName } = req.body;
    if (!userId || !newName) {
      return res.status(400).json({
        message: "Missing userId or newName",
        status: "FAILED",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        status: "FAILED",
      });
    }

    user.name = newName;
    await user.save();

    res.json({
      message: "Name updated successfully",
      status: "SUCCESS",
      updatedUser: user,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error: " + error.message,
      status: "FAILED",
    });
  }
});

// Update Password
app.put("/updatePassword", async (req, res) => {
  try {
    const { userId, currentPassword, newPassword } = req.body;

    // Basic validation
    if (!userId || !currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Missing userId, currentPassword, or newPassword",
        status: "FAILED",
      });
    }

    // Find user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        status: "FAILED",
      });
    }

    // Compare the user’s current password
    if (user.password !== currentPassword) {
      return res.status(401).json({
        message: "Incorrect current password",
        status: "FAILED",
      });
    }

    // If the current password matches, update to new password
    user.password = newPassword;
    await user.save();

    // Respond with SUCCESS
    res.json({
      message: "Password updated successfully!",
      status: "SUCCESS",
      updatedUser: user,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error: " + error.message,
      status: "FAILED",
    });
  }
});

// Get User ID
// Get User Details by ID
app.get("/user/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User ID not found", status: "FAILED" });
    }
    res.json({
      name: user.name,
      stshToken: user.stshToken,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Handle Transfer STSH Token
app.post("/transfer", async (req, res) => {
  const { senderId, recipientId, amount, password } = req.body;

  if (!senderId || !recipientId || !amount || amount <= 0 || !password) {
    return res.status(400).json({ message: "Invalid input", status: "FAILED" });
  }

  try {
    const sender = await User.findById(senderId);
    const recipient = await User.findById(recipientId);

    if (!sender) return res.status(404).json({ message: "Sender not found", status: "FAILED" });
    if (!recipient) return res.status(404).json({ message: "Recipient not found", status: "FAILED" });

    // Verify sender's password (for security)
    if (sender.password !== password) {
      return res.status(401).json({ message: "Incorrect password", status: "FAILED" });
    }

    // Check sender's balance
    if (sender.stshToken < amount) {
      return res.status(400).json({ message: "Insufficient balance", status: "FAILED" });
    }

    // Update balances
    sender.stshToken -= amount;
    recipient.stshToken += amount;

    await sender.save();
    await recipient.save();

    res.json({
      message: `Transferred ${amount} STSH Token to ${recipient.name} (${recipientId})`,
      senderBalance: sender.stshToken,
      recipientBalance: recipient.stshToken,
      status: "SUCCESS",
    });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});
