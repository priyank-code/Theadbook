const mongoose = require("mongoose");

const reportLogSchema = new mongoose.Schema(
  {
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campaign",
    },
    campaignName: {
      type: String,
      required: true,
      trim: true,
    },
    clientName: {
      type: String,
      required: true,
      trim: true,
    },
    screenName: {
      type: String,
      required: true,
      trim: true,
    },
    eventType: {
      type: String,
      enum: ["Campaign Launched", "Heartbeat", "Schedule Sync", "Error"],
      default: "Campaign Launched",
    },
    budget: {
      type: Number,
      default: 0,
    },
    message: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Success", "Warning", "Error"],
      default: "Success",
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("ReportLog", reportLogSchema);
