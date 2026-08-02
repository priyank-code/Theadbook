const mongoose = require("mongoose");

const mediaSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Media title is required"],
      trim: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    fileUrl: {
      type: String,
      required: [true, "Cloud file URL is required"],
    },
    deleteUrl: {
      type: String, // ImgBB deletion link if needed
    },
    fileType: {
      type: String,
      enum: ["image", "video"],
      default: "image",
    },
    fileSize: {
      type: Number,
      default: 0,
    },
    duration: {
      type: Number, // Display duration in seconds on billboard screen
      default: 10,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Media", mediaSchema);
