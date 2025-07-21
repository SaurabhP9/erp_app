const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema({
  name: {
    type: String
  },
  ticketNo:{
    type: String
  },
  userId: {
    type: String, // Who created the ticket (user _id)
    required: true
  },
  employeeId: {
    type: String, // Assigned to (employee _id)
    default: null
  },
  employee: {
    type: String,
    default: null
  },
  project: {
    type: String,
    required: true
  },
  projectId: {
    type: String
  },
  departmentId: {
    type: String
  },
  department: {
    type: String
  },
  category: {
    type: String,
    required: true
  },
  categoryId: {
    type: String,
    required: true
  },
  priority: {
    type: String,
    required: true
  },
  priorityId: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  issue: {
    type: String,
    required: true
  },
  targetDate: {
    type: Date
  },
  handoverHistory: [
    {
      fromEmployeeId: String,
      toEmployeeId: String,
      reassignedBy: String,
      reassignedAt: { type: Date, default: Date.now }
    }
  ],
  attachments: [
    {
      filename: String,
      path: String,
      mimetype: String
    }
  ],
  mainStatus: {
    type: String,
    enum: ["open", "inProcess", "closed", "handover", "working"],
    default: "open"
  },
  createdBy: String,
  createdTime: { type: String, default: () => new Date().toISOString() },
  updatedBy: String,
  updatedTime: { type: String, default: () => new Date().toISOString() }
});

ticketSchema.index({ userId: 1 });
ticketSchema.index({ "handoverHistory.reassignedBy": 1 });
module.exports = mongoose.model("Ticket", ticketSchema);
