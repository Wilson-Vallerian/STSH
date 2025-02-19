require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// Database Connection
const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✅ Connected to MongoDB Successfully!");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    process.exit(1); // Stop Server If Connection Fails
  }
};

// Start Server Only After DB is Connected
connectDB().then(() => {
  app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
});

// Basic API Route (Check If API Works)
app.get("/", (req, res) => {
  res.send("✅ API is running...");
});

// User Schema & Model
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  age: Number,
  password: String,
});

const User = mongoose.model("User", userSchema, "Users");  // Change TestingDB to other collection

// Registration Route
app.post("/register", async (req, res) => {
  try {
    const { name, email, age, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists", status: "FAILED" });
    }

    // Create and save new user
    const newUser = new User({ name, email, age, password });
    await newUser.save();

    // Ensure backend sends user data back
    res.status(201).json({ 
      message: "User registered successfully!", 
      status: "SUCCESS", 
      user: newUser 
    });

  } catch (error) {
    console.error("❌ Registration Error:", error);
    res.status(500).json({ 
      message: "Registration error", 
      status: "FAILED", 
      error: error.message 
    });
  }
});


// Login Route
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "User not found", status: "FAILED" });
    }

    // Compare passwords (if using plaintext)
    if (user.password !== password) {
      return res.status(401).json({ message: "Incorrect password", status: "FAILED" });
    }

    res.json({ message: "Login successful!", status: "SUCCESS", user });
  } catch (error) {
    console.error("❌ Login Error:", error);
    res.status(500).json({ message: "Login error", status: "FAILED", error: error.message });
  }
});
