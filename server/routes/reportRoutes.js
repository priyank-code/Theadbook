const express = require("express");
const router = express.Router();
const ReportLog = require("../models/ReportLog");
const verifyToken = require("../middleware/authMiddleware");

// Get Reports with Optional Date Range Filtering
router.get("/", verifyToken, async (req, res) => {
  try {
    const { startDate, endDate, eventType } = req.query;
    let query = {};

    if (startDate && endDate) {
      query.timestamp = {
        $gte: new Date(startDate),
        $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)),
      };
    }

    if (eventType && eventType !== "All") {
      query.eventType = eventType;
    }

    const logs = await ReportLog.find(query).sort({ timestamp: -1 });

    const totalRevenue = logs.reduce(
      (acc, curr) => acc + (curr.budget || 0),
      0,
    );
    const successCount = logs.filter((l) => l.status === "Success").length;
    const fleetUptime =
      logs.length > 0
        ? ((successCount / logs.length) * 100).toFixed(1)
        : "99.4";

    res.status(200).json({
      status: "success",
      count: logs.length,
      metrics: {
        fleetUptime: `${fleetUptime}%`,
        totalRevenue,
        warningsCount: logs.filter(
          (l) => l.status === "Warning" || l.status === "Error",
        ).length,
      },
      logs,
    });
  } catch (err) {
    console.error("[Fetch Reports Error]:", err.message);
    res
      .status(500)
      .json({
        status: "error",
        message: "Server error while fetching reports.",
      });
  }
});

// Create Report Log
router.post("/create", verifyToken, async (req, res) => {
  try {
    const {
      campaignName,
      clientName,
      screenName,
      eventType,
      budget,
      message,
      status,
    } = req.body;

    const newLog = new ReportLog({
      campaignName,
      clientName,
      screenName,
      eventType: eventType || "Campaign Launched",
      budget: budget || 0,
      message: message || "Campaign executed successfully.",
      status: status || "Success",
    });

    await newLog.save();
    res
      .status(201)
      .json({ status: "success", message: "Report log saved.", log: newLog });
  } catch (err) {
    console.error("[Create Report Log Error]:", err.message);
    res
      .status(500)
      .json({ status: "error", message: "Server error while creating log." });
  }
});

module.exports = router;
