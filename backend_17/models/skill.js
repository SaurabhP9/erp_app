const mongoose = require("mongoose");

const skillSchema = new mongoose.Schema({
  skill: String,
  createdBy: String,
  createdTime: { type: String, default: () => new Date().toISOString() },
  updatedBy: String,
  updatedTime: { type: String, default: () => new Date().toISOString() }
});

module.exports = mongoose.model("Skill", skillSchema);
