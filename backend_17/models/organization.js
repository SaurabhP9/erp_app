const mongoose = require("mongoose");

const orgSchema = new mongoose.Schema({
  orgName: String,
  address: String,
  phone: String,
  emailId: String,
  website: String,
  createdBy: String,
  createdTime: String,
  updatedBy: String,
  updatedTime: String
});

module.exports = mongoose.model("Organization", orgSchema);
