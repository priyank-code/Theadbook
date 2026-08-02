const mongoose = require("mongoose");

const scheduleSchema = new mongoose.Schema(
  {
    scheduleName: {
      type: String,
      required: [true, "Schedule name is required"],
      trim: true,
    },
    deviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Device",
      required: [true, "Target screen device is required"],
    },
    creativeName: {
      type: String,
      required: [true, "Creative media file is required"],
      trim: true,
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: Date,
      required: [true, "End date is required"],
    },
    startTime: {
      type: String, // e.g., "08:00"
      required: true,
    },
    endTime: {
      type: String, // e.g., "22:00"
      required: true,
    },
    status: {
      type: String,
      enum: ["Active", "Paused", "Expired"],
      default: "Active",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

scheduleSchema.index({ deviceId: 1, startDate: 1, endDate: 1 });

module.exports = mongoose.model("Schedule", scheduleSchema);
