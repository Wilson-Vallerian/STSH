require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors({ origin: "*" })); // Allow all requests
app.use(bodyParser.json());

const users = []; // Store users temporarily (Replace with DB later)

// Default GET route
app.get("/", (req, res) => {
  res.send("🚀 API is running on Render!");
});

// Registration Route
app.post("/register", (req, res) => {
  const { name, email, dateOfBirth, password, confirmPassword } = req.body;

  if (!name || !email || !dateOfBirth || !password || !confirmPassword) {
    return res.status(400).json({ status: "FAILED", message: "All fields are required" });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ status: "FAILED", message: "Passwords do not match" });
  }

  // Simulate storing the user (Replace with DB logic)
  const newUser = { name, email, dateOfBirth, password };
  users.push(newUser);

  res.json({ status: "SUCCESS", message: "User registered successfully", user: newUser });
});

// Login Route
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);

  if (user) {
    res.json({ status: "SUCCESS", message: "Login successful", user });
  } else {
    res.status(401).json({ status: "FAILED", message: "Invalid credentials" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
