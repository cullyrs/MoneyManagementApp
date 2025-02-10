/** INCOMPLETE
 * Name : Cully Stearns
 * Date : 1/31/2025
 * File Name : userBudget.js
 * Course : CMSC 495 Capstone in Computer Science
 * Project : Expense Tracker Capstone Project
 * Description : This module manages the display and updating of the user's budget.
 * It retrieves the logged-in user's budget data from the dashboard via IPC,
 * displays the current budget, and handles the form submission for updating
 * the budget. Client-side validation ensures that only valid data is processed.
 * INCOMPLETE
 */


/**
 * Function to load and update the user's budget in the Expense Tracker Accounts database.
 * This function executes when the DOM content is fully loaded. It performs the following tasks:
 * 1. Retrieves the logged-in user's ID from localStorage. If no user ID is found, the function alerts the user
 *    and redirects to the login page.
 * 2. Loads the current budget by invoking the "getDashboardData" IPC handler and displays it in the UI.
 * 3. Sets up an event listener for the budget update form submission. When the form is submitted:
 *      - It validates the new budget name and the new budget amount (ensuring that the amount is a non-negative number).
 *      - If the input is valid, it invokes the "addBudget" IPC handler with the provided details.
 *      - On successful budget update, it updates the displayed budget and redirects the user to the dashboard.
 * @returns {void}
 * Returns early if:
 *   1. No logged-in user is detected in localStorage.
 *   2. The new budget name is empty.
 *   3. The new budget amount is either not a number or is a negative value.
 */

// HAVE NOT UPDATED YET
document.addEventListener("DOMContentLoaded", async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
        alert("You must be logged in to update your budget.");
        window.location.href = "login.html";
        return;
    }
    console.log("Logged-in userId:", userId);

    const currentBudgetDiv = document.getElementById("current-budget");
    const budgetForm = document.getElementById("budget-form");
    const budgetNameInput = document.getElementById("budget-name");
    const budgetInput = document.getElementById("budget-input");
    const budgetCategorySelect = document.getElementById("budget-category");

    async function loadCurrentBudget() {
        try {
            const result = await window.electronAPI.invoke("getDashboardData", userId);
            console.log("Dashboard data:", result);
            if (result.success && result.recentBudget) {
                const budget = result.recentBudget;
                currentBudgetDiv.innerText = `Current Budget: $${budget.amount}`;
            } else {
                currentBudgetDiv.innerText = "Current Budget: $0";
            }
        } catch (err) {
            console.error("Error loading current budget:", err);
            currentBudgetDiv.innerText = "Current Budget: $0";
        }
    }
    await loadCurrentBudget();

    budgetForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const newBudgetName = budgetNameInput.value.trim();
        const newBudgetValue = parseFloat(budgetInput.value.trim());
        const budgetCategory = budgetCategorySelect.value;

        if (!newBudgetName) {
            alert("Please enter a budget name.");
            return;
        }
        if (isNaN(newBudgetValue) || newBudgetValue < 0) {
            alert("Please enter a valid non-negative budget amount.");
            return;
        }

        try {
            const result = await window.electronAPI.invoke("addBudget", {
                userId,
                newBudgetName,
                newBudgetValue,
                budgetCategory
            });
            console.log("addBudget result:", result);
            if (result.success && result.budget) {
                alert("Budget updated successfully!");
                currentBudgetDiv.innerText = `Current Budget: $${result.budget.amount}`;
                window.location.href = "dashboard.html";
            } else {
                alert("Failed to update budget: " + result.error);
            }
        } catch (err) {
            console.error("Error updating budget:", err);
            alert("Error updating budget: " + err.message);
        }
    });
});

