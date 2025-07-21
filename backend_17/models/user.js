const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  mobile: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["admin", "employee", "client"],
    required: true
  },
  departmentId: { type: String },
  department: { type: String },
  designationId: { type: String },
  designation: { type: String },
  skillId: [{ type: String }],
  skill: [{ type: String }],
  projects : [{ type: String }],
  projectIds: [{ type: String }],
  createdBy: { type: String },
  createdTime: { type: Date, default: Date.now },
  updatedBy: { type: String },
  updatedTime: { type: Date }
});

module.exports = mongoose.model("User", userSchema);
