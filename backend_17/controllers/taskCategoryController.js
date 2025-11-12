const TaskCategory = require('../models/taskCategory');

// Create
const createTaskCategory = async (name) => {
  const newTaskCategory = new TaskCategory({ name });
  return await newTaskCategory.save();
};

// Get all
const getAllTaskCategories = async () => {
  return await TaskCategory.find();
};

// Get by ID
const getTaskCategoryById = async (id) => {
  const category = await TaskCategory.findById(id);
  if (!category) throw new Error("Task category not found");
  return category;
};

// Delete
const deleteTaskCategoryById = async (id) => {
  const category = await TaskCategory.findById(id);
  if (!category) throw new Error("Task category not found");
  await category.deleteOne();
  return true;
};

module.exports = {
  createTaskCategory,
  getAllTaskCategories,
  getTaskCategoryById,
  deleteTaskCategoryById,
};
