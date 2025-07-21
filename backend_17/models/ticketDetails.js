const mongoose = require("mongoose");

const ticketDetailSchema = new mongoose.Schema({
  ticketId: Number,
  refId: Number,
  userId: Number,
  userName: String,
  userMobile: String,
  userEmail: String,
  projectId: Number,
  project: String,
  departmentId: Number,
  department: String,
  categoryId: Number,
  category: String,
  priorityId: Number,
  priority: String,
  subject: String,
  issue: String,
  targetDate: Date,
  ticketStatusId: Number,
  assignId: Number,
  employeeName: String,
  employeeMobile: String,
  employeeEmail: String,
  statusId: Number,
  status: String,
  mainStatus: String,
  comment: String,
  attachments: [String],
  createdBy: Number,
  createdTime: String
});

module.exports = mongoose.model("TicketDetail", ticketDetailSchema);
