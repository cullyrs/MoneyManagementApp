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
const USD = new Intl.NumberFormat('en-US',{style:'currency', currency:'USD'});

document.addEventListener("DOMContentLoaded", async () => {
    //Check user login
    const userId = localStorage.getItem("userId");
    if (!userId) {
        console.error("No logged in user found. Redirecting to login page.");
        window.location.href = "./login.html";
        return;
    }
    console.log("Retrieved userId:", userId);

    const incomeCategories = ["Salary", "Bonus", "Investment", "Custom"];
    const expenseCategories = ["Food", "Transportation", "Entertainment", "Utilities", "Health", "Other", "Custom"];
    const categorySelect = document.getElementById("category");
    const customCategoryContainer = document.getElementById("custom-category-container");
    const incomeButton = document.getElementById("income-button");
    const expenseButton = document.getElementById("expense-button");
    const budgetDisplay = document.getElementById("budget-display");
    const goalDisplay = document.getElementById("goal-display");


    /**
     * Function to populate the category select element with a list of categories.
     * @param {Array.<String>} categories - An array of category names.
     * @returns {void}
     */
    function populateCategories(categories) {
        categorySelect.innerHTML = "";
        categories.forEach((cat) => {
            const option = document.createElement("option");
            option.value = cat.toLowerCase();
            option.textContent = cat;
            categorySelect.appendChild(option);
        });
        categorySelect.value = categories[0].toLowerCase();
    }

    // Custom Category
    categorySelect.addEventListener("change", () => {
        if (categorySelect.value === "custom") {
            customCategoryContainer.style.display = "block";
        } else {
            customCategoryContainer.style.display = "none";
        }
    });

    // Income and expense category: 0 = expense, 1 = income
    let currentType = 0;
    
    /**
     * Function to toggle between income and expense categories.
     * It updates the active button, repopulates the category options, and resets the custom category input.
     *
     * @param {HTMLElement} buttonToActivate - The button element to set as active.
     * @param {HTMLElement} buttonToDeactivate - The button element to remove active styling.
     * @param {Array.<String>} categories - An array of category names to populate.
     * @param {Number} newType - The type indicator (0 for expense, 1 for income).
     * @returns {void}
     */
    function activateButton(buttonToActivate, buttonToDeactivate, categories, newType) {
        buttonToActivate.classList.add("active");
        buttonToDeactivate.classList.remove("active");
        populateCategories(categories);
        currentType = newType;
        customCategoryContainer.style.display = "none";
    }

    incomeButton.addEventListener("click", () => {
        activateButton(incomeButton, expenseButton, incomeCategories, 1);
    });
    expenseButton.addEventListener("click", () => {
        activateButton(expenseButton, incomeButton, expenseCategories, 0);
    });

    populateCategories(expenseCategories);
    expenseButton.classList.add("active");
    customCategoryContainer.style.display = "none";

    const addExpenseButton = document.getElementById("add-expense-button");
    const addExpenseContainer = document.getElementById("add-expense-container");
    const closeExpenseButton = document.getElementById("close-add-expense");


    closeExpenseButton.addEventListener("click", () => {
        addExpenseContainer.classList.remove("active");
    });

    addExpenseButton.addEventListener("click", () => {
        addExpenseContainer.classList.add("active");
        setTimeout(() => {
            const amountInput = document.getElementById("amount");
            if (amountInput) {
                amountInput.focus();
            }
        }, 100);
    });

    const amountInput = document.getElementById("amount");
    const amountValidation = document.getElementById("amount-validation");

    amountInput.addEventListener("input", () => {
        const value = amountInput.value.trim();
        if (value === "") {
            amountValidation.textContent = "";
            return;
        }
        const num = parseFloat(value);
        if (isNaN(num)) {
            amountValidation.textContent = "Please enter a valid numeric amount.";
        } else {
            amountValidation.textContent = "";
        }
    });

    amountInput.addEventListener("blur", () => {
        const value = amountInput.value.trim();
        if (value !== "") {
            const num = parseFloat(value);
            if (!isNaN(num) && num < 0) {
                amountInput.value = Math.abs(num);
                amountValidation.textContent = "";
            }
        }
    });



     /**
     * Function to refresh the dashboard data by retrieving the most recent budget and goal data.
     * It invokes the "getDashboardData" IPC handler with the user's ID and updates the corresponding
     * DOM elements with the retrieved values. If data retrieval fails, an error is logged.
     *
     * @returns {Promise<void>} A promise that resolves when the dashboard is updated.
     */
    
    async function refreshDashboard() {
        console.log("Refreshing dashboard...");
        const result = await window.electronAPI.invoke("getDashboardData", userId);
        if (result.success) {
            const {recentBudget, recentGoal} = result;
            const budgetCurrent = recentBudget ? 50 : 0.00;
            const budgetTarget = recentBudget ? recentBudget._doc.amount.value : 9999.00;
            const goalCurrent = recentGoal ? recentGoal._doc.savedAmount.value : 0.00;
            const goalTarget = recentGoal ? recentGoal._doc.targetAmount.value : 9999.00;

            document.getElementById("budget-display").innerHTML =
                    `<progress class="prog-budget" max="100" value="${(50/budgetTarget)*100}" data-label="Budget - ${USD.format(budgetCurrent)}/${USD.format(budgetTarget)}"></progress>`;
            document.getElementById("goal-display").innerHTML =
                    `<progress class="prog-goal" max="100" value="${(goalCurrent/goalTarget)*100}" data-label="Goal - ${USD.format(goalCurrent)}/${USD.format(goalTarget)}"></progress>`;
            console.log("Dashboard updated:", result);
        } else {
            console.error("Failed to load dashboard data:", result.error);
        }
    }

    await refreshDashboard();
    
    const tableBody = document.getElementById("expense-table-body");
    const tableHeaders = document.querySelectorAll("thead th");

     /**
     * Function to render a table row for a given transaction.
     * It maps the transaction's category ID to a human-readable category name,
     * formats the date and amount, and returns a table row element.
     *
     * @param {Object} transaction - The transaction data object.
     * @returns {HTMLElement} A table row (<tr>) element populated with transaction data.
     */
    function renderTransactionRow(transactions) {
        const row = document.createElement("tr");

        const expenseCategoryMap = {
            0: "Food",
            1: "Transportation",
            2: "Entertainment",
            3: "Utilities",
            4: "Health",
            5: "Other",
            6: "Custom"
        };

        const incomeCategoryMap = {
            0: "Salary",
            1: "Bonus",
            2: "Investment",
            3: "Custom"
        };


        const categoryMap = transactions.type === 1 ? incomeCategoryMap : expenseCategoryMap;

        let categoryDisplay = "Uncategorized";
        if (
                typeof transactions.categoryID === "number" ||
                (typeof transactions.categoryID === "string" && transactions.categoryID.trim() !== "")
                ) {
            const numericCatID = Number(transactions.categoryID);
            categoryDisplay = categoryMap[numericCatID] || "Uncategorized";
        }

        const descriptionDisplay =
                transactions.description && transactions.description.trim() !== ""
                ? transactions.description
                : categoryDisplay;

        let displayDate = transactions.date || "N/A";

        const displayAmount = !isNaN(parseFloat(transactions.amount))
                ? parseFloat(transactions.amount).toFixed(2)
                : "0.00";

        row.innerHTML = `
    <td>${categoryDisplay}</td>
    <td>${descriptionDisplay}</td>
    <td>${displayDate}</td>
    <td>${transactions.type == 1?"":"-"}${USD.format(displayAmount)}</td>
  `;

        return row;
    }

     /**
     * Function to sort an array of objects based on a specified key and order.
     *
     * @param {Array} data - The array of objects to be sorted.
     * @param {String} key - The key of the objects to sort by.
     * @param {String} order - The sort order; either "asc" for ascending or "desc" for descending.
     * @returns {Array} The sorted array.
     */
    function sortData(data, key, order) {
        return data.sort((a, b) => {
            if (a[key] < b[key])
                return order === "asc" ? -1 : 1;
            if (a[key] > b[key])
                return order === "asc" ? 1 : -1;
            return 0;
        });
    }

    const prevMonthBtn = document.getElementById("prev-month");
    const nextMonthBtn = document.getElementById("next-month");
    const monthSelector = document.getElementById("month-selector");

    let currentMonth = new Date().toISOString().slice(0, 7);
    monthSelector.value = currentMonth;

    /**
     * Function to change the currently selected month by a given increment.
     * It updates the global `currentMonth` variable, sets the month selector's value,
     * and refreshes the transaction table.
     *
     * @param {Number} increment - The number of months to add (or subtract if negative).
     * @returns {void}
     */
    function changeMonth(increment) {
        const [year, month] = currentMonth.split("-").map(Number);
        const date = new Date(year, month - 1 + increment);
        currentMonth = date.toISOString().slice(0, 7);
        monthSelector.value = currentMonth;
        refreshTransactionTable();
    }

    monthSelector.addEventListener("change", () => {
        currentMonth = monthSelector.value;
        refreshTransactionTable();
    });

    prevMonthBtn.addEventListener("click", () => {
        changeMonth(-1);
    });

    nextMonthBtn.addEventListener("click", () => {
        changeMonth(1);
    });

    /**
     * Function to refresh the transaction table.
     * It invokes the "getUserTransactions" IPC handler with the user's ID and the currently selected month,
     * filters and sorts the transactions by date, and updates the table body with rendered rows.
     *
     * @returns {Promise<void>} A promise that resolves when the transaction table has been updated.
     */
    async function refreshTransactionTable() {
        if (!tableBody) {
            console.error("tableBody not found in DOM");
            return;
        }
        try {

            const result = await window.electronAPI.invoke("getUserTransactions", userId, currentMonth);
            console.log("getUserTransactions result:", result);
            if (result.success && Array.isArray(result.transactions)) {
                const filteredTransactions = result.transactions.filter(
                        (transaction) => transaction.date && transaction.date.startsWith(currentMonth)
                );

                tableBody.innerHTML = "";
                const sortedTransactions = sortData(filteredTransactions, "date", "desc");
                let x = 0;
                sortedTransactions.forEach((transaction) => {
                    const row = renderTransactionRow(transaction);
                    tableBody.appendChild(row);
                    if(transaction.type == 1) {
                        x+=transaction.amount;
                    } else {
                        x-=transaction.amount;
                    }
                });
                document.getElementById("Income").innerHTML =
                `${new Intl.NumberFormat('en-US',{style:'currency', currency:'USD'}).format(x)}`;
            } else {
                console.error("Failed to load transactions:", result.error);
            }
        } catch (error) {
            console.error("Error refreshing transaction table:", error);
        }
    }

    if (tableHeaders && tableHeaders.length > 0) {
        tableHeaders.forEach((header) => {
            header.addEventListener("click", () => {
                const key = header.getAttribute("data-key");
                const currentOrder = header.getAttribute("data-order") || "asc";
                const newOrder = currentOrder === "asc" ? "desc" : "asc";
                tableHeaders.forEach((h) => h.removeAttribute("data-order"));
                header.setAttribute("data-order", newOrder);

                window.electronAPI.invoke("getUserTransactions", userId).then((result) => {
                    if (result.success && Array.isArray(result.transactions)) {
                        const sortedData = sortData(result.transactions, key, newOrder);
                        tableBody.innerHTML = "";
                        sortedData.forEach((transaction) => {
                            const row = renderTransactionRow(transaction);
                            tableBody.appendChild(row);
                        });
                    }
                });
            });
        });
    } else {
        console.warn("No table headers found to attach sorting events");
    }

    const addExpenseForm = document.querySelector(".add-expense-form");
    if (addExpenseForm) {
        addExpenseForm.addEventListener("submit", handleAddExpense);
    } else {
        console.error("Add expense form not found.");
    }

    const categoryMapFront = {
        food: 0,
        transportation: 1,
        entertainment: 2,
        utilities: 3,
        health: 4,
        other: 5,
        custom: 6
    };

    const incomeCategoryMapFront = {
        salary: 0,
        bonus: 1,
        investment: 2,
        custom: 3
    };

    /**
     * Function to handle the submission of a new transaction (expense or income).
     * It validates the form inputs, constructs a transaction data object, and invokes the "addTransaction" IPC handler.
     * On success, the form is reset and the transaction table is refreshed.
     *
     * @param {Event} event - The submit event object.
     * @returns {Promise<void>} A promise that resolves when the transaction is processed.
     */
    async function handleAddExpense(event) {
        event.preventDefault();

        const categorySelect = document.getElementById("category");
        const customCategoryInput = document.getElementById("custom-category");
        const dateInput = document.getElementById("date");
        const amountInput = document.getElementById("amount");
        const descriptionInput = document.getElementById("description");

        let rawCategory = categorySelect.value.toLowerCase();

        let catID;
        if (currentType === 1) { 

            catID = incomeCategoryMapFront[rawCategory] ?? 0;
        } else {
            catID = categoryMapFront[rawCategory] ?? 0;
        }

        let customCatName = "";

        if ((currentType === 0 && catID === 6) || (currentType === 1 && rawCategory === "custom")) {
            if (customCategoryInput) {
                customCatName = customCategoryInput.value.trim() || "Custom";
            }
        }

        const transactionData = {
            userID: userId,
            amount: parseFloat(amountInput.value),
            type: currentType, 
            date: dateInput.value,
            categoryID: catID,
            customCategory: customCatName,
            description: descriptionInput.value.trim()
        };

        console.log("Transaction data being sent:", transactionData);
        const result = await window.electronAPI.invoke("addTransaction", transactionData);
        if (result.success) {
            alert("Transaction added successfully!");
            addExpenseForm.reset();
            refreshTransactionTable();
        } else {
            alert("Failed to add transaction: " + result.error);
        }
    }
    
    if (budgetDisplay) {
        budgetDisplay.addEventListener("click", () => {
            window.location.href = "budget.html";
        })
    }
    ;
    if (goalDisplay) {
        goalDisplay.addEventListener("click", () => {
            window.location.href = "goal.html";
        })
    }
    ;

    refreshTransactionTable();
});

