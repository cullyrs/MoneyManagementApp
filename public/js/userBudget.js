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
    const budgetCategorySelect = document.getElementById("budget-category");


    async function refreshDashboard() {
        try {

            const budgetsData = sessionStorage.getItem("budgets");
            const budgets = budgetsData ? JSON.parse(budgetsData) : [];
            console.log("Parsed budgets:", budgets);
            
            const currentBudget = budgets.length ? budgets[budgets.length - 1] : null;
            
            if (!currentBudget) {
                currentBudgetDiv.innerText = "Current Budget: $0";
            } else {
                const budgetCurrent = currentBudget.current || currentBudget.amount || 0;
                const budgetTarget = currentBudget.target || currentBudget.totalAmount || 0;
                const budgetPercent = budgetTarget > 0 ? (budgetCurrent / budgetTarget) * 100 : 0;
                currentBudgetDiv.innerHTML = `
                    <progress class="prog-budget" max="100" value="${budgetPercent}" 
                        data-label="Budget - $${budgetCurrent}/${budgetTarget}"></progress>
                `;
            }
        } catch (error) {
            console.error("Error loading dashboard:", error);
        }
    }

    async function fetchCategories() {
        try {
            const response = await fetch(`/api/categories`, {
                headers: { Authorization: `Bearer ${token}` }
            });
    
            if (!response.ok) {
                console.error("Failed to fetch categories:", response.statusText);
                return;
            }
    
            const categories = await response.json(); // Directly get the array
    
            if (!Array.isArray(categories) || categories.length === 0) {
                console.error("No categories returned from API.");
                return;
            }
    
            populateCategories(categories);
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    }
    

    function populateCategories(categories) {
        budgetCategorySelect.innerHTML = categories
            .map(cat => `<option value="${cat.categoryID}">${cat.name}</option>`)
            .join("");
    }

    await fetchCategories();

    budgetForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const newBudgetName = budgetNameInput.value.trim();
        const newBudgetValue = parseFloat(budgetInput.value.trim());
        const budgetCategory = budgetCategorySelect.value;  // CategoryID from the dropdown

        if (!newBudgetName) {
            alert("Please enter a budget name.");
            return;
        }
        if (isNaN(newBudgetValue) || newBudgetValue < 0) {
            alert("Please enter a valid non-negative budget amount.");
            return;
        }

        try {
            const response = await fetch(`/api/users/${userId}/budgets/add`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: newBudgetName,
                    amount: newBudgetValue,
                    categoryID: budgetCategory
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

