const express = require("express");
const router = express.Router();
const Alert = require("../models/Alert");
const verifyToken = require("../middleware/authMiddleware");

// 1. Get All Alerts
router.get("/", verifyToken, async (req, res) => {
  try {
    const alerts = await Alert.find()
      .populate("deviceId", "deviceName location city status")
      .sort({ createdAt: -1 });
    res.status(200).json({ status: "success", count: alerts.length, alerts });
  } catch (err) {
    console.error("[Fetch Alerts Error]:", err.message);
    res.status(500).json({
      status: "error",
      message: "Server error while fetching alerts.",
    });
  }
});

// 2. Create / Trigger New Alert (For telemetry monitoring)
router.post("/create", verifyToken, async (req, res) => {
  try {
    const { deviceId, alertType, severity, message } = req.body;
    if (!deviceId || !alertType || !message) {
      return res
        .status(400)
        .json({
          status: "error",
          message: "Please provide all required alert details.",
        });
    }

    const newAlert = new Alert({
      deviceId,
      alertType,
      severity: severity || "High",
      message,
    });

    await newAlert.save();
    const populatedAlert = await Alert.findById(newAlert._id).populate(
      "deviceId",
      "deviceName location city status",
    );

    res
      .status(201)
      .json({
        status: "success",
        message: "Alert triggered successfully.",
        alert: populatedAlert,
      });
  } catch (err) {
    res
      .status(500)
      .json({ status: "error", message: "Server error while creating alert." });
  }
});

// 3. Mark Alert as Resolved
router.put("/resolve/:id", verifyToken, async (req, res) => {
  try {
    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      { isResolved: true },
      { new: true },
    ).populate("deviceId", "deviceName location city status");

    if (!alert)
      return res
        .status(404)
        .json({ status: "error", message: "Alert not found." });

    res
      .status(200)
      .json({ status: "success", message: "Alert marked as resolved.", alert });
  } catch (err) {
    res
      .status(500)
      .json({
        status: "error",
        message: "Server error while resolving alert.",
      });
  }
});

// 4. Delete Alert
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const deleted = await Alert.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res
        .status(404)
        .json({ status: "error", message: "Alert not found." });
    res
      .status(200)
      .json({ status: "success", message: "Alert deleted successfully." });
  } catch (err) {
    res
      .status(500)
      .json({ status: "error", message: "Server error while deleting alert." });
  }
});

module.exports = router;
