const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema({
  department: { type: String, required: true },
  createdBy: String,
  createdTime: { type: String, default: () => new Date().toISOString() },
  updatedBy: String,
  updatedTime: { type: String, default: () => new Date().toISOString() }
});

module.exports = mongoose.model("Department", departmentSchema);
