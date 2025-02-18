/*
 * Name : Cully Stearns
 * Date : 1/31/2025
 * File Name : userBudget.js
 * Course : CMSC 495 Capstone in Computer Science
 * Project : Expense Tracker Capstone Project
 * Description : This module manages the display and updating of the user's budget.
 * It retrieves the logged-in user's budget data from the dashboard via IPC,
 * displays the current budget, and handles the form submission for updating
 * the budget. Client-side validation ensures that only valid data is processed.
 */

//This works
const USD = new Intl.NumberFormat('en-US', {style:'currency', currency:'USD'});
document.addEventListener("DOMContentLoaded", async () => {
    const userId = sessionStorage.getItem("userId");
    const token = sessionStorage.getItem("token");

    if (!userId || !token) {
        console.error("No logged-in user found. Redirecting to login page.");
        window.location.href = "login.html";
        return;
    }
    console.log("User logged in:", userId);


    const currentBudgetDiv = document.getElementById("current-budget");
    const budgetForm = document.getElementById("budget-form");
    const budgetNameInput = document.getElementById("budget-name");
    const budgetInput = document.getElementById("budget-input");


    async function refreshDashboard() {
        try {
            const budgetsData = sessionStorage.getItem("budgets");
            const budgets = budgetsData ? JSON.parse(budgetsData) : [];
            // TODO: remove these logs to keep data more secure
            console.log("Parsed budgets:", budgets);
            const currentBudget = budgets.length ? budgets[budgets.length - 1] : null;
            if (!currentBudget) {
                currentBudgetDiv.innerText = "No Budget Set";
            } else {
                const budgetCurrent = currentBudget.current || 0;
                const budgetSpent = currentBudget.totalAmount || 9999;
                const budgetPercent = budgetSpent > 0 ? 100-(budgetCurrent / budgetSpent) * 100 : 100;
                // TODO: remove these logs to keep data more secure
                //added to check what budget is currently returning
                console.log("check", [currentBudget.current, currentBudget.totalAmount, budgetPercent])
                currentBudgetDiv.innerHTML = `
                    <div id="budget-progress-container">    
                    <progress class="prog-budget" max="100" value="${budgetPercent}" 
                        data-label="Budget - ${USD.format(budgetCurrent)}/${USD.format(budgetSpent)}"></progress>
                    <span class="budget-progress-text">Budget - ${USD.format(budgetCurrent)}/${USD.format(budgetSpent)}</span>
                    </div>
                `;
                const budgetProgressBar = document.querySelector(".prog-budget");
                if (budgetProgressBar) {
                    budgetProgressBar.style.background = `linear-gradient(to right, #721c24 ${budgetPercent}%, #f8d7da ${budgetPercent}%)`;
                    budgetProgressBar.style.transform = `scaleX(-1)`;
                }
            }
        } catch (error) {
            console.error("Error loading dashboard:", error);
            currentBudgetDiv.innerText("No Budget Set.");
        }
    }
    await refreshDashboard();

    budgetForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const newBudgetName = budgetNameInput.value.trim();
        const newBudgetValue = parseFloat(budgetInput.value.trim());
        //const budgetCategory = budgetCategorySelect.value;  // CategoryID from the dropdown

        if (!newBudgetName) {
            alert("Please enter a budget name.");
            return;
        }
        if (isNaN(newBudgetValue) || newBudgetValue < 0) {
            alert("Please enter a valid non-negative budget amount.");
            return;
        }

        const response = await fetch(`/api/transactions/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json();
        let transactions = data.transactions;

        // Get current month and year
        const today = new Date();
        const currentMonth = today.getMonth(); // 0-based (Jan = 0)
        const currentYear = today.getFullYear();
        const currentMonthTransactions = transactions.filter(transaction => {
            const transactionDate = new Date(transaction.date);
            return (
                transactionDate.getMonth() === currentMonth &&
                transactionDate.getFullYear() === currentYear &&
                transaction.type === "expense" // Only sum up expenses
            );
        });
        // Calculate total expense for the current month
        const currentTotal = currentMonthTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);

        console.log("Current Month Expenses Total:", currentTotal);

        try {
            const response = await fetch(`/api/users/${userId}/budgets/add`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: newBudgetName,
                    amount: newBudgetValue,
                    current: currentTotal
                })
            });

            const result = await response.json();
            console.log("addBudget result:", result);

            if (response.ok && result.budget) {
                alert("Budget updated successfully!");
                if (result.budgets) {
                    sessionStorage.setItem("budgets", JSON.stringify(result.budgets));
                } else {
                    let storedBudgets = JSON.parse(sessionStorage.getItem("budgets") || "[]");
                    storedBudgets.push(result.budget);
                    sessionStorage.setItem("budgets", JSON.stringify(storedBudgets));
                }

                window.location.href = "dashboard.html";
            } else {
                alert("Failed to update budget: " + (result.error || "Unknown error"));
            }
        } catch (err) {
            console.error("Error updating budget:", err);
            alert("Error updating budget: " + err.message);
        }
    });

});