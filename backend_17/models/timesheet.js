const mongoose = require("mongoose");

const TimesheetSchema = new mongoose.Schema(
  {
    employee: { type: String, required: true },
    employeeId: { type: String, required: true },
    ticket: { type: String, required: true },
    ticketNo: { type: String, required: true },
    subject: { type: String, required: true },
    project: { type: String, required: true }, 
    issuedDate: { type: String },
    task: { type: String, required: true },
    date: { type: String, required: true },
    workingTime: { type: Number, required: true },
    previousWork: { type: Number },
    totalWork: { type: Number },
  },
  { timestamps: true }
);

TimesheetSchema.index({ employeeId: 1, ticket: 1, date: 1 }, { unique: true });
TimesheetSchema.index({ ticket: 1 });
module.exports = mongoose.model("Timesheet", TimesheetSchema);
