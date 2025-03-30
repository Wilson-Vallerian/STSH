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
const Loan = require("./models/Loan");
const QRCode = require("qrcode");
const Request = require("./models/Request");
const CollectedTax = require("./models/CollectedTax");
const Subscription = require("./models/Subscription");
const Notification = require("./models/Notification");
const cron = require("node-cron");
const bcrypt = require("bcryptjs");
const OTPrequest = require("./models/OTPrequest");
const nodemailer = require("nodemailer");

// Middleware
app.use(express.json());
app.use(cors());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

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
    cleanupExpiredSubscriptions();
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
    let { name, email, dateOfBirth, password } = req.body;

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
      return res
        .status(400)
        .json({ message: "User already exists", status: "FAILED" });
    }

    const hashedPassword = await bcrypt.hash(password, 10); // 10 = salt rounds

    // Create new user document
    const newUser = new User({
      name,
      email,
      dateOfBirth,
      password: hashedPassword,
      stshToken: 5,
      loan: 0,
      role: "user",
    });

    await newUser.save();

    // Generate QR code containing the user's ID
    const qrCodePath = path.join(__dirname, "uploads", `${newUser._id}.png`);
    await QRCode.toFile(qrCodePath, newUser._id.toString());

    // Store QR code inside a permanent profile folder (like profile pictures)
    const qrCodeFileName = `${newUser._id}-qrcode.png`;
    const qrCodeStoragePath = path.join(__dirname, "uploads", qrCodeFileName);
    fs.renameSync(qrCodePath, qrCodeStoragePath);

    const qrCodeUrl = `${req.protocol}://${req.get("host")}/uploads/${qrCodeFileName}`;

    // Update user with QR code URL
    newUser.qrCodeUrl = qrCodeUrl;
    await newUser.save();

    res.status(201).json({
      message: "User registered successfully!",
      status: "SUCCESS",
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        qrCodeUrl: qrCodeUrl,
      },
    });

    try {
      await Notification.create({
        userId: newUser._id,
        title: "Welcome 🎉",
        message: `Hi ${newUser.name}, welcome to STSH! We're glad to have you.`,
      });
    } catch (notifErr) {
      console.error(
        "⚠️ Failed to create welcome notification:",
        notifErr.message
      );
    }
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      message: "Registration error",
      status: "FAILED",
      error: error.message,
    });
  }
});

// ==========================
// User Login
// ==========================
app.post("/login", async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required", status: "FAILED" });
    }

    email = email.toLowerCase();
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(401)
        .json({ message: "User not found", status: "FAILED" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Incorrect password", status: "FAILED" });
    }

    res.json({ message: "Login successful!", status: "SUCCESS", user });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Login error", status: "FAILED", error: error.message });
  }
});

// ==========================
// OTP
// ==========================
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

app.post("/register/request-otp", async (req, res) => {
  try {
    const { name, email, dateOfBirth, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const otp = generateOTP();
    const fakeUserId = new mongoose.Types.ObjectId();

    await OTPrequest.deleteMany({ email });
    await OTPrequest.create({ userId: fakeUserId, email, otp });

    // ✉️ Send OTP via email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "vallerianWilson@gmail.com",
        pass: "clql jqgq hdjm ccxp", 
      },
    });

    await transporter.sendMail({
      from: `"StartShield App" <vallerianWilson@gmail.com>`,
      to: email,
      subject: "StartShield OTP Verification Code",
      html: `<p>Your OTP code is: <strong>${otp}</strong></p><p>It will expire in 3 minutes.</p>`,
    });

    res.json({
      message: "OTP sent",
      status: "PENDING",
      tempId: fakeUserId,
    });
  } catch (err) {
    console.error("OTP Error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

app.post("/verify-otp", async (req, res) => {
  const { tempId, otp, name, email, dateOfBirth, password } = req.body;

  const validOTP = await OTPrequest.findOne({ userId: tempId, otp });
  if (!validOTP) {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = new User({
    _id: tempId,
    name,
    email: email.toLowerCase(),
    dateOfBirth,
    password: hashedPassword,
    stshToken: 5,
    loan: 0,
    role: "user",
  });

  await user.save();

  // ✅ Generate QR code with user ID
  const qrCodePath = path.join(__dirname, "uploads", `${user._id}.png`);
  await QRCode.toFile(qrCodePath, user._id.toString());

  const qrCodeFileName = `${user._id}-qrcode.png`;
  const qrCodeStoragePath = path.join(__dirname, "uploads", qrCodeFileName);
  fs.renameSync(qrCodePath, qrCodeStoragePath);

  const qrCodeUrl = `${req.protocol}://${req.get("host")}/uploads/${qrCodeFileName}`;

  user.qrCodeUrl = qrCodeUrl;
  await user.save();

  // ✅ Cleanup OTP
  await OTPrequest.deleteOne({ _id: validOTP._id });

  // ✅ Send Welcome Notification
  try {
    await Notification.create({
      userId: user._id,
      title: "Welcome 🎉",
      message: `Hi ${user.name}, welcome to STSH! We're glad to have you.`,
    });
  } catch (notifErr) {
    console.error("⚠️ Failed to create welcome notification:", notifErr.message);
  }

  res.json({
    message: "Registration successful",
    status: "SUCCESS",
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      qrCodeUrl: user.qrCodeUrl,
      stshToken: user.stshToken,
    },
  });
});

// ==========================
// Update User Details
// ==========================
app.put("/updateName", async (req, res) => {
  try {
    const { userId, newName } = req.body;

    if (!userId || !newName) {
      return res
        .status(400)
        .json({ message: "Missing userId or newName", status: "FAILED" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found", status: "FAILED" });
    }

    user.name = newName;
    await user.save();

    res.json({
      message: "Name updated successfully",
      status: "SUCCESS",
      updatedUser: user,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server error: " + error.message, status: "FAILED" });
  }
});

// ==========================
// Update User Password
// ==========================
app.put("/updatePassword", async (req, res) => {
  try {
    const { userId, currentPassword, newPassword } = req.body;

    if (!userId || !currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Missing required fields", status: "FAILED" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found", status: "FAILED" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Incorrect current password", status: "FAILED" });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;
    await user.save();

    res.json({
      message: "Password updated successfully!",
      status: "SUCCESS",
      updatedUser: user,
    });
  } catch (error) {
    console.error("Password update error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
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
    return cb(
      new Error("Only .jpeg, .jpg, and .png files are allowed!"),
      false
    );
  }
  cb(null, true);
};

const upload = multer({ storage, fileFilter });

// Profile Picture Upload API
app.put(
  "/updateProfilePicture",
  upload.single("profilePicture"),
  async (req, res) => {
    try {
      const { userId } = req.body;

      if (!userId) {
        return res
          .status(400)
          .json({ message: "User ID is required.", status: "FAILED" });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res
          .status(404)
          .json({ message: "User not found", status: "FAILED" });
      }

      if (!req.file) {
        return res
          .status(400)
          .json({ message: "No file uploaded.", status: "FAILED" });
      }

      // Construct the absolute file URL
      const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

      // Update the user's profile picture in the database
      user.photoUrl = fileUrl;
      await user.save();

      res.json({
        message: "Profile picture updated successfully!",
        status: "SUCCESS",
        updatedUser: {
          _id: user._id,
          name: user.name,
          email: user.email,
          photoUrl: fileUrl,
        },
      });
    } catch (error) {
      console.error("Profile picture update error:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

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

    if (!sender)
      return res
        .status(404)
        .json({ message: "Sender not found", status: "FAILED" });
    if (!recipient)
      return res
        .status(404)
        .json({ message: "Recipient not found", status: "FAILED" });

    const isMatch = await bcrypt.compare(password, sender.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Incorrect password", status: "FAILED" });
    }

    const tax = Math.floor(amount / 500) + 1;
    const totalAmount = amount + tax;

    if (sender.stshToken < totalAmount) {
      return res
        .status(400)
        .json({ message: "Insufficient balance", status: "FAILED" });
    }

    sender.stshToken -= totalAmount;
    recipient.stshToken += amount;

    await sender.save();
    await recipient.save();

    // Store transaction
    const transaction = new Transaction({ senderId, recipientId, amount });
    await transaction.save();

    // Update users with transaction history
    sender.transactions.push(transaction._id);
    recipient.transactions.push(transaction._id);

    // Store tax collection record
    const taxRecord = new CollectedTax({
      userId: sender._id,
      email: sender.email,
      method: "transfer",
      taxCollected: tax,
      transactionAmount: amount,
    });
    await taxRecord.save();

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
      return res
        .status(404)
        .json({ message: "User not found", status: "FAILED" });
    }
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      stshToken: user.stshToken,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Find User by ID or Email
app.get("/user/search/:query", async (req, res) => {
  try {
    const query = req.params.query;
    const isObjectId = mongoose.Types.ObjectId.isValid(query);

    const user = await User.findOne(
      isObjectId ? { _id: query } : { email: query.toLowerCase() }
    );

    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found", status: "FAILED" });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      stshToken: user.stshToken,
    });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Server error",
        status: "FAILED",
        error: error.message,
      });
  }
});

// ==========================
// Fetch User Details
// ==========================
app.get("/user/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).lean();
    if (!user) {
      return res
        .status(404)
        .json({ message: "User ID not found", status: "FAILED" });
    }
    res.json({
      ...user,
    });
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
  try {
    console.log("🔵 Loan request received:", req.body);

    const { userId, amount, password } = req.body;

    if (!userId || !amount || amount <= 0 || !password) {
      console.log("❌ Validation failed: Missing fields or invalid amount.");
      return res
        .status(400)
        .json({ message: "Invalid input", status: "FAILED" });
    }

    const user = await User.findById(userId);
    if (!user) {
      console.log("❌ User not found in DB.");
      return res
        .status(404)
        .json({ message: "User not found", status: "FAILED" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Incorrect password", status: "FAILED" });
    }

    console.log("✅ User authenticated. Applying loan...");

    user.loan += parseInt(amount);
    await user.save();

    console.log(`✅ Loan of ${amount} STSH applied to ${userId}`);

    res.json({
      message: `Loan of ${amount} STSH applied successfully!`,
      loanAmount: user.loan,
      status: "SUCCESS",
    });
  } catch (error) {
    console.error("🔥 Loan application error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ==========================
// Fetch the user's active loan
// ==========================
app.get("/loan/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    const activeLoan = await Loan.findOne({
      userId,
      status: "debt",
    });

    if (!activeLoan) {
      return res.json({
        loan: null,
        message: "No active loan found",
        status: "SUCCESS",
      });
    }

    return res.json({
      loan: activeLoan,
      message: "Active loan retrieved",
      status: "SUCCESS",
    });
  } catch (error) {
    console.error("Error fetching loan:", error);
    return res.status(500).json({
      message: "Server error",
      status: "FAILED",
      error: error.message,
    });
  }
});

// ==========================
// Apply for a new loan
// ==========================
app.post("/loan", async (req, res) => {
  try {
    const { userId, amount, password } = req.body;
    const loanAmount = parseInt(amount);

    if (
      !userId ||
      isNaN(loanAmount) ||
      loanAmount < 100 ||
      loanAmount > 50000 ||
      !password
    ) {
      return res
        .status(400)
        .json({
          message: "Loan amount must be between 100 and 50,000 STSH Tokens.",
          status: "FAILED",
        });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found", status: "FAILED" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Incorrect password", status: "FAILED" });
    }

    // Check if user already has an active ("debt") loan
    const existingLoan = await Loan.findOne({ userId, status: "debt" });
    if (existingLoan) {
      return res.status(400).json({
        message: "You already have an active loan that is not fully paid.",
        status: "FAILED",
      });
    }

    const tax = Math.floor(loanAmount * 0.05);
    const finalLoanAmount = loanAmount - tax;

    const newLoan = new Loan({
      userId,
      amount: loanAmount,
      status: "debt",
      approval: false,
    });

    await newLoan.save();

    return res.json({
      message: `Loan request for ${loanAmount} STSH submitted (Tax: ${tax} STSH). You will receive ${finalLoanAmount} STSH.`,
      loan: newLoan,
      status: "SUCCESS",
    });
  } catch (error) {
    console.error("Loan application error:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
});

// ==========================
// Admin approving loans
// ==========================
app.put("/loan/approve/:loanId", async (req, res) => {
  try {
    const { loanId } = req.params;
    const loan = await Loan.findById(loanId);

    if (!loan) {
      return res
        .status(404)
        .json({ message: "Loan not found", status: "FAILED" });
    }

    if (loan.approval) {
      return res
        .status(400)
        .json({ message: "Loan is already approved", status: "FAILED" });
    }

    const user = await User.findById(loan.userId);
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found", status: "FAILED" });
    }

    const tax = Math.floor(loan.amount * 0.05);
    const netAmount = loan.amount - tax;

    loan.approval = true;
    await loan.save();

    user.stshToken += netAmount;
    await user.save();

    const taxRecord = new CollectedTax({
      userId: user._id,
      email: user.email,
      method: "loan",
      taxCollected: tax,
      transactionAmount: loan.amount,
    });

    await taxRecord.save();

    return res.json({
      message: `Loan approved! User receives ${netAmount} STSH (Tax: ${tax} STSH). Debt remains ${loan.amount} STSH.`,
      status: "SUCCESS",
      loan,
      updatedUser: {
        _id: user._id,
        name: user.name,
        email: user.email,
        stshToken: user.stshToken,
        loanDebt: loan.amount,
      },
    });
  } catch (error) {
    console.error("Loan approval error:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
});

// ==========================
// Pay off the loan
// Sets status to "paid" and subtract tokens from user
// ==========================
app.put("/loan/pay/:loanId", async (req, res) => {
  try {
    const { loanId } = req.params;
    const { userId, paymentAmount, password } = req.body;

    if (
      !loanId ||
      !userId ||
      !paymentAmount ||
      paymentAmount <= 0 ||
      !password
    ) {
      return res
        .status(400)
        .json({ message: "Invalid input", status: "FAILED" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found", status: "FAILED" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Incorrect password", status: "FAILED" });
    }

    const loan = await Loan.findById(loanId);
    if (!loan) {
      return res
        .status(404)
        .json({ message: "Loan not found", status: "FAILED" });
    }

    if (loan.status === "paid") {
      return res
        .status(400)
        .json({ message: "Loan is already paid", status: "FAILED" });
    }

    if (user.stshToken < paymentAmount) {
      return res
        .status(400)
        .json({ message: "Not enough STSH to pay loan", status: "FAILED" });
    }

    user.stshToken -= paymentAmount;
    loan.amount -= paymentAmount;

    // If fully paid, mark loan as "paid"
    if (loan.amount <= 0) {
      loan.status = "paid";
      loan.amount = 0;
    }

    await user.save();
    await loan.save();

    return res.json({
      message: "Loan paid off successfully",
      status: "SUCCESS",
      loan,
      updatedUser: {
        _id: user._id,
        name: user.name,
        email: user.email,
        stshToken: user.stshToken,
        loan: loan.amount,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      status: "FAILED",
      error: error.message,
    });
  }
});

// ==========================
// Fetch All Loans
// ==========================
app.get("/loans", async (req, res) => {
  try {
    const loans = await Loan.find().populate("userId", "name email");
    res.json({ loans });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ==========================
// Promote or Demote User (Only for SuperAdmin)
// ==========================
app.put("/user/role/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { newRole, requesterId } = req.body;

    // Validate input
    if (!userId || !newRole || !requesterId) {
      return res.status(400).json({
        message: "Missing required fields",
        status: "FAILED",
      });
    }

    // Find the requester (who is trying to promote/demote)
    const requester = await User.findById(requesterId);
    if (!requester || requester.role !== "superAdmin") {
      return res.status(403).json({
        message: "Unauthorized. Only superAdmins can change roles.",
        status: "FAILED",
      });
    }

    // Find the target user
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found", status: "FAILED" });
    }

    // Prevent changing another superAdmin's role
    if (user.role === "superAdmin") {
      return res.status(403).json({
        message: "You cannot modify another superAdmin's role.",
        status: "FAILED",
      });
    }

    // Only allow valid role changes
    const validRoles = ["user", "admin"];
    if (!validRoles.includes(newRole)) {
      return res.status(400).json({
        message: "Invalid role. Allowed roles: 'user', 'admin'.",
        status: "FAILED",
      });
    }

    // Update role
    user.role = newRole;
    await user.save();

    return res.json({
      message: `User promoted to ${newRole} successfully!`,
      status: "SUCCESS",
      updatedUser: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Role update error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ==========================
// Filter Users by Loan, STSH Token, Email, or ID
// ==========================
app.get("/users/filter", async (req, res) => {
  try {
    const {
      loanMin,
      loanMax,
      stshMin,
      stshMax,
      totalMin,
      totalMax,
      email,
      id,
    } = req.query;

    let matchCriteria = {};

    if (stshMin || stshMax) {
      matchCriteria.stshToken = {};
      if (stshMin) matchCriteria.stshToken.$gte = parseInt(stshMin);
      if (stshMax) matchCriteria.stshToken.$lte = parseInt(stshMax);
    }

    if (totalMin || totalMax) {
      matchCriteria.$expr = {};
      let conditions = [];

      if (totalMin)
        conditions.push({
          $gte: [{ $add: ["$stshToken", "$loan"] }, parseInt(totalMin)],
        });
      if (totalMax)
        conditions.push({
          $lte: [{ $add: ["$stshToken", "$loan"] }, parseInt(totalMax)],
        });

      matchCriteria.$expr = { $and: conditions };
    }

    if (email) {
      matchCriteria.email = { $regex: email, $options: "i" };
    }

    if (id) {
      matchCriteria._id = id;
    }

    const users = await User.aggregate([
      { $match: matchCriteria },
      {
        $lookup: {
          from: "loans",
          localField: "_id",
          foreignField: "userId",
          as: "userLoans",
        },
      },
      {
        $addFields: {
          loan: {
            $sum: {
              $map: {
                input: "$userLoans",
                as: "loan",
                in: {
                  $cond: [
                    { $eq: ["$$loan.status", "debt"] },
                    "$$loan.amount",
                    0,
                  ],
                },
              },
            },
          },
        },
      },
      {
        $match:
          loanMin || loanMax
            ? {
                loan: {
                  ...(loanMin && { $gte: parseInt(loanMin) }),
                  ...(loanMax && { $lte: parseInt(loanMax) }),
                },
              }
            : {},
      },
      {
        $project: {
          password: 0,
          userLoans: 0,
        },
      },
    ]);

    res.json({ users });
  } catch (error) {
    console.error("Error filtering users:", error);
    res
      .status(500)
      .json({
        message: "Server error",
        status: "FAILED",
        error: error.message,
      });
  }
});

// ==========================
// Submit a New Agriculture Request
// ==========================
app.post("/requests", async (req, res) => {
  try {
    const {
      userId,
      seedType,
      seedAmount,
      dirtType,
      dirtAmount,
      address,
      totalPrice,
    } = req.body;

    if (
      !userId ||
      !seedType ||
      !seedAmount ||
      !dirtType ||
      !dirtAmount ||
      !address
    ) {
      return res
        .status(400)
        .json({ message: "All fields are required.", status: "FAILED" });
    }

    const parsedSeedAmount = parseFloat(seedAmount);
    const parsedDirtAmount = parseFloat(dirtAmount);

    if (
      isNaN(parsedSeedAmount) ||
      isNaN(parsedDirtAmount) ||
      parsedSeedAmount <= 0 ||
      parsedDirtAmount <= 0
    ) {
      return res
        .status(400)
        .json({
          message:
            "Seed and Dirt amounts must be valid numbers greater than 0.",
          status: "FAILED",
        });
    }

    const newRequest = new Request({
      userId,
      seedType,
      seedAmount: parsedSeedAmount,
      dirtType,
      dirtAmount: parsedDirtAmount,
      address,
      totalPrice: 0,
    });

    await newRequest.save();

    res
      .status(201)
      .json({
        message: "Request submitted successfully",
        status: "SUCCESS",
        request: newRequest,
      });
  } catch (error) {
    console.error("Error submitting request:", error);
    res
      .status(500)
      .json({
        message: "Server error",
        status: "FAILED",
        error: error.message,
      });
  }
});

// ==========================
// Fetch All Agriculture Requests
// ==========================
app.get("/requests", async (req, res) => {
  try {
    const requests = await Request.find().populate("userId", "name email");

    res.json({ requests });
  } catch (error) {
    console.error("Error fetching requests:", error);
    res
      .status(500)
      .json({
        message: "Server error",
        status: "FAILED",
        error: error.message,
      });
  }
});

// ==========================
// Fetch Requests by User ID
// ==========================
app.get("/requests/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const userRequests = await Request.find({ userId })
      .sort({ timestamp: -1 })
      .populate("userId", "name email");

    res.json({ requests: userRequests });
  } catch (error) {
    console.error("Error fetching user requests:", error);
    res
      .status(500)
      .json({
        message: "Server error",
        status: "FAILED",
        error: error.message,
      });
  }
});

// ==========================
// Update or Approve an Agriculture Request
// ==========================
app.put("/requests/:requestId", async (req, res) => {
  try {
    const { requestId } = req.params;
    let {
      seedType,
      seedAmount,
      dirtType,
      dirtAmount,
      address,
      status,
      totalPrice,
      approval,
    } = req.body;

    const validStatuses = ["pending", "approved", "rejected"];
    if (status && !validStatuses.includes(status)) {
      return res
        .status(400)
        .json({
          message: "Invalid status. Use 'approved' instead of 'accepted'",
          status: "FAILED",
        });
    }

    const updatedData = {};
    if (seedType) updatedData.seedType = seedType;
    if (seedAmount) updatedData.seedAmount = parseFloat(seedAmount);
    if (dirtType) updatedData.dirtType = dirtType;
    if (dirtAmount) updatedData.dirtAmount = parseFloat(dirtAmount);
    if (address) updatedData.address = address;
    if (status) updatedData.status = status;
    if (approval !== undefined) updatedData.approval = approval;

    if (totalPrice !== undefined) {
      totalPrice = parseFloat(totalPrice);
      if (isNaN(totalPrice) || totalPrice < 0) {
        return res
          .status(400)
          .json({
            message: "Invalid totalPrice. Must be a positive number.",
            status: "FAILED",
          });
      }
      updatedData.totalPrice = totalPrice;
    }

    const request = await Request.findById(requestId);
    if (!request) {
      return res
        .status(404)
        .json({ message: "Request not found", status: "FAILED" });
    }

    Object.assign(request, updatedData);

    if (totalPrice !== undefined) request.markModified("totalPrice");

    await request.save();

    res.json({
      message: "Request updated successfully",
      status: "SUCCESS",
      request,
    });
  } catch (error) {
    console.error("🔴 Error updating request:", error);
    res
      .status(500)
      .json({
        message: "Server error",
        status: "FAILED",
        error: error.message,
      });
  }
});

// ==========================
// Delete a Request
// ==========================
app.delete("/requests/:requestId", async (req, res) => {
  try {
    const { requestId } = req.params;
    const request = await Request.findByIdAndDelete(requestId);

    if (!request) {
      return res
        .status(404)
        .json({ message: "Request not found", status: "FAILED" });
    }

    res.json({ message: "Request deleted successfully", status: "SUCCESS" });
  } catch (error) {
    console.error("Error deleting request:", error);
    res
      .status(500)
      .json({
        message: "Server error",
        status: "FAILED",
        error: error.message,
      });
  }
});

// ==========================
// Pay for an Agriculture Request
// ==========================
app.put("/requests/:requestId/pay", async (req, res) => {
  try {
    const { requestId } = req.params;
    const { userId, password } = req.body;

    if (!userId || !password) {
      return res
        .status(400)
        .json({
          message: "User ID and password are required.",
          status: "FAILED",
        });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found", status: "FAILED" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Incorrect password", status: "FAILED" });
    }

    const request = await Request.findById(requestId);
    if (!request) {
      return res
        .status(404)
        .json({ message: "Request not found", status: "FAILED" });
    }

    if (request.status !== "approved" || request.approval) {
      return res
        .status(400)
        .json({
          message: "Request is not eligible for payment",
          status: "FAILED",
        });
    }

    if (user.stshToken < request.totalPrice) {
      return res
        .status(400)
        .json({ message: "Insufficient balance", status: "FAILED" });
    }

    user.stshToken -= request.totalPrice;

    request.approval = true;

    await user.save();
    await request.save();

    res.json({
      message: "Payment successful!",
      status: "SUCCESS",
      updatedUser: { stshToken: user.stshToken },
      updatedRequest: request,
    });
  } catch (error) {
    console.error("Payment error:", error);
    res
      .status(500)
      .json({
        message: "Server error",
        status: "FAILED",
        error: error.message,
      });
  }
});

// ==========================
// Insurance Subscribtion
// ==========================
app.post("/subscribe", async (req, res) => {
  try {
    const { userId, email, insuranceType, planType, price, tax, password } =
      req.body;

    if (
      !userId ||
      !email ||
      !insuranceType ||
      !planType ||
      !price ||
      !password
    ) {
      return res
        .status(400)
        .json({ message: "Missing required fields", status: "FAILED" });
    }

    const user = await User.findById(userId);
    if (!user)
      return res
        .status(404)
        .json({ message: "User not found", status: "FAILED" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Incorrect password", status: "FAILED" });
    }

    const totalCost = price + tax;
    if (user.stshToken < totalCost)
      return res
        .status(400)
        .json({ message: "Insufficient balance", status: "FAILED" });

    const alreadySubscribed = await Subscription.findOne({
      userId,
      insuranceType,
    });

    if (alreadySubscribed)
      return res
        .status(400)
        .json({
          message: "You are already subscribed to this type of insurance.",
          status: "FAILED",
        });

    user.stshToken -= totalCost;
    await user.save();

    // Save tax
    await new CollectedTax({
      userId,
      email,
      method: "insurance",
      taxCollected: tax,
      transactionAmount: price,
    }).save();

    // Save subscription
    await new Subscription({
      userId,
      email,
      insuranceType,
      planType,
      price,
      tax,
    }).save();

    res.json({ message: "Subscription successful", status: "SUCCESS" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

app.get("/subscriptions/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const subscriptions = await Subscription.find({ userId }).sort({
      createdAt: -1,
    });
    res.json({ subscriptions });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

app.put("/subscriptions/:id/toggleRecurring", async (req, res) => {
  try {
    const { id } = req.params;
    const subscription = await Subscription.findById(id);

    if (!subscription) {
      return res.status(404).json({ message: "Subscription not found" });
    }

    subscription.recurring = !subscription.recurring;
    await subscription.save();

    res.json({ message: "Recurring updated", subscription });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ==========================
// Remove Insurance Subscribtion
// ==========================
cron.schedule("0 0 * * *", () => {
  cleanupExpiredSubscriptions();
});

const cleanupExpiredSubscriptions = async () => {
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  const expiredSubscriptions = await Subscription.find({
    createdAt: { $lt: oneMonthAgo },
    recurring: true,
  });

  let renewedCount = 0;

  for (const sub of expiredSubscriptions) {
    const user = await User.findById(sub.userId);
    if (!user) continue;
    const totalCost = sub.price + sub.tax;

    if (user.stshToken < totalCost) {
      await Notification.create({
        userId: user._id,
        title: "Renewal Failed ❌",
        message: `Your recurring subscription for ${sub.insuranceType} (${sub.planType}) could not be renewed due to insufficient tokens.`,
      });
      continue;
    }

    user.stshToken -= totalCost;
    await user.save();

    await new Subscription({
      userId: sub.userId,
      email: sub.email,
      insuranceType: sub.insuranceType,
      planType: sub.planType,
      price: sub.price,
      tax: sub.tax,
      recurring: true,
    }).save();

    await new CollectedTax({
      userId: sub.userId,
      email: sub.email,
      method: "insurance",
      taxCollected: sub.tax,
      transactionAmount: sub.price,
    }).save();

    await Subscription.findByIdAndDelete(sub._id);

    await Notification.create({
      userId: user._id,
      title: "Subscription Renewed ✅",
      message: `Your ${sub.insuranceType} (${sub.planType}) subscription has been successfully renewed.`,
    });

    renewedCount++;
  }

  console.log(`Renewed ${renewedCount} recurring subscriptions.`);
};

// ==========================
// Cancel Subscription
// ==========================
app.put("/subscriptions/:id/cancel", async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, password } = req.body;

    if (!userId || !password) {
      return res
        .status(400)
        .json({ message: "User ID and password required", status: "FAILED" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found", status: "FAILED" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Incorrect password", status: "FAILED" });
    }

    const subscription = await Subscription.findById(id);
    if (!subscription) {
      return res
        .status(404)
        .json({ message: "Subscription not found", status: "FAILED" });
    }

    if (!subscription.userId.equals(user._id)) {
      return res
        .status(403)
        .json({
          message: "Unauthorized to cancel this subscription",
          status: "FAILED",
        });
    }

    await Subscription.findByIdAndDelete(id);

    res.json({ message: "Subscription cancelled", status: "SUCCESS" });
  } catch (err) {
    console.error("❌ Cancel subscription error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ==========================
// Notification
// ==========================
app.get("/notifications/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const notifications = await Notification.find({ userId }).sort({
      createdAt: -1,
    });
    res.json({ notifications });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

const sendSubscriptionReminders = async () => {
  const now = new Date();
  const threeDaysFromNow = new Date(now);
  threeDaysFromNow.setDate(now.getDate() - 27);

  const subscriptions = await Subscription.find({
    createdAt: { $lte: threeDaysFromNow },
    recurring: true,
  });

  for (const sub of subscriptions) {
    await Notification.create({
      userId: sub.userId,
      title: "Subscription Reminder",
      message: `Your ${sub.insuranceType} (${sub.planType}) subscription will expire in 3 days.`,
    });
  }

  console.log(
    `🔔 Sent ${subscriptions.length} subscription reminder notifications.`
  );
};

cron.schedule("0 9 * * *", () => {
  sendSubscriptionReminders().catch((err) =>
    console.error("Reminder error:", err)
  );
});

app.put("/notifications/:id/seen", async (req, res) => {
  try {
    const { id } = req.params;
    await Notification.findByIdAndUpdate(id, { seen: true });
    res.json({ message: "Marked as seen", status: "SUCCESS" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

app.delete("/notifications/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await Notification.findByIdAndDelete(id);
    res.json({ message: "Notification deleted", status: "SUCCESS" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ==========================
// Top Up
// ==========================
app.post("/topup", async (req, res) => {
  try {
    const { userId, amount, password } = req.body;

    const parsedAmount = parseInt(amount);
    if (!userId || !amount || !password || isNaN(parsedAmount)) {
      return res.status(400).json({ message: "Missing or invalid fields", status: "FAILED" });
    }

    if (parsedAmount < 10 || parsedAmount > 1000) {
      return res.status(400).json({ message: "Amount must be between 10 and 1000 tokens", status: "FAILED" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found", status: "FAILED" });

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Incorrect password", status: "FAILED" });
    }

    user.stshToken += parsedAmount;
    await user.save();

    const transaction = new Transaction({
      senderId: userId,
      recipientId: userId,
      amount: parsedAmount,
      type: "topup",
    });
    await transaction.save();

    await Notification.create({
      userId: userId,
      title: "Top Up Successful 🎉",
      message: `You successfully topped up ${parsedAmount} STSH Token! 🎉🎉🎉`,
    });

    res.json({
      message: `Top-up of ${parsedAmount} STSH successful`,
      status: "SUCCESS",
      newBalance: user.stshToken,
    });

  } catch (err) {
    console.error("Top-up error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});
