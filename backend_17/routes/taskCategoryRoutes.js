const express = require('express');
const taskCategoryService = require('../controllers/taskCategoryController');

const router = express.Router();

// Create
router.post('/create', async (req, res) => {
  const { name } = req.body;
  try {
    const newCategory = await taskCategoryService.createTaskCategory(name);
    res.status(201).json({ message: 'Task category created', taskCategory: newCategory });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all
router.get('/all', async (req, res) => {
  try {
    const categories = await taskCategoryService.getAllTaskCategories();
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get by ID
router.get('/:id', async (req, res) => {
  try {
    const category = await taskCategoryService.getTaskCategoryById(req.params.id);
    res.status(200).json(category);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

module.exports = router;
