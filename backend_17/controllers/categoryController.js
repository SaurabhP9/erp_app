const { Category } = require("../models");

// Create Category
exports.createCategory = async (req, res) => {
  try {
    const category = await Category.create({
      category: req.body.category,
      createdBy: req.body.createdBy,
      createdTime: new Date().toISOString(),
      updatedBy: req.body.updatedBy,
      updatedTime: new Date().toISOString()
    });
    
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get All Categories (not deleted)
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find({});
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update Category
exports.updateCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ error: "Not found" });

    category.category = req.body.category;
    category.updatedBy = req.body.updatedBy || 0;
    category.updatedTime = new Date().toISOString();

    await category.save();
    res.json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete Category (soft delete)
exports.deleteCategory = async (req, res) => {
  try {
    console.log("Deleting category with ID ->", req.params.id);

    const result = await Category.deleteOne({ _id: req.params.id });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Category not found" });
    }

    res.status(200).json({ message: "Category deleted successfully" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ error: err.message });
  }
};

