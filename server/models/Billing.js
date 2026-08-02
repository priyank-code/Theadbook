const mongoose = require("mongoose");

const billingSchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true,
    },
    campaignId: { type: mongoose.Schema.Types.ObjectId, ref: "Campaign" },
    invoiceNumber: { type: String, required: true, unique: true },
    amount: { type: Number, required: true },
    tax: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    paymentStatus: {
      type: String,
      enum: ["Paid", "Pending", "Failed", "Overdue"],
      default: "Pending",
    },
    paymentMethod: {
      type: String,
      enum: ["Credit Card", "Bank Transfer", "UPI", "Cash", "None"],
      default: "None",
    },
    referenceId: { type: String, default: "" }, // ⚡ Added referenceId field
    dueDate: { type: Date, required: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

billingSchema.index({ clientId: 1, paymentStatus: 1 });
module.exports = mongoose.model("Billing", billingSchema);
