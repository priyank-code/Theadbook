const mongoose = require("mongoose");

const campaignSchema = new mongoose.Schema(
  {
    campaignName: {
      type: String,
      required: [true, "Campaign name is required"],
      trim: true,
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: [true, "Client reference is required"],
    },
    clientName: {
      type: String, // Cached company or client name for fast rendering
      trim: true,
    },
    screenName: {
      type: String,
      required: [true, "Target screen name is required"],
      trim: true,
    },
    creativeName: {
      type: String,
      required: [true, "Creative asset name is required"],
      trim: true,
    },
    budget: {
      type: Number,
      default: 0,
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: Date,
      required: [true, "End date is required"],
    },
    status: {
      type: String,
      enum: ["Scheduled", "Active", "Completed", "Cancelled"],
      default: "Active",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Campaign", campaignSchema);
