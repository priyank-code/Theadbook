const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const verifyToken = require("../middleware/authMiddleware");

// 1. Register Route (Create Staff / Admin Account)
router.post("/register", verifyToken, async (req, res) => {
  try {
    // Optional: Restrict registration only to Super Admin or Admin roles
    if (req.user.role !== "Super Admin" && req.user.role !== "Admin") {
      return res
        .status(403)
        .json({
          status: "error",
          message: "Permission denied. Only Admins can register new users.",
        });
    }

    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({
          status: "error",
          message: "Please provide name, email, and password.",
        });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res
        .status(400)
        .json({
          status: "error",
          message: "User already exists with this email address.",
        });
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role || "Editor",
      status: "Active",
    });

    await newUser.save();

    res.status(201).json({
      status: "success",
      message: "Staff account registered successfully.",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (err) {
    console.error("[Register Error]:", err.message);
    res
      .status(500)
      .json({ status: "error", message: "Server error during registration." });
  }
});

// 2. Login Route (Generate Secure JWT)
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({
          status: "error",
          message: "Please enter both email and password.",
        });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res
        .status(400)
        .json({ status: "error", message: "Invalid email or password." });
    }

    if (user.status !== "Active") {
      return res
        .status(403)
        .json({
          status: "error",
          message: "This account has been deactivated. Contact Super Admin.",
        });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ status: "error", message: "Invalid email or password." });
    }

    // Update last login timestamp
    user.lastLogin = new Date();
    await user.save();

    const tokenPayload = {
      id: user._id,
      email: user.email,
      role: user.role,
    };

    const token = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET || "theadbook_super_secret_jwt_key_2026",
      { expiresIn: "7d" },
    );

    res.status(200).json({
      status: "success",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("[Login Error]:", err.message);
    res
      .status(500)
      .json({
        status: "error",
        message: "Server error during authentication.",
      });
  }
});

// 3. Get Current Logged-in User Profile (Protected Route)
router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res
        .status(404)
        .json({ status: "error", message: "User account not found." });
    }

    res.status(200).json({
      status: "success",
      user,
    });
  } catch (err) {
    console.error("[Fetch Profile Error]:", err.message);
    res
      .status(500)
      .json({
        status: "error",
        message: "Server error while fetching profile.",
      });
  }
});

module.exports = router;
