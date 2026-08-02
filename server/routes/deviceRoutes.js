const express = require("express");
const router = express.Router();
const Device = require("../models/Device");
const jwt = require("jsonwebtoken");
const verifyToken = require("../middleware/authMiddleware");

// 1. Get All Devices (Screens Fleet)
router.get("/", verifyToken, async (req, res) => {
  try {
    const devices = await Device.find().sort({ createdAt: -1 });
    res.status(200).json({
      status: "success",
      count: devices.length,
      devices,
    });
  } catch (err) {
    console.error("[Fetch Devices Error]:", err.message);
    res
      .status(500)
      .json({
        status: "error",
        message: "Server error while fetching screens.",
      });
  }
});

// 2. Register / Add New Screen Device
router.post("/add", verifyToken, async (req, res) => {
  try {
    const {
      deviceName,
      deviceCode,
      location,
      city,
      screenType,
      resolution,
      status,
    } = req.body;

    if (!deviceName || !deviceCode || !location || !city) {
      return res
        .status(400)
        .json({
          status: "error",
          message: "Please provide device name, code, location, and city.",
        });
    }

    const existingDevice = await Device.findOne({
      deviceCode: deviceCode.toUpperCase(),
    });
    if (existingDevice) {
      return res
        .status(400)
        .json({
          status: "error",
          message: "Device with this pairing code already exists.",
        });
    }

    const newDevice = new Device({
      deviceName,
      deviceCode: deviceCode.toUpperCase(),
      location,
      city,
      screenType: screenType || "LED Billboard",
      resolution: resolution || "1920x1080",
      status: status || "Offline", // <-- Ab ye frontend se bheja gaya status accept karega!
    });

    await newDevice.save();

    res.status(201).json({
      status: "success",
      message: "Screen registered successfully.",
      device: newDevice,
    });
  } catch (err) {
    console.error("[Add Device Error]:", err.message);
    res
      .status(500)
      .json({
        status: "error",
        message: "Server error during screen registration.",
      });
  }
});

// 3. Update Screen Status or Playlist Assignment
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const {
      deviceName,
      location,
      city,
      status,
      screenType,
      resolution,
      assignedPlaylist,
    } = req.body;

    const updatedDevice = await Device.findByIdAndUpdate(
      req.params.id,
      {
        ...(deviceName && { deviceName }),
        ...(location && { location }),
        ...(city && { city }),
        ...(status && { status }),
        ...(screenType && { screenType }),
        ...(resolution && { resolution }),
        ...(assignedPlaylist !== undefined && { assignedPlaylist }),
      },
      { new: true, runValidators: true },
    );

    if (!updatedDevice) {
      return res
        .status(404)
        .json({ status: "error", message: "Screen device not found." });
    }

    res.status(200).json({
      status: "success",
      message: "Screen updated successfully.",
      device: updatedDevice,
    });
  } catch (err) {
    console.error("[Update Device Error]:", err.message);
    res
      .status(500)
      .json({
        status: "error",
        message: "Server error while updating screen.",
      });
  }
});

// 4. Delete Screen Device
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const deletedDevice = await Device.findByIdAndDelete(req.params.id);
    if (!deletedDevice) {
      return res
        .status(404)
        .json({ status: "error", message: "Screen device not found." });
    }

    res.status(200).json({
      status: "success",
      message: "Screen deleted successfully.",
    });
  } catch (err) {
    console.error("[Delete Device Error]:", err.message);
    res
      .status(500)
      .json({
        status: "error",
        message: "Server error while deleting screen.",
      });
  }
});

module.exports = router;
