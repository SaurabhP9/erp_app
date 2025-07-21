const mongoose = require("mongoose");

const ticketStatusSchema = new mongoose.Schema({
  ticketId: Number,
  assignId: Number,
  statusId: Number,
  comment: String,
  attachments: [String],
  createdBy: String,
  createdTime: { type: String, default: () => new Date().toISOString() },
  updatedBy: String,
  updatedTime: { type: String, default: () => new Date().toISOString() }
});

module.exports = mongoose.model("TicketStatus", ticketStatusSchema);
