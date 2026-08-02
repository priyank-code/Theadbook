const express = require("express");
const router = express.Router();
const Billing = require("../models/Billing");
const verifyToken = require("../middleware/authMiddleware");

// Get All Invoices
router.get("/", verifyToken, async (req, res) => {
  try {
    const invoices = await Billing.find()
      .populate("clientId", "clientName companyName email phone")
      .populate(
        "campaignId",
        "campaignName budget screenName creativeName startDate endDate",
      )
      .sort({ createdAt: -1 });
    res
      .status(200)
      .json({ status: "success", count: invoices.length, invoices });
  } catch (err) {
    console.error("[Fetch Billing Error]:", err.message);
    res.status(500).json({
      status: "error",
      message: "Server error while fetching billing records.",
    });
  }
});

// Create New Invoice
router.post("/create", verifyToken, async (req, res) => {
  try {
    const {
      clientId,
      campaignId,
      invoiceNumber,
      amount,
      tax,
      paymentStatus,
      paymentMethod,
      referenceId,
      dueDate,
    } = req.body;

    if (!clientId || !invoiceNumber || !amount || !dueDate) {
      return res.status(400).json({
        status: "error",
        message: "Please provide all required billing fields.",
      });
    }

    const calculatedTax = tax || 0;
    const totalAmount = Number(amount) + Number(calculatedTax);

    const newInvoice = new Billing({
      clientId,
      campaignId: campaignId || undefined,
      invoiceNumber,
      amount,
      tax: calculatedTax,
      totalAmount,
      paymentStatus: paymentStatus || "Pending",
      paymentMethod: paymentMethod || "None",
      referenceId: referenceId || "",
      dueDate,
      createdBy: req.user.id,
    });

    await newInvoice.save();

    const populatedInvoice = await Billing.findById(newInvoice._id)
      .populate("clientId", "clientName companyName email phone")
      .populate("campaignId", "campaignName budget screenName");

    res.status(201).json({
      status: "success",
      message: "Invoice generated successfully.",
      invoice: populatedInvoice,
    });
  } catch (err) {
    console.error("[Create Invoice Error]:", err.message);
    res.status(500).json({
      status: "error",
      message: err.message || "Server error while creating invoice.",
    });
  }
});

// Update / Edit Invoice
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const {
      clientId,
      campaignId,
      invoiceNumber,
      amount,
      tax,
      paymentStatus,
      paymentMethod,
      referenceId,
      dueDate,
    } = req.body;

    const calculatedTax = tax || 0;
    const totalAmount = Number(amount) + Number(calculatedTax);

    const updatedInvoice = await Billing.findByIdAndUpdate(
      req.params.id,
      {
        clientId,
        campaignId: campaignId || undefined,
        invoiceNumber,
        amount,
        tax: calculatedTax,
        totalAmount,
        paymentStatus,
        paymentMethod,
        referenceId: referenceId || "",
        dueDate,
      },
      { new: true, runValidators: true },
    )
      .populate("clientId", "clientName companyName email phone")
      .populate("campaignId", "campaignName budget screenName");

    if (!updatedInvoice) {
      return res
        .status(404)
        .json({ status: "error", message: "Invoice not found." });
    }

    res.status(200).json({
      status: "success",
      message: "Invoice updated successfully.",
      invoice: updatedInvoice,
    });
  } catch (err) {
    console.error("[Update Invoice Error]:", err.message);
    res.status(500).json({
      status: "error",
      message: err.message || "Server error while updating invoice.",
    });
  }
});

// Delete Invoice
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const deletedInvoice = await Billing.findByIdAndDelete(req.params.id);
    if (!deletedInvoice) {
      return res
        .status(404)
        .json({ status: "error", message: "Invoice not found." });
    }
    res
      .status(200)
      .json({ status: "success", message: "Invoice deleted successfully." });
  } catch (err) {
    res
      .status(500)
      .json({
        status: "error",
        message: "Server error while deleting invoice.",
      });
  }
});

module.exports = router;
