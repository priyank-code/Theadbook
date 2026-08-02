const express = require("express");
const router = express.Router();
const Campaign = require("../models/Campaign");
const verifyToken = require("../middleware/authMiddleware");

// Get All Campaigns with Populated Client Info
router.get("/", verifyToken, async (req, res) => {
  try {
    const campaigns = await Campaign.find()
      .populate("clientId", "clientName companyName email phone")
      .sort({ createdAt: -1 });
    res
      .status(200)
      .json({ status: "success", count: campaigns.length, campaigns });
  } catch (err) {
    res
      .status(500)
      .json({
        status: "error",
        message: "Server error while fetching campaigns.",
      });
  }
});

// Create New Campaign with Client Relation
router.post("/create", verifyToken, async (req, res) => {
  try {
    const {
      campaignName,
      clientId,
      clientName,
      screenName,
      creativeName,
      budget,
      startDate,
      endDate,
      status,
    } = req.body;

    if (
      !campaignName ||
      !clientId ||
      !screenName ||
      !creativeName ||
      !startDate ||
      !endDate
    ) {
      return res
        .status(400)
        .json({
          status: "error",
          message:
            "Please provide campaign name, client, screen, creative, and dates.",
        });
    }

    const newCampaign = new Campaign({
      campaignName,
      clientId,
      clientName,
      screenName,
      creativeName,
      budget: budget || 0,
      startDate,
      endDate,
      status: status || "Active",
    });

    await newCampaign.save();
    res
      .status(201)
      .json({
        status: "success",
        message: "Campaign created successfully.",
        campaign: newCampaign,
      });
  } catch (err) {
    console.error("[Create Campaign Error]:", err.message);
    res
      .status(500)
      .json({
        status: "error",
        message: "Server error while creating campaign.",
      });
  }
});

// Edit Campaign
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const {
      campaignName,
      clientId,
      clientName,
      screenName,
      creativeName,
      budget,
      startDate,
      endDate,
      status,
    } = req.body;

    const updatedCampaign = await Campaign.findByIdAndUpdate(
      req.params.id,
      {
        ...(campaignName && { campaignName }),
        ...(clientId && { clientId }),
        ...(clientName && { clientName }),
        ...(screenName && { screenName }),
        ...(creativeName && { creativeName }),
        ...(budget !== undefined && { budget }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
        ...(status && { status }),
      },
      { new: true, runValidators: true },
    );

    if (!updatedCampaign) {
      return res
        .status(404)
        .json({ status: "error", message: "Campaign not found." });
    }

    res
      .status(200)
      .json({
        status: "success",
        message: "Campaign updated successfully.",
        campaign: updatedCampaign,
      });
  } catch (err) {
    console.error("[Update Campaign Error]:", err.message);
    res
      .status(500)
      .json({
        status: "error",
        message: err.message || "Server error while updating campaign.",
      });
  }
});

// Delete Campaign
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const deletedCampaign = await Campaign.findByIdAndDelete(req.params.id);
    if (!deletedCampaign) {
      return res
        .status(404)
        .json({ status: "error", message: "Campaign not found." });
    }
    res
      .status(200)
      .json({ status: "success", message: "Campaign deleted successfully." });
  } catch (err) {
    res
      .status(500)
      .json({
        status: "error",
        message: "Server error while deleting campaign.",
      });
  }
});

module.exports = router;
