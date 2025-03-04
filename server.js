require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const fs = require("fs");
const multer = require("multer");
const path = require("path");
const User = require("./models/User");
const Transaction = require("./models/Transaction");
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Environment variables
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// Check if MONGO_URI is present
if (!MONGO_URI) {
  console.error("❌ No MONGO_URI provided in .env file!");
  process.exit(1);
}

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB successfully!");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
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

// ==========================
// User Registration
// ==========================
app.post("/register", async (req, res) => {
  try {
    let { name, email, age, dateOfBirth, password } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({
        message: "Missing required fields: name, email, password",
        status: "FAILED",
      });
    }

    email = email.toLowerCase();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists", status: "FAILED" });
    }

    // Create and save new user
    const newUser = new User({
      name,
      email,
      age,
      dateOfBirth,
      password,
      stshToken: 5,
      role: "user",
    });
    await newUser.save();

    res.status(201).json({
      message: "User registered successfully!",
      status: "SUCCESS",
      user: newUser,
    });
  } catch (error) {
    res.status(500).json({ message: "Registration error", status: "FAILED", error: error.message });
  }
});

// ==========================
// User Login
// ==========================
app.post("/login", async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required", status: "FAILED" });
    }

    email = email.toLowerCase();
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "User not found", status: "FAILED" });
    }

    if (user.password !== password) {
      return res.status(401).json({ message: "Incorrect password", status: "FAILED" });
    }

    res.json({ message: "Login successful!", status: "SUCCESS", user });
  } catch (error) {
    res.status(500).json({ message: "Login error", status: "FAILED", error: error.message });
  }
});

// ==========================
// Update User Details
// ==========================
app.put("/updateName", async (req, res) => {
  try {
    const { userId, newName } = req.body;

    if (!userId || !newName) {
      return res.status(400).json({ message: "Missing userId or newName", status: "FAILED" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found", status: "FAILED" });
    }

    user.name = newName;
    await user.save();

    res.json({ message: "Name updated successfully", status: "SUCCESS", updatedUser: user });
  } catch (error) {
    res.status(500).json({ message: "Server error: " + error.message, status: "FAILED" });
  }
});


// ==========================
// Profile Picture Upload
// ==========================
const UPLOADS_FOLDER = path.join(__dirname, "uploads");

if (!fs.existsSync(UPLOADS_FOLDER)) {
  fs.mkdirSync(UPLOADS_FOLDER, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOADS_FOLDER);
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// Filter File (Allow only images)
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error("Only .jpeg, .jpg, and .png files are allowed!"), false);
  }
  cb(null, true);
};

const upload = multer({ storage, fileFilter });

// Profile Picture Upload API
app.put("/updateProfilePicture", upload.single("profilePicture"), async (req, res) => {
  try {
    const { userId } = req.body;

    // Validate user ID
    if (!userId) {
      return res.status(400).json({ message: "User ID is required.", status: "FAILED" });
    }

    // Find the user first
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found", status: "FAILED" });
    }

    // Ensure a file was uploaded
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded.", status: "FAILED" });
    }

    // Construct the file URL dynamically
    const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

    // Update user profile picture in the database
    user.photoUrl = fileUrl;
    await user.save();

    res.json({
      message: "Profile picture updated successfully!",
      status: "SUCCESS",
      updatedUser: user,
    });
  } catch (error) {
    console.error("Profile picture update error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Serve the "uploads" folder statically to access images via URL
app.use("/uploads", express.static(UPLOADS_FOLDER));
module.exports = app;

// ==========================
// Transfer STSH Tokens
// ==========================
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

    if (sender.password !== password) {
      return res.status(401).json({ message: "Incorrect password", status: "FAILED" });
    }

    if (sender.stshToken < amount) {
      return res.status(400).json({ message: "Insufficient balance", status: "FAILED" });
    }

    sender.stshToken -= amount;
    recipient.stshToken += amount;

    // Store transaction
    const transaction = new Transaction({ senderId, recipientId, amount });
    await transaction.save();

    // Update users with transaction history
    sender.transactions.push(transaction._id);
    recipient.transactions.push(transaction._id);

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

// Get User by Email
app.get("/user/email/:email", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: "User not found", status: "FAILED" });
    }
    res.json({
      _id: user._id,
      name: user.name,
      stshToken: user.stshToken
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ==========================
// Fetch User Details
// ==========================
app.get("/user/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User ID not found", status: "FAILED" });

    res.json({ name: user.name, stshToken: user.stshToken });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ==========================
// Fetch Transaction History
// ==========================
app.get("/transactions/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const transactions = await Transaction.find({
      $or: [{ senderId: userId }, { recipientId: userId }],
    })
      .populate("senderId", "name")
      .populate("recipientId", "name")
      .sort({ timestamp: -1 });

    res.json({ transactions });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ==========================
// Post Loan Details
// ==========================
app.post("/applyLoan", async (req, res) => {
  const { userId, amount, password } = req.body;

  if (!userId || !amount || amount <= 0 || !password) {
    return res.status(400).json({ message: "Invalid input", status: "FAILED" });
  }

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found", status: "FAILED" });
    }

    if (user.password !== password) {
      return res.status(401).json({ message: "Incorrect password", status: "FAILED" });
    }

    // Update the user's balance by adding the loan amount
    user.stshToken += parseInt(amount);

    // Save loan transaction
    const loanTransaction = new Transaction({
      senderId: "LOAN_SYSTEM",
      recipientId: userId,
      amount: parseInt(amount),
      type: "loan",
    });

    await loanTransaction.save();

    // Link transaction to user
    user.transactions.push(loanTransaction._id);
    await user.save();

    res.json({
      message: `Loan of ${amount} STSH Token granted successfully!`,
      updatedBalance: user.stshToken,
      status: "SUCCESS",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

