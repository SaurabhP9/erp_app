const Priority = require("../models/priority");

// Create Priority
exports.createPriority = async (req, res) => {
  try {
    const priority = await Priority.create({
      priority: req.body.priority,
      createdBy: req.body.createdBy,
      createdTime: new Date().toISOString(),
      updatedBy: req.body.updatedBy,
      updatedTime: new Date().toISOString()
    });
    res.status(201).json(priority);
  } catch (err) {
    console.log("errpr msg ",err.message);
    res.status(500).json({ error: err.message });
  }
};

// Get All Priorities
exports.getAllPriorities = async (req, res) => {
  try {
    const priorities = await Priority.find();
    res.json(priorities);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update Priority
exports.updatePriority = async (req, res) => {
  try {
    const priority = await Priority.findById(req.params.id);
    if (!priority) return res.status(404).json({ error: "Not found" });

    priority.priority = req.body.priority;
    priority.updatedBy = req.body.updatedBy;
    priority.updatedTime = new Date().toISOString();

    await priority.save();
    res.json(priority);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete Priority
exports.deletePriority = async (req, res) => {
  try {
    const priority = await Priority.findById(req.params.id);
    if (!priority) return res.status(404).json({ error: "Not found" });

    await priority.deleteOne();
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
