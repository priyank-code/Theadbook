const express = require("express");
const router = express.Router();
const Schedule = require("../models/Schedule");
const verifyToken = require("../middleware/authMiddleware");

// 1. Get All Schedules
router.get("/", verifyToken, async (req, res) => {
  try {
    const schedules = await Schedule.find()
      .populate("deviceId", "deviceName location city")
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: "success",
      count: schedules.length,
      schedules,
    });
  } catch (err) {
    console.error("[Fetch Schedules Error]:", err.message);
    res.status(500).json({
      status: "error",
      message: "Server error while fetching schedules.",
    });
  }
});

// 2. Create New Schedule
router.post("/create", verifyToken, async (req, res) => {
  try {
    const {
      scheduleName,
      deviceId,
      creativeName,
      startDate,
      endDate,
      startTime,
      endTime,
    } = req.body;

    if (
      !scheduleName ||
      !deviceId ||
      !creativeName ||
      !startDate ||
      !endDate ||
      !startTime ||
      !endTime
    ) {
      return res.status(400).json({
        status: "error",
        message: "Please provide all required schedule details.",
      });
    }

    const newSchedule = new Schedule({
      scheduleName,
      deviceId,
      creativeName,
      startDate,
      endDate,
      startTime,
      endTime,
      createdBy: req.user.id,
    });

    await newSchedule.save();

    const populatedSchedule = await Schedule.findById(newSchedule._id).populate(
      "deviceId",
      "deviceName location city",
    );

    res.status(201).json({
      status: "success",
      message: "Schedule created successfully.",
      schedule: populatedSchedule,
    });
  } catch (err) {
    console.error("[Create Schedule Error]:", err.message);
    res.status(500).json({
      status: "error",
      message: "Server error while creating schedule.",
    });
  }
});

// 3. Edit / Update Schedule
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const {
      scheduleName,
      deviceId,
      creativeName,
      startDate,
      endDate,
      startTime,
      endTime,
      status,
    } = req.body;

    const updatedSchedule = await Schedule.findByIdAndUpdate(
      req.params.id,
      {
        ...(scheduleName && { scheduleName }),
        ...(deviceId && { deviceId }),
        ...(creativeName && { creativeName }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
        ...(startTime && { startTime }),
        ...(endTime && { endTime }),
        ...(status && { status }),
      },
      { new: true, runValidators: true },
    ).populate("deviceId", "deviceName location city");

    if (!updatedSchedule) {
      return res
        .status(404)
        .json({ status: "error", message: "Schedule not found." });
    }

    res.status(200).json({
      status: "success",
      message: "Schedule updated successfully.",
      schedule: updatedSchedule,
    });
  } catch (err) {
    console.error("[Update Schedule Error]:", err.message);
    res.status(500).json({
      status: "error",
      message: err.message || "Server error while updating schedule.",
    });
  }
});

// 4. Delete Schedule
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const deletedSchedule = await Schedule.findByIdAndDelete(req.params.id);
    if (!deletedSchedule) {
      return res
        .status(404)
        .json({ status: "error", message: "Schedule not found." });
    }

    res.status(200).json({
      status: "success",
      message: "Schedule deleted successfully.",
    });
  } catch (err) {
    console.error("[Delete Schedule Error]:", err.message);
    res.status(500).json({
      status: "error",
      message: "Server error while deleting schedule.",
    });
  }
});

module.exports = router;
