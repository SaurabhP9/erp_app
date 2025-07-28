const { User } = require("../models");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
// Utility: Validate required fields
const hasRequiredFields = ({ name, email, password, role }) => {
  return name && email && password && role;
};

// Create User
// Create User
exports.createUser = async (req, res) => {
  try {
    const {
      name,
      email,
      mobile,
      password,
      role,
      department,
      projectId,
      departmentId,
      skillId,
      permissions,
      createdBy,
      projects,
    } = req.body;

    if (!hasRequiredFields({ name, email, password, role })) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email,
      mobile,
      password: hashedPassword,
      role,
      department,
      projectId,
      departmentId,
      skillId,
      permissions,
      createdBy,
      projects,
      createdTime: new Date(),
    });

    await newUser.save();
    res.status(201).json(newUser);
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ error: err.message });
  }
};

// Get All Users
exports.getAllUsers = async (_req, res) => {
  try {
    const users = await User.find().lean();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllUsersByRole = async (req, res) => {
  try {
    const { role } = req.params;

    if (["admin", "employee", "client"].includes(role)) {
      const users = await User.find({ role }).lean();
      return res.json(users);
    }

    return res.status(400).json({ error: "Invalid role" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// Update User
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const updateData = { ...req.body, updatedTime: new Date() };

    if (req.body.password) {
      updateData.password = await bcrypt.hash(req.body.password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(updatedUser);
  } catch (err) {
    console.error("Error updating user:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// Delete User
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.sendStatus(204); // No Content
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const userId = req.user.id; // From verifyToken middleware

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found." });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Old password is incorrect." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    await user.save();
    return res.json({ message: "Password updated successfully." });
  } catch (err) {
    console.error("Change password error:", err.message);
    res.status(500).json({ error: "Failed to update password." });
  }
};
