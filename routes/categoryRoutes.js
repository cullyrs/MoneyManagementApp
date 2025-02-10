const express = require("express");
const Category = require("../db/models/Category");

const router = express.Router();

/**
 * Get all categories
 * @route GET /api/categories
 * @returns {Array} List of income and expense categories
 */
router.get("/", async (req, res) => {
    try {
        const categories = await Category.find({}, "name type").lean();
        res.json(categories);
    } catch (error) {
        console.error("Error fetching categories:", error);
        res.status(500).json({ error: "Server error" });
    }
});

/**
 * Add a new category
 * @route POST /api/categories
 * @param {String} name - The name of the category
 * @param {String} type - "income" or "expense"
 */
router.post("/", async (req, res) => {
    const { name, type } = req.body;

    if (!name || !type || (type !== "income" && type !== "expense")) {
        return res.status(400).json({ error: "Invalid category data" });
    }

    try {
        // Check if category already exists
        const existingCategory = await Category.findOne({ name });
        if (existingCategory) {
            return res.status(400).json({ error: "Category already exists" });
        }

        const newCategory = await Category.create({ name, type, createdAt: new Date(), updatedAt: new Date() });
        res.json({ success: true, category: newCategory });
    } catch (error) {
        console.error("Error adding category:", error);
        res.status(500).json({ error: "Server error" });
    }
});

/**
 * Delete a category by name
 * @route DELETE /api/categories/:name
 */
router.delete("/:name", async (req, res) => {
    const categoryName = req.params.name;

    try {
        const deletedCategory = await Category.findOneAndDelete({ name: categoryName });
        if (!deletedCategory) {
            return res.status(404).json({ error: "Category not found" });
        }

        res.json({ success: true, message: `Category '${categoryName}' deleted.` });
    } catch (error) {
        console.error("Error deleting category:", error);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
