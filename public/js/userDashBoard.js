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
        showAlert("Please log in to view this page.", "error");
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
    const cancelExpenseButton = document.getElementById("cancel-transaction");
    const dateInput = document.getElementById("date");

    // const tableHeaders = document.querySelectorAll("thead th"); // not in use?
    async function showAlert(message, type) {
        // Function to hide alert smoothly
        function closeAlert(alertBox) {
            alertBox.classList.remove("show");
            setTimeout(() => alertBox.remove(), 500);
        }

        fetch("/api/alert", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message, type }),
        })
            .then(response => response.text())
            .then(alertHtml => {
                document.body.insertAdjacentHTML("beforeend", alertHtml);

                const alertBox = document.querySelector(".alert-container:last-of-type");
                if (!alertBox) return;

                // Show alert
                setTimeout(() => {
                    alertBox.classList.add("show");
                }, 100);

                // Auto-hide alert after 5 seconds
                setTimeout(() => closeAlert(alertBox), 5000);

                // Close button functionality
                //alertBox.querySelector("#alert-close").addEventListener("click", () => closeAlert(alertBox));
            })
            .catch(error => {
                console.error("Error triggering alert:", error);
            });
    }




    const today = new Date().toISOString().split("T")[0]; // set today's date
    dateInput.value = today;

    let incomeCategories = [];
    let expenseCategories = [];

    /** Fetch Categories from DB */
    async function fetchCategories() {
        try {
            const response = await fetch("/api/categories");

            const categories = await response.json();

            // Store category names & ObjectId for later
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
        const categorySelect = document.getElementById("category");

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

    document.addEventListener("click", (event) => {
        const isInsideMenu = addExpenseContainer.contains(event.target);
        const isButtonClick = event.target === addExpenseButton;
        const isTableRow = event.target.closest("tr");

        if (!isInsideMenu && !isButtonClick && !isTableRow && addExpenseContainer.classList.contains("active")) {
            closeExpenseMenu(true);
        }
    });

    function closeExpenseMenu(resetForm = false) {
        addExpenseContainer.classList.remove("active");

        // if resetForm is true, clear the form fields, else keep the data
        if (resetForm) {
            document.querySelector(".add-expense-form").reset();
            const today = new Date().toISOString().split("T")[0];
            dateInput.value = today;
            expenseButton.classList.add("active");
            incomeButton.classList.remove("active");
            populateCategories(expenseCategories); // Show expense categories
        }

        // Reset Buttons
        document.getElementById("edit-transaction").style.display = "none";
        document.getElementById("delete-transaction").style.display = "none";
        document.getElementById("submit").style.display = "inline-block";
    }

    cancelExpenseButton.addEventListener("click", () => closeExpenseMenu(true));
    closeExpenseButton.addEventListener("click", () => closeExpenseMenu(true));


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




    // Hide edit & delete buttons initially
    document.getElementById("edit-transaction").style.display = "none";
    document.getElementById("delete-transaction").style.display = "none";

    // only up to 2 decimal places to be typed in the amount field
    document.getElementById("amount").addEventListener("input", function (event) {
        let value = event.target.value;
        if (!/^\d*\.?\d{0,2}$/.test(value)) {
            event.target.value = value.slice(0, -1); // Remove last invalid character
        }
    });


    /** Detect Click on Transaction Rows & Open Edit Menu */
    document.getElementById("expense-table-body").addEventListener("click", async (event) => {
        const row = event.target.closest("tr");
        if (!row) return;

        // Extract values from the clicked row
        const transactionId = row.getAttribute("data-transaction-id");
        const categoryName = row.cells[0].textContent.trim();
        const description = row.cells[1].textContent.trim();
        const date = row.cells[2].textContent.trim();
        let amount = parseFloat(row.cells[3].textContent.replace("$", "").trim()).toFixed(2); // remove $ sign and parse as float

        if (!transactionId) {
            console.error("Transaction ID missing from row");
            return;
        }

        // Check if Transaction is Income or Expense
        const transactionType = row.getAttribute("data-transaction-type");
        const isIncome = transactionType === "income";

        // toggle active Button Based on Type: Income or Expense
        if (isIncome) {
            incomeButton.classList.add("active");
            expenseButton.classList.remove("active");
            populateCategories(incomeCategories); // Show income categories
        } else {
            amount = Math.abs(amount).toFixed(2); // Remove negative sign if expense
            expenseButton.classList.add("active");
            incomeButton.classList.remove("active");
            populateCategories(expenseCategories); // Show expense categories
        }

        // Ensure Category Field is Correctly Selected
        const categorySelect = document.getElementById("category");
        let categoryId = null;

        // Find category ObjectId from the fetched categories list
        const allCategories = [...incomeCategories, ...expenseCategories];
        const matchedCategory = allCategories.find(cat => cat.name === categoryName);

        if (matchedCategory) {
            categoryId = matchedCategory.id;
        }

        // Pre-fill the form with transaction data
        categorySelect.value = categoryId || ""; // Default to empty if not found
        document.getElementById("date").value = new Date(date).toISOString().split("T")[0];
        document.getElementById("amount").value = amount;
        document.getElementById("description").value = description;

        // Store transaction ID for edits/deletion
        document.getElementById("edit-transaction").setAttribute("data-transaction-id", transactionId);
        document.getElementById("delete-transaction").setAttribute("data-transaction-id", transactionId);

        // Show Edit/Delete Buttons & Hide Submit
        document.getElementById("edit-transaction").style.display = "inline-block";
        document.getElementById("delete-transaction").style.display = "inline-block";
        document.getElementById("submit").style.display = "none";

        // Slide In Transaction Menu Like Add Button
        addExpenseContainer.classList.add("active");
        setTimeout(() => document.getElementById("amount").focus(), 100);
    });


    document.getElementById("delete-transaction").addEventListener("click", async () => {
        const transactionId = document.getElementById("delete-transaction").getAttribute("data-transaction-id");
        const userId = sessionStorage.getItem("userId");

        // Wait for confirmation
        const confirmed = confirm("Are you sure you want to delete this transaction?");

        if (!confirmed) return; // Stop execution if user cancels

        try {
            const response = await fetch(`/api/transactions/${userId}/${transactionId}`, {
                method: "DELETE",
            });

            if (!response.ok) throw new Error("Failed to delete transaction.");

            showAlert("Transaction deleted successfully!", "success");
            document.getElementById("add-expense-container").classList.remove("active");
            refreshTransactionTable(); // Refresh the table after deleting
        } catch (error) {
            console.error("Error deleting transaction:", error);
            showAlert("Error deleting transaction. Please try again.", "error");
        }
    });

    document.getElementById("edit-transaction").addEventListener("click", async () => {
        const transactionId = document.getElementById("edit-transaction").getAttribute("data-transaction-id");
        const userId = sessionStorage.getItem("userId");


        // Get updated form values
        const updatedTransaction = {
            category: document.getElementById("category").value,
            date: document.getElementById("date").value,
            amount: parseFloat(document.getElementById("amount").value),
            description: document.getElementById("description").value.trim(),
        };

        try {
            const response = await fetch(`/api/transactions/${userId}/${transactionId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updatedTransaction),
            });

            if (!response.ok) throw new Error("Failed to update transaction.");

            showAlert("Transaction updated successfully!", "success");
            document.getElementById("add-expense-container").classList.remove("active");
            refreshTransactionTable();
        } catch (error) {
            console.error("Error updating transaction:", error);
        }
    });


    /** Refresh Dashboard Data */
    async function refreshDashboard() {
        try {
            const userId = sessionStorage.getItem("userId");
            const token = sessionStorage.getItem("token");
            const selectedMonth = document.getElementById("month-selector").value;

            let currentBudget = null;
            let currentGoal = null;
            let transactions = [];


            // Fetch Budget for the selected month
            try {
                const budgetResponse = await fetch(`/api/dashboard/${userId}/budgets/${selectedMonth}`);
                if (budgetResponse.ok) {
                    const budgetResult = await budgetResponse.json();
                    currentBudget = budgetResult.success ? budgetResult.budget : null;
                }
            } catch (error) {
                console.error("Error fetching budget:", error);
                budgetDisplay.innerText = "No Budget Set";
                goalDisplay.innerText = "No Goal Set";
            }

            // Fetch Goal for the selected month
            try {
                const goalResponse = await fetch(`/api/dashboard/${userId}/goals/${selectedMonth}`);
                if (goalResponse.ok) {
                    const goalResult = await goalResponse.json();
                    currentGoal = goalResult.success ? goalResult.goal : null;
                }
            } catch (error) {
                console.error("Error fetching goal:", error);
                budgetDisplay.innerText = "No Budget Set";
                goalDisplay.innerText = "No Goal Set";
            }
            // Fetch transactions
            try {
                const response = await fetch(`/api/transactions/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (response.ok) {
                    const data = await response.json();
                    transactions = Array.isArray(data.transactions) ? data.transactions : [];
                }
            } catch (error) {
                console.error("Error fetching transactions:", error);
            }


            // Compute total income and expenses for the selected month
            let totalIncome = 0;
            let totalExpense = 0;
            if (transactions.length > 0) {
                transactions.forEach(transaction => {
                    if (transaction.date.startsWith(selectedMonth)) {
                        if (transaction.type === "income") {
                            totalIncome += transaction.amount;
                        } else {
                            totalExpense += transaction.amount;
                        }
                    }
                });
            }

            // Store in sessionStorage for later use
            sessionStorage.setItem(`income_${selectedMonth}`, totalIncome.toFixed(2));
            sessionStorage.setItem(`expense_${selectedMonth}`, totalExpense.toFixed(2));

            console.log("Total Income:", totalIncome);
            console.log("Total Expense:", totalExpense);
            if (currentBudget) {
                currentBudget.current = totalExpense;
            }
            if (currentGoal) {
                currentGoal.current = totalIncome;
            }
            // Fetch and update budgets and goals
            // const budgetsData = sessionStorage.getItem("budgets");
            // const goalsData = sessionStorage.getItem("goals");
            const netIncome = sessionStorage.getItem("netbalance");

            // const budgets = budgetsData ? JSON.parse(budgetsData) : {};
            // const goals = goalsData ? JSON.parse(goalsData) : {};

            const netbalance = netIncome ? JSON.parse(netIncome) : 0;
            const currentLifetimeBalance = document.getElementById("TotalBalance");
            currentLifetimeBalance.innerText = netbalance ? `Lifetime Balance: ${USD.format(netbalance)}` : "No display";


            if (!currentBudget) {
                budgetDisplay.innerText = "No Budget Set";
            } else {
                const budgetCurrent = totalExpense;
                const budgetSpent = currentBudget.totalAmount || 0;
                const budgetPercent = budgetSpent > 0 ? (budgetCurrent / budgetSpent) * 100 : 0;

                budgetDisplay.innerHTML = `
                <span class="budget-progress-text">Budget - ${USD.format(budgetCurrent)} / ${USD.format(budgetSpent)}</span>
                <progress class="prog-budget" max="100" value="${budgetPercent}"></progress>
            `;
                const budgetProgressBar = document.querySelector(".prog-budget");
                if (budgetProgressBar) {
                    budgetProgressBar.style.transform = `scaleX(-1)`;
                }
            }

            if (!currentGoal) {
                goalDisplay.innerText = "No goal set.";
            } else {
                const goalCurrent = totalIncome;
                const goalTarget = currentGoal.totalAmount || 0;
                const goalPercent = goalTarget > 0 ? (goalCurrent / goalTarget) * 100 : 0;

                goalDisplay.innerHTML = `
                <span class="goal-progress-text">Goal - ${USD.format(goalCurrent)} / ${USD.format(goalTarget)}</span>
                <progress class="prog-goal" max="100" value="${goalPercent}"></progress>
            `;
            }
        } catch (error) {
            console.error("Error loading dashboard:", error);
        }
    }


    /** Get Transactions */
    async function getTransactions() {
        const userId = sessionStorage.getItem("userId");
        const token = sessionStorage.getItem("token");
        try {
            const response = await fetch(`/api/transactions/${userId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) throw new Error("Failed to fetch transactions.");
            const data = await response.json();
            return Array.isArray(data.transactions) ? data.transactions : [];
        } catch (error) {
            console.error("Error fetching transactions:", error);
            return [];
        }
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
                if (transaction.type && String(transaction.type).toLowerCase() === "income") {
                    totalIncome += amt;
                } else {
                    totalExpense += amt;
                }
            });

            const monthlyBalance = totalIncome - totalExpense;
            const monthBalanceEl = document.getElementById("Income");
            if (monthBalanceEl) {
                monthBalanceEl.innerText = `Monthly Balance: ${USD.format(monthlyBalance)}`;
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
            refreshDashboard();
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

        // tranaction id added to each row for future useg
        tableBody.innerHTML = data.map(transaction => {
            const isIncome = String(transaction.type).toLowerCase() === "income";
            const amountClass = isIncome ? "income-amount" : "expense-amount";
            const formattedAmount = `${isIncome ? "" : "-"}$${transaction.amount.toFixed(2)}`; // Add negative sign for expenses

            return `
                <tr data-transaction-id="${transaction._id}" data-transaction-type="${transaction.type}">
                    <td>${transaction.category?.name || "Uncategorized"}</td>
                    <td>${transaction.description || ""}</td>
                    <td>${formatDate(transaction.date)}</td>
                    <td class="${amountClass}">${formattedAmount}</td>
                </tr>
            `;
        }).join("");

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

        //reset sort indicators
        const tableHeaders = document.querySelectorAll("[data-key]");
        tableHeaders.forEach(header => header.removeAttribute("data-order"));

        refreshTransactionTable();
    }

    // Event Listeners for Month Selection
    monthSelector.addEventListener("change", () => {
        currentMonth = monthSelector.value;

        // reset
        const tableHeaders = document.querySelectorAll("[data-key]");
        tableHeaders.forEach(header => header.removeAttribute("data-order"));

        refreshTransactionTable();
    });

    prevMonthBtn.addEventListener("click", () => changeMonth(-1));
    nextMonthBtn.addEventListener("click", () => changeMonth(1));

    /** Handle Adding a Transaction */
    async function handleAddTransaction(event) {
        event.preventDefault();

        const budgetsData = sessionStorage.getItem("budgets");
        const goalsData = sessionStorage.getItem("goals");
        const budgets = budgetsData ? JSON.parse(budgetsData) : {};
        const goals = goalsData ? JSON.parse(goalsData) : {};


        const userID = sessionStorage.getItem("userId");
        const token = sessionStorage.getItem("token");
        const selectedMonth = document.getElementById("month-selector").value;

        const dateInput = document.getElementById("date").value;
        const amount = parseFloat(document.getElementById("amount").value);
        const categorySelect = document.getElementById("category");
        const categoryId = categorySelect.value;
        const description = document.getElementById("description").value.trim() || categorySelect.options[categorySelect.selectedIndex].text;
        const type = document.getElementById("income-button").classList.contains("active") ? "income" : "expense";
        const dateInputField = document.getElementById("date");
        const dateInputValue = dateInputField.value;
        const categoryInputValue = categorySelect.value;
        const currentBudget = budgets[selectedMonth] || null;
        const currentGoal = goals[selectedMonth] || null;


        if (type === "expense" && currentBudget) {
            const budgetData = {
                userId: userID,
                month: selectedMonth,
                name: currentBudget.name,
                totalAmount: currentBudget.totalAmount,
                current: currentBudget.current + amount,
            };

            const budgetResponse = await fetch(`/api/dashboard/${userID}/budgets/update`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(budgetData)
            });
            console.log("Server Response Status for budget:", budgetResponse.status);

            const result = await budgetResponse.json();
            console.log("updateBudget result:", result);

            if (budgetResponse.ok && result.budget) {
                alert("Budget updated successfully!");
                if (result.budgets) {
                    sessionStorage.setItem("budgets", JSON.stringify(result.budgets));
                } else {
                    let storedBudgets = JSON.parse(sessionStorage.getItem("budgets") || "[]");
                    storedBudgets.push(result.budget);
                    sessionStorage.setItem("budgets", JSON.stringify(storedBudgets));
                }
            } else if (!budgetResponse.ok) {
                const errorText = await budgetResponse.text();
                console.error("Server Response Body:", errorText);
                throw new Error(`Failed to update budget. Server Response: ${errorText}`);
            }
        }

        if (currentGoal) {
            const goalData = {
                userId: userID,
                month: selectedMonth,
                name: currentGoal.name,
                totalAmount: currentGoal.totalAmount,
                current: currentGoal.current + (type === "income" ? amount : 0),
            };

            const goalResponse = await fetch(`/api/dashboard/${userID}/goals/update`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(goalData)
            });

            console.log("Server Response Status for goal:", goalResponse.status);

            const result2 = await goalResponse.json();
            console.log("updateGoal result:", result2);
            console.log("ok and success", { goalResponse, result2 })

            if (goalResponse.ok && result2.success) {
                alert("Goal updated successfully!");
                if (result2.goals) {
                    sessionStorage.setItem("goals", JSON.stringify(result2.goals));
                } else {

                    let storedGoals = JSON.parse(sessionStorage.getItem("goals") || "[]");
                    storedGoals.push(result2.goal);
                    sessionStorage.setItem("goals", JSON.stringify(storedGoals));
                }
            } else if (!goalResponse.ok) {
                const errorText = await goalResponse.text();
                console.error("Server Response Body:", errorText);
                throw new Error(`Failed to update goal. Server Response: ${errorText}`);
            }
        }

        console.log("Adding transaction:", { userID, amount, type, dateInput, categoryId, description });
        const transactionData = {
            userID,
            amount,
            type,
            date: dateInput,
            category: categoryId,
            description,
        };

        try {
            const response = await fetch("/api/transactions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(transactionData),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Server Response Body:", errorText);
                throw new Error(`Failed to add transaction. Server Response: ${errorText}`);
            }

            showAlert("Transaction added successfully!", "success");
            document.querySelector(".add-expense-form").reset();
            dateInputField.value = dateInputValue;
            categorySelect.value = categoryInputValue;
            refreshTransactionTable();
            closeExpenseMenu(true);
        } catch (error) {
            console.error("Error adding transaction:", error);
            showAlert("Failed to add transaction. Please try again.", "error");
        }
    }
    document.querySelector(".add-expense-form").addEventListener("submit", handleAddTransaction);

    /** Redirects */
    function redirectToTargetPage(page) {
        const selectedMonth = monthSelector.value;
        window.location.href = `${page}.html?month=${selectedMonth}`; // UPDATED
    }

    budgetDisplay.addEventListener("click", () => redirectToTargetPage("budget"));
    goalDisplay.addEventListener("click", () => redirectToTargetPage("goal"));

    // Ensure Expense is the default active selection
    expenseButton.classList.add("active");
    incomeButton.classList.remove("active");

    // Initialize Dashboard
    await fetchCategories();
    await refreshTransactionTable();
});
