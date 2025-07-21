const mongoose = require("mongoose");

const statusSchema = new mongoose.Schema({
  mainStatus: {
    type: String,
    required: true,
    enum: ["open", "inProcess", "closed", "handover", "working"],
  },
  subStatus: {
    type: String,
    required: true,
  },
  createdBy: String,
  createdTime: { type: String, default: () => new Date().toISOString() },
  updatedBy: String,
  updatedTime: { type: String, default: () => new Date().toISOString() }
});

module.exports = mongoose.model("Status", statusSchema);
