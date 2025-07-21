const Project = require("../models/project");
const { v4: uuidv4 } = require("uuid");

exports.createProject = async (req, res) => {
  try {
    if (!req.body.projectId) {
      req.body.projectId = uuidv4();
    }
    const project = new Project(req.body);
    await project.save();
    res.status(201).json(project);
  } catch (error) {
    console.error("Create error:", error);
    res.status(400).json({ error: error.message });
  }
};


exports.getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find();
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findOne({ projectId: req.params.id });
    if (!project) return res.status(404).json({ error: "Project not found" });
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findOneAndUpdate(
      { projectId: req.params.id },
      req.body,
      { new: true }
    );
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    await Project.deleteOne({ projectId: req.params.id });
    res.json({ message: "Project deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
