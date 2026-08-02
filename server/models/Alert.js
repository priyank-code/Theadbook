const mongoose = require("mongoose");

const alertSchema = new mongoose.Schema(
  {
    deviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Device",
      required: true,
    },
    alertType: {
      type: String,
      enum: [
        "Screen Offline",
        "Overheating",
        "Playback Error",
        "Power Failure",
        "Sync Error",
        "Storage Alert",
      ],
      required: true,
    },
    severity: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "High",
    },
    message: { type: String, required: true, trim: true },
    isResolved: { type: Boolean, default: false },
  },
  { timestamps: true },
);

alertSchema.index({ deviceId: 1, isResolved: 1 });
module.exports = mongoose.model("Alert", alertSchema);
