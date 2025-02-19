require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const app = express();
app.use(cors({ origin: "*" })); // Allow all requests
app.use(bodyParser.json());

// ✅ Connect to MongoDB (Fix for ENOTFOUND error)
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch(error => console.error("🚨 MongoDB Connection Error:", error));

// ✅ Define User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  dateOfBirth: { type: String, required: true },
  password: { type: String, required: true }
});

const User = mongoose.model("User", userSchema);

// ✅ Default GET Route
app.get("/", (req, res) => {
  res.send("🚀 API is running with MongoDB!");
});

// ✅ Registration Route
app.post("/register", async (req, res) => {
  const { name, email, dateOfBirth, password, confirmPassword } = req.body;

  if (!name || !email || !dateOfBirth || !password || !confirmPassword) {
    return res.status(400).json({ status: "FAILED", message: "All fields are required" });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ status: "FAILED", message: "Passwords do not match" });
  }

  try {
    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ status: "FAILED", message: "Email already in use" });
    }

    // Create a new user
    const newUser = new User({ name, email, dateOfBirth, password });
    await newUser.save();

    res.json({ status: "SUCCESS", message: "User registered successfully", user: newUser });
  } catch (error) {
    res.status(500).json({ status: "FAILED", message: "Registration error", error: error.message });
  }
});

// ✅ Login Route
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email, password });

    if (user) {
      res.json({ status: "SUCCESS", message: "Login successful", user });
    } else {
      res.status(401).json({ status: "FAILED", message: "Invalid credentials" });
    }
  } catch (error) {
    res.status(500).json({ status: "FAILED", message: "Login error", error: error.message });
  }
});

// ✅ Server Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
