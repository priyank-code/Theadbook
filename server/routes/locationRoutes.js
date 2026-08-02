const express = require("express");
const router = express.Router();
const Location = require("../models/Location");
const verifyToken = require("../middleware/authMiddleware");

router.get("/", verifyToken, async (req, res) => {
  try {
    const locations = await Location.find().sort({ createdAt: -1 });
    res
      .status(200)
      .json({ status: "success", count: locations.length, locations });
  } catch (err) {
    res
      .status(500)
      .json({
        status: "error",
        message: "Server error while fetching locations.",
      });
  }
});

router.post("/create", verifyToken, async (req, res) => {
  try {
    const { locationName, city, zone, address, coordinates } = req.body;
    if (!locationName || !city || !address) {
      return res
        .status(400)
        .json({
          status: "error",
          message: "Location name, city, and address are required.",
        });
    }
    const newLocation = new Location({
      locationName,
      city,
      zone,
      address,
      coordinates,
      createdBy: req.user.id,
    });
    await newLocation.save();
    res
      .status(201)
      .json({
        status: "success",
        message: "Location created successfully.",
        location: newLocation,
      });
  } catch (err) {
    res
      .status(500)
      .json({
        status: "error",
        message: "Server error while creating location.",
      });
  }
});

module.exports = router;
