const { Status } = require("../models");

// Create Status
exports.createStatus = async (req, res) => {
  try {
    const status = await Status.create(req.body);
    res.status(201).json(status);
  } catch (err) {
    console.log("error ", err.message);
    res.status(500).json({ error: err.message });
  }
};

// Get All Statuses
exports.getAllStatuses = async (req, res) => {
  try {
    const statuses = await Status.find();
    res.json(statuses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update Status
exports.updateStatus = async (req, res) => {
  try {
    const status = await Status.findById(req.params.id);
    if (!status) return res.status(404).json({ error: "Status not found" });

    Object.assign(status, req.body);
    await status.save();

    res.json(status);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete Status
exports.deleteStatus = async (req, res) => {
  try {
    const status = await Status.findById(req.params.id);
    if (!status) return res.status(404).json({ error: "Status not found" });

    await status.deleteOne();
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
