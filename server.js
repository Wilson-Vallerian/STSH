require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Default GET route for testing
app.get("/", (req, res) => {
  res.send("🚀 API is running on Render!");
});

const users = [{ email: "test@gmail.com", password: "123456" }];

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
