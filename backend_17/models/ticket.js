const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  ticketNo: {
    type: String,
  },
  userId: {
    type: String, // Who created the ticket (user _id)
    required: true,
  },
  employeeId: {
    type: String, // Assigned to (employee _id)
    default: null,
  },
  employee: {
    type: String,
    default: null,
  },
  clientId: {
    type: String, // Assigned to (client _id)
    default: null,
  },
  client: {
    type: String,
    default: null,
  },
  project: {
    type: String,
    required: true,
  },
  projectId: {
    type: String,
  },
  departmentId: {
    type: String,
  },
  department: {
    type: String,
  },
  category: {
    type: String,
    required: true,
  },
  categoryId: {
    type: String,
    required: true,
  },
  priority: {
    type: String,
    required: true,
  },
  priorityId: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  issue: {
    type: String,
    required: true,
  },
  targetDate: {
    type: Date,
  },
  handoverHistory: [
    {
      fromEmployeeId: { type: String },
      toEmployeeId: { type: String },
      toClientId: { type: String },
      reassignedBy: { type: String },
      reassignedAt: { type: Date, default: Date.now },
    },
  ],
  attachments: {
    type: [
      {
        filename: String,   // original file name
        url: String,        // Cloudinary URL
        public_id: String,  // Cloudinary public_id
        mimetype: String,
      },
    ],
    default: [], // ensures attachments is always an array
  },  
  mainStatus: {
    type: String
  },
  createdBy: String,
  createdTime: { type: Date, default: Date.now },
  updatedBy: String,
  updatedTime: { type: Date, default: Date.now },
});

ticketSchema.index({ userId: 1 });
ticketSchema.index({ "handoverHistory.reassignedBy": 1 });

ticketSchema.index({ employee: 1, updatedTime: -1 });
module.exports = mongoose.model("Ticket", ticketSchema);
