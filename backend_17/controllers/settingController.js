const { Organization, Parameter } = require("../models");
const mongoose = require("mongoose");

// ------------------- ORGANIZATION -------------------

exports.createOrganization = async (req, res) => {
  try {
    const orgExists = await Organization.findOne({ emailId: req.body.emailId });
    if (orgExists) return res.status(400).json({ error: "Organization already exists" });

    const org = await Organization.create(req.body);
    res.status(201).json(org);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllOrganizations = async (req, res) => {
  try {
    const orgs = await Organization.find();
    res.json(orgs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getOrganizationById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid ID" });

    const org = await Organization.findById(id);
    if (!org) return res.status(404).json({ error: "Organization not found" });
    res.json(org);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateOrganizationById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid ID" });

    const org = await Organization.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!org) return res.status(404).json({ error: "Organization not found" });
    res.json(org);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteOrganizationById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid ID" });
    }

    const deleted = await Organization.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: "Organization not found" });

    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ------------------- PARAMETER -------------------

// Create new parameter (allow multiple)
exports.createParameter = async (req, res) => {
  try {
    const now = new Date().toISOString();

    const param = await Parameter.create({
      ...req.body,
      createdTime: now,
      updatedTime: now,
    });

    res.status(201).json(param);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all parameters (for table display)
exports.getParameter = async (req, res) => {
  try {
    const all = await Parameter.find();
    res.json(all);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update parameter by ID
exports.updateParameter = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ error: "Invalid ID" });
    const updated = await Parameter.findByIdAndUpdate(
      id,
      {
        ...req.body,
        updatedTime: new Date().toISOString(),
      },
      { new: true, runValidators: true }
    );

    if (!updated) return res.status(404).json({ error: "Parameter not found" });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete parameter by ID
exports.deleteParameter = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ error: "Invalid ID" });

    const deleted = await Parameter.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: "Parameter not found" });

    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};