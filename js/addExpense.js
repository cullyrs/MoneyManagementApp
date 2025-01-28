/** this script is used to handlle the expense form and the category selection */

document.addEventListener("DOMContentLoaded", () => {
    // Get elements from the DOM
    const categorySelect = document.getElementById("category");
    const customCategoryContainer = document.getElementById("custom-category-container");
    const addExpenseButton = document.getElementById("add-expense-button");
    const addExpenseContainer = document.getElementById("add-expense-container");
    const closeExpenseButton = document.getElementById("close-add-expense");

    // Buttons to toggle between Income and Expense categories
    const incomeButton = document.getElementById("income-button");
    const expenseButton = document.getElementById("expense-button");

    // Define categories for income and expense --> replace with actual data from the database
    const incomeCategories = ["Salary", "Bonus", "Investment", "Custom"];
    const expenseCategories = ["Food", "Transportation", "Entertainment", "Utilities", "Health", "Other", "Custom"];

    // Populate the category select box dynamically
    const populateCategories = (categories) => {
        categorySelect.innerHTML = ""; // Clear existing options
        categories.forEach((category) => {
            const option = document.createElement("option");
            option.value = category.toLowerCase(); // Use lowercase values
            option.textContent = category; // Display text
            categorySelect.appendChild(option);
        });
        categorySelect.value = categories[0].toLowerCase(); // Default to the first category
    };

    // Show the expense menu
    addExpenseButton.addEventListener("click", () => {
        addExpenseContainer.classList.add("active");
    });

    // Hide the expense menu
    closeExpenseButton.addEventListener("click", () => {
        addExpenseContainer.classList.remove("active");
    });

    // When clicking outside the expense menu, hide it
    document.addEventListener("click", (event) => {
        if (!addExpenseContainer.contains(event.target) && event.target !== addExpenseButton) {
            addExpenseContainer.classList.remove("active");
        }
    });

    // Show/hide the custom category input based on selected category
    categorySelect.addEventListener("change", () => {
        if (categorySelect.value === "custom") {
            customCategoryContainer.style.display = "block";
        } else {
            customCategoryContainer.style.display = "none";
        }
    });

    // Function to toggle active button and populate categories
    const activateButton = (buttonToActivate, buttonToDeactivate, categories) => {
        buttonToActivate.classList.add("active");
        buttonToDeactivate.classList.remove("active");
        populateCategories(categories); // Populate categories for the active button
    };

    // Toggle to Income categories
    incomeButton.addEventListener("click", () => {
        activateButton(incomeButton, expenseButton, incomeCategories);
        customCategoryContainer.style.display = "none";
    });

    // Toggle to Expense categories
    expenseButton.addEventListener("click", () => {
        activateButton(expenseButton, incomeButton, expenseCategories);
        customCategoryContainer.style.display = "none";
    });

    // Initialize Default State
    populateCategories(expenseCategories); // Default to Expense categories
    expenseButton.classList.add("active"); // Ensure Expense is the active button
    customCategoryContainer.style.display = "none"; // Hide custom category input by default
});
