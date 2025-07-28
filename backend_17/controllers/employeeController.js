const { Employee } = require("../models");

exports.createEmployee = async (req, res) => {
  try {
    const { name, email, mobile, department, projectIds } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: "Name and Email are required" });
    }

    const newEmployee = new Employee({
      name,
      email,
      mobile,
      department,
      projectIds
    });
    const savedEmployee = await newEmployee.save();
    res.status(201).json(savedEmployee);
  } catch (err) {
    console.error("Error creating employee:", err);
    res.status(500).json({ error: err.message });
  }
};


// Get All Employees
exports.getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.find();
    res.json(employees);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update Employee
exports.updateEmployee = async (req, res) => {
  try {
    const { name, email, mobile, department, projectIds } = req.body;

    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ error: "Employee not found" });

    employee.name = name || employee.name;
    employee.email = email || employee.email;
    employee.mobile = mobile || employee.mobile;
    employee.department = department || employee.department;
    employee.projectIds = projectIds || employee.projectIds;

    await employee.save();
    res.json(employee);
  } catch (err) {
    console.error("Error updating employee:", err);
    res.status(500).json({ error: err.message });
  }
};

// Delete Employee
exports.deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ error: "Employee not found" });

    await employee.deleteOne();
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
