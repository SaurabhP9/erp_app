const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  mobile: { type: String },
  department: { type: String }, 
  projectIds: [{ type: String }], 
});

module.exports = mongoose.model("Employee", employeeSchema);
