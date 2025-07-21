const Department = require("../models/department");

// Create Department
exports.createDepartment = async (req, res) => {
  try {
    console.log("created Department ", req.body)
    const department = await Department.create({
      department: req.body.department,
      createdBy: req.body.createdBy,
      createdTime: new Date().toISOString(),
      updatedBy: req.body.updatedBy,
      updatedTime: new Date().toISOString()
    });

    res.status(201).json(department);
  } catch (err) {
    console.log("error msg is -> ",err.message);
    res.status(500).json({ error: err.message });
  }
};

// Get All Departments
exports.getAllDepartments = async (req, res) => {
  try {
    const departments = await Department.find({});
    res.json(departments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update Department
exports.updateDepartment = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) return res.status(404).json({ error: "Not found" });

    department.department = req.body.department;
    department.updatedBy = req.body.updatedBy;
    department.updatedTime = new Date().toISOString();

    await department.save();
    res.json(department);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete Department (hard delete)
exports.deleteDepartment = async (req, res) => {
  try {
    const result = await Department.deleteOne({ _id: req.params.id });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Department not found" });
    }

    res.status(200).json({ message: "Department deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};