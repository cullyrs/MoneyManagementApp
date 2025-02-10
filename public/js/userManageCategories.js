/**
 * Name : Cully Stearns
 * Date : 1/31/2025
 * File Name : userManageCategories.js
 * Course : CMSC 495 Capstone in Computer Science
 * Project : Expense Tracker Capstone Project
 * Description : This module manages the category functionality within the
 * Expense Tracker application. It retrieves the list of categories,
 * displays them in the UI, and provides functionality to add new categories
 * or delete existing ones using IPC communication with the main process.
 */


// DEPRECATED: This code is no longer used in the application.

document.addEventListener("DOMContentLoaded", () => {
    const categoriesList = document.getElementById("categories-list");
    const addCategoryButton = document.getElementById("add-category-button");
    const newCategoryInput = document.getElementById("new-category");

    /**
     * Asynchronously loads and displays all categories from the database.
     *
     * This function invokes the "getCategories" IPC handler to retrieve a list of categories.
     * If successful, it clears the existing categories list and populates it with the new data.
     * In case of failure, it alerts the user with an error message.
     *
     * @async
     * @function loadCategories
     * @returns {Promise<void>} Resolves when the categories are loaded and displayed.
     */
    async function loadCategories() {
        try {
            const result = await window.electronAPI.invoke("getCategories");
            if (result.success && Array.isArray(result.categories)) {
                categoriesList.innerHTML = "";
                result.categories.forEach((cat) => {
                    const li = document.createElement("li");
                    li.textContent = cat.name;
                    li.setAttribute("data-id", cat._id);
                    const deleteBtn = document.createElement("button");
                    deleteBtn.classList.add("delete-category");
                    deleteBtn.textContent = "Delete";
                    li.appendChild(deleteBtn);
                    categoriesList.appendChild(li);
                });
            } else {
                alert("Failed to load categories: " + result.error);
            }
        } catch (err) {
            console.error("Error loading categories:", err);
        }
    }

     /**
     * Asynchronous event handler for deleting a category.
     *
     * This function uses event delegation on the categories list to detect clicks on elements
     * with the "delete-category" class. It extracts the category name from the clicked list item,
     * confirms deletion with the user, and then invokes the "deleteCategory" IPC handler.
     * On successful deletion, it reloads the categories list.
     *
     * @async
     * @function (anonymous) deleteCategoryHandler
     * @param {Event} event - The click event.
     * @returns {Promise<void>} Resolves when the deletion process is complete.
     */
    categoriesList.addEventListener("click", async (event) => {
        if (event.target && event.target.classList.contains("delete-category")) {
            const li = event.target.closest("li");
            if (!li)
                return;

            const fullText = li.textContent;
            const categoryName = fullText.replace(/Delete\s*$/i, "").trim();
            console.log("Delegated click detected for category:", categoryName);
            const confirmDelete = confirm(`Delete category "${categoryName}"?`);
            if (confirmDelete) {
                try {
                    const res = await window.electronAPI.invoke("deleteCategory", {categoryName});
                    console.log("IPC deleteCategory response:", res);
                    if (res.success) {
                        await loadCategories();
                        alert("Category deleted successfully.");
                    } else {
                        alert("Failed to delete category: " + res.error);
                    }
                } catch (err) {
                    console.error("Error during deletion:", err);
                    alert("Error during deletion: " + err.message);
                }
            }
        }
    });

    /**
     * Asynchronous event handler for adding a new category.
     *
     * This function is triggered when the "Add" button is clicked.
     * It retrieves and trims the new category name from the input field,
     * validates the input, checks for duplicates within the existing list,
     * and then invokes the "addCategory" IPC handler to create a new category.
     * On success, it clears the input field and reloads the categories list.
     *
     * @async
     * @function (anonymous) addCategoryHandler
     * @returns {Promise<void>} Resolves when the new category has been added and the list updated.
     */
    addCategoryButton.addEventListener("click", async () => {
        const categoryName = newCategoryInput.value.trim();
        if (!categoryName) {
            alert("Please enter a valid category name.");
            return;
        }
        const listItems = categoriesList.querySelectorAll("li");
        let duplicateFound = false;
        listItems.forEach(li => {
            const displayedName = li.textContent.replace(/Delete\s*$/i, "").trim();
            if (displayedName.toLowerCase() === categoryName.toLowerCase()) {
                duplicateFound = true;
            }
        });
        if (duplicateFound) {
            alert("Category already exists.");
            return;
        }
        try {
            const result = await window.electronAPI.invoke("addCategory", categoryName);
            if (result.success) {
                newCategoryInput.value = "";
                await loadCategories();  // Reload the list to include the new category.
            } else {
                alert("Failed to add category: " + result.error);
            }
        } catch (err) {
            console.error("Error adding category:", err);
        }
    });

    loadCategories();
});
