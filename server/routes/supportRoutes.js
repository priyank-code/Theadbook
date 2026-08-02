const express = require("express");
const router = express.Router();
const SupportTicket = require("../models/SupportTicket");
const verifyToken = require("../middleware/authMiddleware");

// Get All Support Tickets
router.get("/", verifyToken, async (req, res) => {
  try {
    const tickets = await SupportTicket.find()
      .populate("clientId", "clientName companyName email phone")
      .sort({ createdAt: -1 });
    res.status(200).json({ status: "success", count: tickets.length, tickets });
  } catch (err) {
    console.error("[Fetch Support Error]:", err.message);
    res.status(500).json({
      status: "error",
      message: "Server error while fetching support tickets.",
    });
  }
});

// Create New Support Ticket
router.post("/create", verifyToken, async (req, res) => {
  try {
    const { clientId, subject, description, category, priority, raisedBy } =
      req.body;
    if (!subject || !description || !raisedBy) {
      return res.status(400).json({
        status: "error",
        message: "Subject, description, and raisedBy are required.",
      });
    }

    const newTicket = new SupportTicket({
      clientId: clientId || undefined,
      subject: subject.trim(),
      description: description.trim(),
      category: category || "Hardware / Display",
      priority: priority || "Medium",
      raisedBy: raisedBy.trim(),
      status: "Open",
    });

    await newTicket.save();

    const populatedTicket = await SupportTicket.findById(
      newTicket._id,
    ).populate("clientId", "clientName companyName email");

    res.status(201).json({
      status: "success",
      message: "Support ticket raised successfully.",
      ticket: populatedTicket,
    });
  } catch (err) {
    console.error("[Create Ticket Error]:", err.message);
    res.status(500).json({
      status: "error",
      message: "Server error while creating ticket.",
    });
  }
});

// ⚡ Update / Edit Support Ticket (This was missing)
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const {
      clientId,
      subject,
      description,
      category,
      priority,
      status,
      raisedBy,
    } = req.body;

    const updatedTicket = await SupportTicket.findByIdAndUpdate(
      req.params.id,
      {
        clientId: clientId || undefined,
        subject: subject.trim(),
        description: description.trim(),
        category,
        priority,
        status,
        raisedBy: raisedBy.trim(),
      },
      { new: true, runValidators: true },
    ).populate("clientId", "clientName companyName email");

    if (!updatedTicket) {
      return res
        .status(404)
        .json({ status: "error", message: "Support ticket not found." });
    }

    res.status(200).json({
      status: "success",
      message: "Support ticket updated successfully.",
      ticket: updatedTicket,
    });
  } catch (err) {
    console.error("[Update Ticket Error]:", err.message);
    res.status(500).json({
      status: "error",
      message: err.message || "Server error while updating ticket.",
    });
  }
});

// Update Ticket Status only (Shortcut route)
router.put("/status/:id", verifyToken, async (req, res) => {
  try {
    const { status } = req.body;
    const updatedTicket = await SupportTicket.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true },
    ).populate("clientId", "clientName companyName email");

    if (!updatedTicket) {
      return res
        .status(404)
        .json({ status: "error", message: "Support ticket not found." });
    }

    res.status(200).json({
      status: "success",
      message: "Ticket status updated successfully.",
      ticket: updatedTicket,
    });
  } catch (err) {
    res
      .status(500)
      .json({
        status: "error",
        message: "Server error while updating status.",
      });
  }
});

// Delete Support Ticket
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const deletedTicket = await SupportTicket.findByIdAndDelete(req.params.id);
    if (!deletedTicket) {
      return res
        .status(404)
        .json({ status: "error", message: "Support ticket not found." });
    }
    res
      .status(200)
      .json({
        status: "success",
        message: "Support ticket deleted successfully.",
      });
  } catch (err) {
    res
      .status(500)
      .json({
        status: "error",
        message: "Server error while deleting ticket.",
      });
  }
});

module.exports = router;
