/**
 * Name : Cully Stearns
 * Contributors : 
 * Date : 1/31/2025
 * File Name : userGoal.js
 * Course : CMSC 495 Capstone in Computer Science
 * Project : Expense Tracker Capstone Project
 * Description  : This module manages the user's goal functionality within the
 * Expense Tracker application. It retrieves the logged-in user's
 * current goal, displays it on the page, and handles form submission
 * for updating the goal, ensuring that only valid goal data is processed.
 */

// HAVE NOT UPDATED YET
document.addEventListener("DOMContentLoaded", async () => {
    
    const userId = localStorage.getItem("userId");
    if (!userId) {
        alert("You must be logged in to update your goal.");
        window.location.href = "login.html";
        return;
    }
    console.log("Logged-in userId:", userId);

    const currentGoalDiv = document.getElementById("current-goal");
    const goalForm = document.getElementById("goal-form");
    const goalInput = document.getElementById("goal-input");
    const goalNameInput = document.getElementById("goal-name");

        /**
     * Asynchronously loads the current goal for the logged-in user.
     * It invokes the "getDashboardData" IPC handler and updates the goal display element
     * with the retrieved goal information.
     *
     * @async
     * @function loadCurrentGoal
     * @returns {Promise<void>} Resolves when the goal data is loaded and the display is updated.
     * If no goal is found or an error occurs, a default message is displayed.
     */
    async function loadCurrentGoal() {
        try {
            const result = await window.electronAPI.invoke("getDashboardData", userId);
            console.log("Dashboard data:", result);
            if (result.success && result.recentGoal) {
                const goal = result.recentGoal;
                currentGoalDiv.innerText = `Current Goal: ${goal.name || "Unnamed"} - $${goal.savedAmount || 0}/${goal.targetAmount || "9,999"}`;
            } else {
                currentGoalDiv.innerText = "Current Goal: $0/9,999";
            }
        } catch (err) {
            console.error("Error loading goal:", err);
            currentGoalDiv.innerText = "Current Goal: $0/9,999";
        }
    }

    await loadCurrentGoal();

    /**
     * Asynchronous event handler for goal update form submission.
     * It retrieves and validates the new goal name and target value from the form,
     * then invokes the "addGoal" IPC handler with the provided data.
     * On success, it updates the goal display and redirects the user to the dashboard.
     *
     * @async
     * @function (anonymous) - goal form submit handler.
     * @param {Event} e - The form submission event.
     * @returns {Promise<void>} Resolves when the goal update process is complete.
     */
    goalForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const newGoalValue = parseFloat(goalInput.value.trim());
        const newGoalName = goalNameInput.value.trim();
        if (!newGoalName) {
            alert("Please enter a goal name.");
            return;
        }
        if (isNaN(newGoalValue) || newGoalValue <= 0) {
            alert("Please enter a valid goal target.");
            return;
        }
        try {
            const result = await window.electronAPI.invoke("addGoal", {userId, newGoalName, newGoalValue});
            console.log("updateGoal result:", result);
            if (result.success && result.goal) {
                alert("Goal updated successfully!");
                currentGoalDiv.innerText = `Current Goal: ${result.goal.name || "Unnamed"}
                     - $${result.goal.savedAmount || 0}/${result.goal.targetAmount || "9,999"}`;
                window.location.href = "dashboard.html";
            } else {
                alert("Failed to update goal: " + result.error);
            }
        } catch (err) {
            console.error("Error updating goal:", err);
            alert("Error updating goal: " + err.message);
        }
    });
});


