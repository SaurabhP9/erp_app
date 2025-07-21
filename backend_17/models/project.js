const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema(
  {
    contactPerson: { type: String },
    phoneNumber: { type: String },
    emailId: { type: String },
    departmentId: { type: Number },
  },
  { _id: false }
);

const projectSchema = new mongoose.Schema({
  projectId: { type: String, required: true, unique: true },
  project: { type: String, required: true },
  location: { type: String },

  contacts: [contactSchema],

  gst: { type: String },
  address: { type: String },

  createdBy: { type: String },
  createdTime: { type: String, default: () => new Date().toISOString() },
  updatedBy: { type: String },
  updatedTime: { type: String, default: () => new Date().toISOString() },
});

module.exports = mongoose.model("Project", projectSchema);
