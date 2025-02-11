const express = require("express");
const { getAllCategories, addCategory, deleteCategory } = require("../db/categoryFunctions");

const router = express.Router();

/**
 * Get all categories
 * @route GET /api/categories
 */
router.get("/", async (req, res) => {
  try {
    const categories = await getAllCategories();
    res.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Add a new category
 * @route POST /api/categories
 * @param {String} name - The category name
 * @param {String} type - "income" or "expense"
 */
router.post("/", async (req, res) => {
  const { name, type } = req.body;

  try {
    const newCategory = await addCategory(name, type);
    res.json({ success: true, category: newCategory });
  } catch (error) {
    console.error("Error adding category:", error.message);
    res.status(400).json({ error: error.message });
  }
});

/**
 * Delete a category by name
 * @route DELETE /api/categories/:name
 */
router.delete("/:name", async (req, res) => {
  const categoryName = req.params.name;

  try {
    await deleteCategory(categoryName);
    res.json({ success: true, message: `Category '${categoryName}' deleted.` });
  } catch (error) {
    console.error("Error deleting category:", error.message);
    res.status(404).json({ error: error.message });
  }
});

module.exports = router;
