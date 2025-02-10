/**
 * Name : Cully Stearns
 * Contributors : Naeem
 * Date : 1/31/2025
 * File Name : userDashBoard.js
 * Course : CMSC 495 Capstone in Computer Science
 * Project : Expense Tracker Capstone Project
 * Description : This module manages the user dashboard functionalities.
 * It verifies that the user is logged in, displays dashboard data 
 * such as budgets and goals, renders and sorts the transaction table,
 * and handles UI interactions for switching between income and expense 
 * categories, as well as adding new transactions.
 */

document.addEventListener("DOMContentLoaded", async () => {
    // Check if user is logged in
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");

    if (!userId || !token) {
        console.error("No logged-in user found. Redirecting to login page.");
        window.location.href = "./login.html";
        return;
    }

    console.log("User logged in:", userId);

    // UI Elements
    const categorySelect = document.getElementById("category");
    const customCategoryContainer = document.getElementById("custom-category-container");
    const incomeButton = document.getElementById("income-button");
    const expenseButton = document.getElementById("expense-button");
    const budgetDisplay = document.getElementById("budget-display");
    const goalDisplay = document.getElementById("goal-display");
    const addExpenseButton = document.getElementById("add-expense-button");
    const addExpenseContainer = document.getElementById("add-expense-container");
    const closeExpenseButton = document.getElementById("close-add-expense");

    let currentType = 0; // 0 = Expense, 1 = Income
    let incomeCategories = [];
    let expenseCategories = [];

   /** Fetch Categories from DB */
async function fetchCategories() {
    try {
        const response = await fetch("/api/categories", {
            headers: { Authorization: `Bearer ${token}` }
        });

        const categories = await response.json();

        // **Store category names & ObjectId for later**
        incomeCategories = categories
            .filter(cat => cat.type === "income")
            .map(cat => ({ id: cat._id, name: cat.name })); // Store ObjectId & Name

        expenseCategories = categories
            .filter(cat => cat.type === "expense")
            .map(cat => ({ id: cat._id, name: cat.name }));

        // Populate initial categories (Expense is default)
        populateCategories(expenseCategories);
    } catch (error) {
        console.error("Error fetching categories:", error);
    }
}

 /** Populate Category Dropdown */
function populateCategories(categories) {
    categorySelect.innerHTML = categories
        .map(cat => `<option value="${cat.id}">${cat.name}</option>`) // Use ObjectId as value
        .join("");
}

    /** Toggle Between Income & Expense */
    function activateButton(activeButton, inactiveButton, categories, newType) {
        activeButton.classList.add("active");
        inactiveButton.classList.remove("active");
        populateCategories(categories);
        currentType = newType;
        customCategoryContainer.style.display = "none";
    }

    incomeButton.addEventListener("click", () => activateButton(incomeButton, expenseButton, incomeCategories, 1));
    expenseButton.addEventListener("click", () => activateButton(expenseButton, incomeButton, expenseCategories, 0));

    categorySelect.addEventListener("change", () => {
        customCategoryContainer.style.display = categorySelect.value === "custom" ? "block" : "none";
    });

    closeExpenseButton.addEventListener("click", () => {
        addExpenseContainer.classList.remove("active");
    });

    addExpenseButton.addEventListener("click", () => {
        addExpenseContainer.classList.add("active");
        setTimeout(() => document.getElementById("amount").focus(), 100);
    });

    /** Validate Amount Input */
    const amountInput = document.getElementById("amount");
    const amountValidation = document.getElementById("amount-validation");

    amountInput.addEventListener("input", () => {
        amountValidation.textContent = isNaN(parseFloat(amountInput.value.trim()))
            ? "Please enter a valid number."
            : "";
    });

    amountInput.addEventListener("blur", () => {
        let value = parseFloat(amountInput.value.trim());
        if (!isNaN(value) && value < 0) amountInput.value = Math.abs(value);
    });

    /** Refresh Dashboard Data */
    async function refreshDashboard() {
        try {
            const response = await fetch(`/api/users/${userId}/dashboard`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const { budget, goal } = await response.json();

            budgetDisplay.innerHTML = `
                <progress class="prog-budget" max="100" value="${(budget.current / budget.target) * 100}" 
                    data-label="Budget - $${budget.current}/${budget.target}"></progress>
            `;

            goalDisplay.innerHTML = `
                <progress class="prog-goal" max="100" value="${(goal.current / goal.target) * 100}" 
                    data-label="Goal - $${goal.current}/${goal.target}"></progress>
            `;
        } catch (error) {
            console.error("Error loading dashboard:", error);
        }
    }

    /** Refresh Transactions Table */
    async function refreshTransactionTable() {
        const tableBody = document.getElementById("expense-table-body");
    
        try {
            const response = await fetch(`/api/transactions/${userId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
    
            const { transactions } = await response.json(); //get transactions array
    
            console.log("Transactions Received:", transactions); //Debugging
    
            if (!Array.isArray(transactions)) {
                console.error("Transactions data is not an array:", transactions);
                return;
            }
    
            tableBody.innerHTML = transactions.map(transaction => `
                <tr>
                    <td>${transaction.category?.name || "Uncategorized"}</td>  <!-- somehow fixed category Name -->
                    <td>${transaction.description || ""}</td>
                    <td>${new Date(transaction.date).toLocaleDateString()}</td>
                    <td>$${transaction.amount.toFixed(2)}</td>
                </tr>
            `).join("");
    
        } catch (error) {
            console.error("Error fetching transactions:", error);
        }
    }
    
/** Handle Adding a Transaction */
async function handleAddTransaction(event) {
    event.preventDefault();

    const userID = localStorage.getItem("userId");
    const token = localStorage.getItem("token");

    const dateInput = document.getElementById("date").value;
    const amount = parseFloat(document.getElementById("amount").value);
    const categoryId = document.getElementById("category").value; //  stores ObjectId
    const description = document.getElementById("description").value.trim();
    const customCategoryInput = document.getElementById("custom-category");

    const customCategory = (categoryId === "custom" && customCategoryInput) ? customCategoryInput.value.trim() : "";

    // get transaction type Expense or Income
    const type = (document.getElementById("income-button").classList.contains("active")) ? "income" : "expense";

    if (isNaN(amount) || amount <= 0) {
        alert("Enter a valid amount.");
        return;
    }
    if (!dateInput) {
        alert("Please enter a date.");
        return;
    }
    if (!categoryId || (categoryId === "custom" && !customCategory)) {
        alert("Please select or enter a category.");
        return;
    }

    // Prepare transaction data
    const transactionData = {
        userID,
        amount,
        type,
        date: dateInput,
        category: categoryId, // ObjectId from DB
        description,
        version: 1,
    };

    // Log data to debug
    console.log("Transaction Data Being Sent:", JSON.stringify(transactionData, null, 2));

    try {
        // **Send the transaction request**
        const response = await fetch("/api/transactions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(transactionData),
        });

        // Check response status
        console.log("Server Response Status:", response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Server Response Body:", errorText);
            throw new Error(`Failed to add transaction. Server Response: ${errorText}`);
        }

        alert("Transaction added successfully!");
        document.querySelector(".add-expense-form").reset();
        refreshTransactionTable();
    } catch (error) {
        console.error("Error adding transaction:", error);
    }
}






    document.querySelector(".add-expense-form").addEventListener("submit", handleAddTransaction);

    /** Redirects */
    if (budgetDisplay) budgetDisplay.addEventListener("click", () => window.location.href = "budget.html");
    if (goalDisplay) goalDisplay.addEventListener("click", () => window.location.href = "goal.html");

    // Initialize Dashboard
    await fetchCategories();
    await refreshDashboard();
    await refreshTransactionTable();
});
