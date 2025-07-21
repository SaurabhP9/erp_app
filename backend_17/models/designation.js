const mongoose = require("mongoose");

const designationSchema = new mongoose.Schema({
  designation: String,
  createdBy: String,
  createdTime: String,
  updatedBy: String,
  updatedTime: String
});

module.exports = mongoose.model("Designation", designationSchema);
