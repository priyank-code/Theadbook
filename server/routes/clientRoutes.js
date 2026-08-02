const express = require("express");
const router = express.Router();
const Client = require("../models/Client");
const verifyToken = require("../middleware/authMiddleware");

// 1. Get All Clients
router.get("/", verifyToken, async (req, res) => {
  try {
    const clients = await Client.find().sort({ createdAt: -1 });
    res.status(200).json({
      status: "success",
      count: clients.length,
      clients,
    });
  } catch (err) {
    console.error("[Fetch Clients Error]:", err.message);
    res
      .status(500)
      .json({
        status: "error",
        message: "Server error while fetching clients.",
      });
  }
});

// 2. Add New Client
router.post("/add", verifyToken, async (req, res) => {
  try {
    const { clientName, companyName, email, phone, status } = req.body;

    if (!clientName || !companyName || !email || !phone) {
      return res
        .status(400)
        .json({
          status: "error",
          message: "Please provide all required client details.",
        });
    }

    const existingClient = await Client.findOne({ email });
    if (existingClient) {
      return res
        .status(400)
        .json({
          status: "error",
          message: "Client with this email already exists.",
        });
    }

    const newClient = new Client({
      clientName,
      companyName,
      email,
      phone,
      status: status || "Active",
      createdBy: req.user.id,
    });

    await newClient.save();

    res.status(201).json({
      status: "success",
      message: "Client added successfully.",
      client: newClient,
    });
  } catch (err) {
    console.error("[Add Client Error]:", err.message);
    res
      .status(500)
      .json({ status: "error", message: "Server error while adding client." });
  }
});

// 3. Update Client Details
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const { clientName, companyName, email, phone, status } = req.body;

    const updatedClient = await Client.findByIdAndUpdate(
      req.params.id,
      {
        ...(clientName && { clientName }),
        ...(companyName && { companyName }),
        ...(email && { email }),
        ...(phone && { phone }),
        ...(status && { status }),
      },
      { new: true, runValidators: true },
    );

    if (!updatedClient) {
      return res
        .status(404)
        .json({ status: "error", message: "Client not found." });
    }

    res.status(200).json({
      status: "success",
      message: "Client updated successfully.",
      client: updatedClient,
    });
  } catch (err) {
    console.error("[Update Client Error]:", err.message);
    res
      .status(500)
      .json({
        status: "error",
        message: "Server error while updating client.",
      });
  }
});

// 4. Delete Client
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const deletedClient = await Client.findByIdAndDelete(req.params.id);
    if (!deletedClient) {
      return res
        .status(404)
        .json({ status: "error", message: "Client not found." });
    }

    res.status(200).json({
      status: "success",
      message: "Client deleted successfully.",
    });
  } catch (err) {
    console.error("[Delete Client Error]:", err.message);
    res
      .status(500)
      .json({
        status: "error",
        message: "Server error while deleting client.",
      });
  }
});

module.exports = router;
