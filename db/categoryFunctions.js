/**
 * Name : Arewa (Morountudun) Ojelade
 * Contributors : Cully Stearns
 * Date : 1/31/2025
 * File Name: category.js
 * Course : CMSC 495 Capstone in Computer Science
 * Project : Expense Tracker Capstone Project
 * Description : The purpose of the category.js module is to provide 
 * compact functions to interact with the Category collection of
 * the Expense Tracker Accounts database.
 */

const Category = require("./models/Category.js");
/**
 * Retrieve all categories from the database.
 * @returns {Array} List of all categories with name and type.
 */
const getAllCategories = async () => {
    try {
        return await Category.find({}, "name type").lean();
    } catch (error) {
        console.error("Error fetching categories:", error);
        throw new Error("Database error while fetching categories.");
    }
};

/**
 * Add a new category to the database.
 * @param {String} name - The category name.
 * @param {String} type - Either "income" or "expense".
 * @returns {Object} Newly created category.
 */
const addCategory = async (name, type) => {
    if (!name || !type || (type !== "income" && type !== "expense")) {
        throw new Error("Invalid category data.");
    }

    // Check if category already exists (case insensitive)
    const existingCategory = await Category.findOne({ name: new RegExp(`^${name}$`, "i") });
    if (existingCategory) {
        throw new Error("Category already exists.");
    }

    return await Category.create({ name, type, createdAt: new Date(), updatedAt: new Date() });
};

/**
 * Delete a category by name.
 * @param {String} categoryName - The category name.
 * @returns {Object} Deleted category document.
 */
const deleteCategory = async (categoryName) => {
    const deletedCategory = await Category.findOneAndDelete({ name: categoryName });
    if (!deletedCategory) {
        throw new Error("Category not found.");
    }
    return deletedCategory;
};

/**
 * Get a category by name.
 * @param {String} name - The category name.
 * @returns {Object|null} The category document if found.
 */
const getCategoryByName = async (name) => {
    if (!name || name.trim() === "") {
        throw new Error("A valid category name is required.");
    }
    return await Category.findOne({ name: new RegExp(`^${name.trim()}$`, "i") });
};

module.exports = {
    getAllCategories,
    addCategory,
    deleteCategory,
    getCategoryByName,
};
