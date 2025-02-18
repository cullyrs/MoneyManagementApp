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
const USD = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

document.addEventListener("DOMContentLoaded", async () => {
    // Check if user is logged in
    const userId = sessionStorage.getItem("userId");
    const token = sessionStorage.getItem("token");

    if (!userId || !token) {
        console.error("No logged-in user found. Redirecting to login page.");
        window.location.href = "./login.html";
        return;
    }

    console.log("User logged in:", userId);

    // UI Elements
    const categorySelect = document.getElementById("category");
    // const customCategoryContainer = document.getElementById("custom-category-container"); // DEPRECATED
    const incomeButton = document.getElementById("income-button");
    const expenseButton = document.getElementById("expense-button");
    const budgetDisplay = document.getElementById("budget-display");
    const goalDisplay = document.getElementById("goal-display");
    const addExpenseButton = document.getElementById("add-expense-button");
    const addExpenseContainer = document.getElementById("add-expense-container");
    const closeExpenseButton = document.getElementById("close-add-expense");
    const tableHeaders = document.querySelectorAll("thead th");

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
    function activateButton(activeButton, inactiveButton, categories) {
        activeButton.classList.add("active");
        inactiveButton.classList.remove("active");
        populateCategories(categories);
    }




    incomeButton.addEventListener("click", () => activateButton(incomeButton, expenseButton, incomeCategories, 1));
    expenseButton.addEventListener("click", () => activateButton(expenseButton, incomeButton, expenseCategories, 0));


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
            const budgetsData = sessionStorage.getItem("budgets");
            const goalsData = sessionStorage.getItem("goals");
            const netIncome = sessionStorage.getItem("netbalance");


            // TODO: remove these logs to keep data more secure

            console.log("budgetsData (raw):", budgetsData);
            console.log("goalsData (raw):", goalsData);

        const budgets = budgetsData ? JSON.parse(budgetsData) : [];
        const goals = goalsData ? JSON.parse(goalsData) : [];
        const netbalance = netIncome ? JSON.parse(netIncome) : 0; 



            // TODO: remove these logs to keep data more secure

            console.log("Parsed budgets:", budgets);
            console.log("Parsed goals:", goals);
            



                const currentBudget = budgets.length ? budgets[budgets.length - 1] : null;
                const currentGoal = goals.length ? goals[goals.length - 1] : null;
                const currentLifetimeBalance = document.getElementById("TotalBalance");


                if (!netbalance) {
                    currentLifetimeBalance.innerText = "No display"; // Show a fallback message when balance is unavailable
                } else {
                    currentLifetimeBalance.innerText = `$${netbalance.toFixed(2)}`; // Display the formatted balance
                }

                if (!currentBudget) {
                    budgetDisplay.innerText = "No Budget Set";
                } else {
                    const budgetCurrent = currentBudget.current || 0;
                    const budgetSpent = currentBudget.totalAmount || 9999;
                    const budgetPercent = budgetSpent > 0 ? (budgetCurrent / budgetSpent) * 100 : 0;
                    // TODO: remove these logs to keep data more secure
                    //added to check what budget is currently returning
                    budgetDisplay.innerHTML = `
                        <div id="budget-progress-container">    
                        <progress class="prog-budget" max="100" value="${budgetPercent}" 
                            data-label="Budget - ${USD.format(budgetCurrent)}/${USD.format(budgetSpent)}"></progress>
                        <span class="budget-progress-text">Budget - ${USD.format(budgetCurrent)}/${USD.format(budgetSpent)}</span>
                        </div>
                    `;
                    const budgetProgressBar = document.querySelector(".prog-budget");
                    if (budgetProgressBar) {
                        budgetProgressBar.style.background = `linear-gradient(to right, #721c24 ${budgetPercent}%, #f8d7da ${budgetPercent}%)`;
                    }
                }

                if (!currentGoal) {
                    goalDisplay.innerText = "No goal set.";
                } else {
                    const goalCurrent = currentGoal.savedAmount || 0;
                    const goalTarget = currentGoal.targetAmount || 9999;
                    const goalPercent = goalTarget > 0 ? (goalCurrent / goalTarget) * 100 : 0;
                    goalDisplay.innerHTML = `
                        <div id="goal-progress-container">    
                        <progress class="prog-goal" max="100" value="${goalPercent}" 
                            data-label="Goal - ${USD.format(goalCurrent)}/${USD.format(goalTarget)}"></progress>
                        <span class="goal-progress-text">Goal - ${USD.format(goalCurrent)}/${USD.format(goalTarget)}</span>
                        </div>
                    `;
                    const goalProgressBar = document.querySelector(".prog-goal");
                    if (goalProgressBar) {
                        goalProgressBar.style.background = `linear-gradient(to right, #0c5460 ${goalPercent}%, #d1ecf1 ${goalPercent}%)`;
                        //goalProgressBar.textContent = `Goal - $${goalCurrent}/${goalTarget}`;
                    }
                }
            } catch (error) {
                console.error("Error loading dashboard:", error);
            }
        }

    /** Get Transactions */
    async function getTransactions() {
        const response = await fetch(`/api/transactions/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json();
        let transactions = data.transactions;

        if (!Array.isArray(transactions)) {
            console.error("Transactions data is not an array:", transactions);
            return;
        }
        return transactions;
    }

    /** Refresh Transactions Table */
    async function refreshTransactionTable() {
    const tableBody = document.getElementById("expense-table-body");

    try {
        const response = await fetch(`/api/transactions/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json();
        const transactions = data.transactions;

        if (!Array.isArray(transactions)) {
            console.error("Transactions data is not an array:", transactions);
            return;
        }

        // Sort transactions by month/year using currentMonth (formatted "YYYY-MM")
        const [selectedYear, selectedMonth] = currentMonth.split("-").map(Number);
        console.log(`Filtering transactions for: ${selectedMonth}/${selectedYear}`);

        // Filter transactions for the selected month/year
        const filteredTransactions = transactions.filter(transaction => {
            if (!transaction.date) return false;
            const transactionDate = new Date(transaction.date);
            const transactionYear = transactionDate.getFullYear();
            const transactionMonth = transactionDate.getMonth() + 1; // JavaScript months are 0-indexed
            return transactionYear === selectedYear && transactionMonth === selectedMonth;
        });

        console.log("Filtered transactions:", filteredTransactions);

        // Calculate Monthly Balance
        let totalIncome = 0;
        let totalExpense = 0;

        filteredTransactions.forEach(transaction => {
            const amt = Number(transaction.amount);
            // Assuming transactions with type "income" are income; everything else is expense.
            if (transaction.type && transaction.type.toLowerCase() === "income") {
                totalIncome += amt;
            } else {
                totalExpense += amt;
            }
        });

        const monthlyBalance = totalIncome - totalExpense;
        const monthBalanceEl = document.getElementById("Income");
        if (monthBalanceEl) {
            monthBalanceEl.innerText = `$${monthlyBalance.toFixed(2)}`;
        }

        if (filteredTransactions.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align: center;">No transactions found for this month.</td>
                </tr>
            `;
            return;
        }

        // Sort the filtered transactions by date in descending order
        const sortedTransactions = sortData(filteredTransactions, "date", "desc");

        // Update the header for the default sorting
        const dateHeader = document.querySelector('thead th[data-key="date"]');
        if (dateHeader) {
            dateHeader.setAttribute("data-order", "desc");
        }

        // Render the sorted transactions in the table
        renderTableRows(sortedTransactions);
    } catch (error) {
        console.error("Error fetching transactions:", error);
    }
}



    // needed to get correct date format. Was getting -1 day
    function formatDate(dateString) {
        if (!dateString) return "Invalid Date"; // potential undefined values handling
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "Invalid Date"; // Check for invalid date

        return new Intl.DateTimeFormat("en-US", { timeZone: "UTC" }).format(date);
    }

    /** Render Table Rows */
        function renderTableRows(data) {
            const tableBody = document.getElementById("expense-table-body");
            console.error("checking category", data)
        tableBody.innerHTML = data.map(transaction => `
                <tr>
                    <td>${transaction.category?.name || "Uncategorized"}</td>
                    <td>${transaction.description || ""}</td>
                    <td>${formatDate(transaction.date)}</td>
                    <td>$${transaction.amount.toFixed(2)}</td>
                </tr>
            `).join("");
        }

    /** Sort Data */
    const sortData = (data, key, order) => {
        return data.sort((a, b) => {
            let valA = a[key];
            let valB = b[key];

            // Handle category name sorting
            if (key === "category" && valA && valB) {
                valA = valA.name.toLowerCase(); // Convert to lowercase for case-insensitive sorting
                valB = valB.name.toLowerCase();
            }

            // Handle date sorting
            if (key === "date") {
                valA = new Date(valA);
                valB = new Date(valB);
            }

            // Handle description sorting (case-insensitive)
            if (key === "description" && valA && valB) {
                valA = valA.toLowerCase();
                valB = valB.toLowerCase();
            }

            // Handle numeric sorting for amount
            if (key === "amount") {
                valA = parseFloat(valA);
                valB = parseFloat(valB);
            }

            // Sort ascending or descending
            if (valA < valB) return order === "asc" ? -1 : 1;
            if (valA > valB) return order === "asc" ? 1 : -1;
            return 0;
        });
    };


    /** Handle Header Clicks for Sorting */
    async function setupTableSorting() {
        const tableHeaders = document.querySelectorAll("[data-key]"); // Select all sortable headers

        try {
            for (const header of tableHeaders) {
                header.addEventListener("click", async () => {
                    let transactions = await getTransactions();
                    console.log("Testing transactions:", transactions);
                    const [selectedYear, selectedMonth] = monthSelector.value.split("-").map(Number); 

                    console.log(`Filtering transactions for: ${selectedMonth}/${selectedYear}`);

                    const filteredTransactions = transactions.filter(transaction => {
                        if (!transaction.date) return false;

                        const transactionDate = new Date(transaction.date);
                        const transactionYear = transactionDate.getFullYear();
                        const transactionMonth = transactionDate.getMonth() + 1;

                        return transactionYear === selectedYear && transactionMonth === selectedMonth;
                    });
                    const key = header.getAttribute("data-key");
                    const currentOrder = header.getAttribute("data-order") || "asc";
                    const newOrder = currentOrder === "asc" ? "desc" : "asc";

                    tableHeaders.forEach((h) => h.removeAttribute("data-order"));
                    header.setAttribute("data-order", newOrder);

                    const sortedData = sortData(filteredTransactions, key, newOrder);
                    renderTableRows(sortedData);
                });
            }
        } catch (error) {
            console.error("Error found in setupTableSorting:", error);
        }
    }
    setupTableSorting();
    /** Month Navigation Controls */
    const prevMonthBtn = document.getElementById("prev-month");
    const nextMonthBtn = document.getElementById("next-month");
    const monthSelector = document.getElementById("month-selector");

    let currentMonth = new Date().toISOString().slice(0, 7);
    monthSelector.value = currentMonth;
    /**
 * Change selected month by increment
 */
    function changeMonth(increment) {
        const [year, month] = currentMonth.split("-").map(Number);
        const date = new Date(year, month - 1 + increment);
        currentMonth = date.toISOString().slice(0, 7);
        monthSelector.value = currentMonth;
        console.log("changeMonth", monthSelector.value)
        refreshTransactionTable();
    }

    // Event Listeners for Month Selection
    monthSelector.addEventListener("change", () => {
        currentMonth = monthSelector.value;
        refreshTransactionTable();
    });

    prevMonthBtn.addEventListener("click", () => changeMonth(-1));
    nextMonthBtn.addEventListener("click", () => changeMonth(1));

    /** Handle Adding a Transaction */
    async function handleAddTransaction(event) {
        event.preventDefault();

        const userID = sessionStorage.getItem("userId");
        const token = sessionStorage.getItem("token");

        const dateInput = document.getElementById("date").value;
        const amount = parseFloat(document.getElementById("amount").value);
        const categorySelect = document.getElementById("category");
        const categoryId = categorySelect.value; //  stores ObjectId
        const description = document.getElementById("description").value.trim() ||
            categorySelect.options[categorySelect.selectedIndex].text;
        // const customCategoryInput = document.getElementById("custom-category");

        // const customCategory = (categoryId === "custom" && customCategoryInput) ? customCategoryInput.value.trim() : "";

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
        // TODO: remove these logs to keep data more secure
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

    // Ensure Expense is the default active selection
    expenseButton.classList.add("active");
    incomeButton.classList.remove("active");

    // Initialize Dashboard
    await fetchCategories();
    await refreshDashboard();
    await refreshTransactionTable();
});
