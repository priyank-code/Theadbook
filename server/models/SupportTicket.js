const mongoose = require("mongoose");

const supportTicketSchema = new mongoose.Schema(
  {
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: "Client" },
    subject: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Urgent"],
      default: "Medium",
    },
    status: {
      type: String,
      enum: ["Open", "In Progress", "Resolved", "Closed"],
      default: "Open",
    },
    raisedBy: { type: String, required: true }, // e.g., Client name or Operator email
  },
  { timestamps: true },
);

supportTicketSchema.index({ status: 1, priority: 1 });
module.exports = mongoose.model("SupportTicket", supportTicketSchema);
