const express = require("express");
const router = express.Router();
const Device = require("../models/Device");
const Campaign = require("../models/Campaign");
const Client = require("../models/Client");
const Playlist = require("../models/PlayList");
const Alert = require("../models/Alert");
const Billing = require("../models/Billing");
const verifyToken = require("../middleware/authMiddleware");

router.get("/stats", verifyToken, async (req, res) => {
  try {
    const [
      totalScreens,
      onlineScreens,
      totalCampaigns,
      activeCampaigns,
      totalClients,
      totalPlaylists,
      activeAlerts,
      billingData,
    ] = await Promise.all([
      Device.countDocuments(),
      Device.countDocuments({ status: "Online" }),
      Campaign.countDocuments(),
      Campaign.countDocuments({ status: "Active" }),
      Client.countDocuments(),
      Playlist.countDocuments(),
      Alert.countDocuments({ isResolved: false }),
      Billing.aggregate([
        { $match: { paymentStatus: "Paid" } },
        { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } },
      ]),
    ]);

    // Dynamic Slot Calculations based on total active screens (assuming 24 slots per screen as standard)
    const totalSlots = totalScreens * 24;
    const bookedSlots = activeCampaigns * 4; // Estimated mapping per active campaign
    const vacantSlots = Math.max(0, totalSlots - bookedSlots);
    const holdSlots = Math.max(0, totalSlots - (bookedSlots + vacantSlots));

    const totalRevenue =
      billingData.length > 0 ? billingData[0].totalRevenue : 0;

    res.status(200).json({
      status: "success",
      stats: {
        screens: {
          total: totalScreens,
          online: onlineScreens,
          offline: totalScreens - onlineScreens,
        },
        campaigns: {
          total: totalCampaigns,
          active: activeCampaigns,
        },
        clients: totalClients,
        playlists: totalPlaylists,
        alerts: activeAlerts,
        slots: {
          total: totalSlots,
          booked: bookedSlots,
          vacant: vacantSlots,
          hold: holdSlots,
        },
        billing: {
          totalRevenue,
        },
      },
    });
  } catch (err) {
    console.error("[Dashboard Stats Error]:", err.message);
    res
      .status(500)
      .json({
        status: "error",
        message: "Server error while fetching dashboard stats.",
      });
  }
});

module.exports = router;
