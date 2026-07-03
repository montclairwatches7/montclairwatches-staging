const Category = require("../models/categoryModel");

const categoryController = {
  getAllCategories: async (req, res) => {
    try {
      const categories = await Category.findAll(true);
      res.json({ success: true, data: categories });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getCategoryStats: async (req, res) => {
    try {
      const stats = await Category.getStats();
      res.json({ success: true, data: stats });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  createCategory: async (req, res) => {
    try {
      const { name, status } = req.body;

      if (!name) {
        return res.status(400).json({ message: "Category name is required" });
      }

      const existing = await Category.findByName(name);
      if (existing) {
        return res
          .status(400)
          .json({ message: "Category name must be unique" });
      }

      // Automatically generate slug from name
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      const newCategory = await Category.create({ name, slug, status });
      res.status(201).json(newCategory);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  updateCategory: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, status } = req.body;

      if (!name) {
        return res.status(400).json({ message: "Category name is required" });
      }

      const existing = await Category.findByName(name);
      if (existing && existing.id !== parseInt(id)) {
        return res
          .status(400)
          .json({ message: "Category name must be unique" });
      }

      // Automatically generate slug from name
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      const updated = await Category.update(id, { name, slug, status });
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  deleteCategory: async (req, res) => {
    try {
      const { id } = req.params;
      await Category.delete(id);
      res.json({ message: "Category deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
};

module.exports = categoryController;
