const express = require("express");
const router = express.Router();
const Media = require("../models/Media");
const verifyToken = require("../middleware/authMiddleware");
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");

// Configure multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });

// 1. Get All Media Files
router.get("/", verifyToken, async (req, res) => {
  try {
    const mediaFiles = await Media.find().sort({ createdAt: -1 });
    res
      .status(200)
      .json({ status: "success", count: mediaFiles.length, mediaFiles });
  } catch (err) {
    console.error("[Fetch Media Error]:", err.message);
    res
      .status(500)
      .json({
        status: "error",
        message: "Server error while fetching media library.",
      });
  }
});

// 2. Upload Image File -> Send to ImgBB -> Save to MongoDB
router.post(
  "/upload",
  verifyToken,
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res
          .status(400)
          .json({
            status: "error",
            message: "Please select an image file to upload.",
          });
      }

      const { title, duration } = req.body;

      // Convert buffer to base64 for ImgBB API
      const base64Image = req.file.buffer.toString("base64");
      const formData = new FormData();
      formData.append("image", base64Image);

      // Replace with your ImgBB API Key or use environment variable
      const IMGBB_API_KEY =
        process.env.IMGBB_API_KEY || "your_imgbb_api_key_here";

      const imgbbRes = await axios.post(
        `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
        formData,
        {
          headers: { ...formData.getHeaders() },
        },
      );

      if (!imgbbRes.data || !imgbbRes.data.success) {
        return res
          .status(500)
          .json({
            status: "error",
            message: "Failed to upload image to ImgBB cloud.",
          });
      }

      const imageData = imgbbRes.data.data;

      const newMedia = new Media({
        title: title || req.file.originalname,
        fileName: req.file.originalname,
        fileUrl: imageData.url,
        deleteUrl: imageData.delete_url,
        fileSize: req.file.size,
        duration: duration ? Number(duration) : 10,
        uploadedBy: req.user.id,
      });

      await newMedia.save();

      res.status(201).json({
        status: "success",
        message: "Media uploaded to ImgBB cloud and saved successfully.",
        media: newMedia,
      });
    } catch (err) {
      console.error("[Media Upload Error]:", err.message);
      res
        .status(500)
        .json({
          status: "error",
          message: err.message || "Server error during media upload.",
        });
    }
  },
);

// 3. Edit / Update Media Asset Details (Title / Duration)
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const { title, duration } = req.body;

    const updatedMedia = await Media.findByIdAndUpdate(
      req.params.id,
      {
        ...(title && { title }),
        ...(duration !== undefined && { duration }),
      },
      { new: true, runValidators: true },
    );

    if (!updatedMedia) {
      return res
        .status(404)
        .json({ status: "error", message: "Media asset not found." });
    }

    res
      .status(200)
      .json({
        status: "success",
        message: "Media asset updated successfully.",
        media: updatedMedia,
      });
  } catch (err) {
    console.error("[Update Media Error]:", err.message);
    res
      .status(500)
      .json({
        status: "error",
        message: "Server error while updating media asset.",
      });
  }
});

// 4. Delete Media Asset
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const deletedMedia = await Media.findByIdAndDelete(req.params.id);
    if (!deletedMedia) {
      return res
        .status(404)
        .json({ status: "error", message: "Media asset not found." });
    }

    res
      .status(200)
      .json({
        status: "success",
        message: "Media asset deleted successfully.",
      });
  } catch (err) {
    console.error("[Delete Media Error]:", err.message);
    res
      .status(500)
      .json({ status: "error", message: "Server error while deleting media." });
  }
});

module.exports = router;
