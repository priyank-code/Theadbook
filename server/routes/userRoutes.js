const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const verifyToken = require("../middleware/authMiddleware");

// 1. Get All Employee Users
router.get("/", verifyToken, async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.status(200).json({ status: "success", count: users.length, users });
  } catch (err) {
    console.error("[Fetch Users Error]:", err.message);
    res.status(500).json({
      status: "error",
      message: "Server error while fetching employee records.",
    });
  }
});

// 2. Add New Employee Account
router.post("/add", verifyToken, async (req, res) => {
  try {
    const { name, email, password, role, status } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({
        status: "error",
        message: "Name, email, and password are required.",
      });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({
        status: "error",
        message: "An employee with this email already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name: name.trim(),
      email: email.trim(),
      password: hashedPassword,
      role: role || "Editor",
      status: status || "Active",
    });

    await newUser.save();

    const userResponse = newUser.toObject();
    delete userResponse.password;

    res.status(201).json({
      status: "success",
      message: "Employee account created successfully.",
      user: userResponse,
    });
  } catch (err) {
    console.error("[Create User Error]:", err.message);
    res.status(500).json({
      status: "error",
      message: err.message || "Server error while adding employee.",
    });
  }
});

// 3. Revoke / Delete Employee Access
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res
        .status(404)
        .json({ status: "error", message: "Employee not found." });
    }
    res
      .status(200)
      .json({
        status: "success",
        message: "Employee access revoked successfully.",
      });
  } catch (err) {
    console.error("[Delete User Error]:", err.message);
    res.status(500).json({
      status: "error",
      message: "Server error while deleting employee.",
    });
  }
});

module.exports = router;
