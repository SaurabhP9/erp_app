// models/ActivityLog.js
const mongoose = require('mongoose');

const ActivityLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  action: { type: String, required: true }, // e.g. "create_ticket", "update_profile", "clicked_submit"
  description: String, // Optional human-readable message

  targetType: String, // e.g. "Ticket", "Timesheet"
  targetId: mongoose.Schema.Types.ObjectId, // the ID of the ticket/timesheet/etc.

  meta: Object, // optional extra info (fields changed, etc.)
  ip: String,
  userAgent: String,

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ActivityLog', ActivityLogSchema);
