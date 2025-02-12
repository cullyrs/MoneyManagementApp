document.addEventListener("DOMContentLoaded", async () => {
    const userId = sessionStorage.getItem("userId");
    const token = sessionStorage.getItem("token");

    if (!userId || !token) {
        console.error("No logged-in user found. Redirecting to login page.");
        window.location.href = "login.html";
        return;
    }
    console.log("User logged in:", userId);


    const categorySelect = document.getElementById("category");
    const customCategoryContainer = document.getElementById("custom-category-container");
    const incomeButton = document.getElementById("income-button");
    const expenseButton = document.getElementById("expense-button");
    const budgetDisplay = document.getElementById("budget-display");
    const goalDisplay = document.getElementById("goal-display");
    const addExpenseButton = document.getElementById("add-expense-button");
    const addExpenseContainer = document.getElementById("add-expense-container");
    const closeExpenseButton = document.getElementById("close-add-expense");
    const tableBody = document.getElementById("expense-table-body");

    let currentType = 0; 
    let incomeCategories = [];
    let expenseCategories = [];
    let categoryMap = {};  

    //Merged category routes to generate the fetch function
    async function fetchCategories() {
        try {
            const response = await fetch("/api/categories/allCategories", {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            if (!data.success) {
                console.error("Failed to fetch categories:", data.error);
                return;
            }
            
            const categories = data.categories;
            if (!categories || !Array.isArray(categories)) {
                console.error("No categories returned from allCategories endpoint.");
                return;
            }
            
            categories.forEach(cat => {
                categoryMap[cat.categoryID] = cat.name;
            });

            incomeCategories = categories.filter(cat => {
                const lowerName = cat.name ? cat.name.toLowerCase() : "";
                return lowerName === "income" || lowerName === "investments";
            });

            expenseCategories = categories.filter(cat => {
                const lowerName = cat.name ? cat.name.toLowerCase() : "";
                return lowerName !== "income" && lowerName !== "investments";
            });
            
            console.log("Income Categories:", incomeCategories);
            console.log("Expense Categories:", expenseCategories);
            

            populateCategories(expenseCategories);
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    }

    function populateCategories(categories) {

        categorySelect.innerHTML = categories
            .map(cat => `<option value="${cat.categoryID}">${cat.name}</option>`)
            .join("");
    }
    

    function activateButton(activeButton, inactiveButton, categories, newType) {
        activeButton.classList.add("active");
        inactiveButton.classList.remove("active");
        populateCategories(categories);
        customCategoryContainer.style.display = "none";
    }

    incomeButton.addEventListener("click", () => activateButton(incomeButton, expenseButton, incomeCategories, 1));
    expenseButton.addEventListener("click", () => activateButton(expenseButton, incomeButton, expenseCategories, 0));


    await fetchCategories();

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


    async function refreshDashboard() {
        try {
            const budgetsData = sessionStorage.getItem("budgets");
            const goalsData = sessionStorage.getItem("goals");
            
            console.log("budgetsData (raw):", budgetsData);
            console.log("goalsData (raw):", goalsData);
            
            const budgets = budgetsData ? JSON.parse(budgetsData) : [];
            const goals = goalsData ? JSON.parse(goalsData) : [];
            
            console.log("Parsed budgets:", budgets);
            console.log("Parsed goals:", goals);
            
            const currentBudget = budgets.length ? budgets[budgets.length - 1] : null;
            const currentGoal = goals.length ? goals[goals.length - 1] : null;
            
            if (!currentBudget) {
                budgetDisplay.innerText = "Current Budget: $0";
            } else {
                const budgetCurrent = currentBudget.current || currentBudget.amount || 0;
                const budgetTarget = currentBudget.target || currentBudget.totalAmount || 0;
                const budgetPercent = budgetTarget > 0 ? (budgetCurrent / budgetTarget) * 100 : 0;
                budgetDisplay.innerHTML = `
                    <progress class="prog-budget" max="100" value="${budgetPercent}" 
                        data-label="Budget - $${budgetCurrent}/${budgetTarget}"></progress>
                `;
            }
            
            if (!currentGoal) {
                goalDisplay.innerText = "No goal set.";
            } else {
                const goalCurrent = currentGoal.current || currentGoal.savedAmount || 0;
                const goalTarget = currentGoal.target || currentGoal.targetAmount || 0;
                const goalPercent = goalTarget > 0 ? (goalCurrent / goalTarget) * 100 : 0;
                goalDisplay.innerHTML = `
                    <progress class="prog-goal" max="100" value="${goalPercent}" 
                        data-label="Goal - $${goalCurrent}/${goalTarget}"></progress>
                `;
            }
        } catch (error) {
            console.error("Error loading dashboard:", error);
        }
    }

    async function refreshTransactionTable() {
        try {
            const transactionsData = sessionStorage.getItem("transactions");
            let transactions = [];
            if (transactionsData) {
                transactions = JSON.parse(transactionsData);
            } else {
                console.error("No transactions stored in sessionStorage.");
                tableBody.innerHTML = `<tr><td colspan="4">No transactions available.</td></tr>`;
                return;
            }
            
            if (!Array.isArray(transactions) || transactions.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="4">No transactions available.</td></tr>`;
                return;
            }
            

            transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
            
            tableBody.innerHTML = transactions.map(transaction => `
                <tr>
                    <td>${categoryMap[transaction.categoryID] || "Uncategorized"}</td>
                    <td>${transaction.description || ""}</td>
                    <td>${new Date(transaction.date).toLocaleDateString()}</td>
                    <td>$${transaction.amount.toFixed(2)}</td>
                </tr>
            `).join("");
        } catch (error) {
            console.error("Error refreshing transactions from sessionStorage:", error);
        }
    }
    
    async function handleAddTransaction(event) {
        event.preventDefault();

        const userID = sessionStorage.getItem("userId");
        const token = sessionStorage.getItem("token");

        const dateInput = document.getElementById("date").value;
        const amount = parseFloat(document.getElementById("amount").value);
        const categoryId = document.getElementById("category").value;
        const description = document.getElementById("description").value.trim();
        const customCategoryInput = document.getElementById("custom-category");
        const customCategory = (categoryId === "custom" && customCategoryInput) ? customCategoryInput.value.trim() : "";

        const typeStr = document.getElementById("income-button").classList.contains("active") ? "income" : "expense";
        const numericType = typeStr === "income" ? 1 : 0;

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

        const transactionData = {
            userID,
            amount,
            type: numericType,
            date: dateInput,
            categoryID: categoryId,
            description
        };

        console.log("Transaction Data Being Sent:", JSON.stringify(transactionData, null, 2));

        try {
            const response = await fetch("/api/transactions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(transactionData)
            });

            console.log("Server Response Status:", response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Server Response Body:", errorText);
                throw new Error(`Failed to add transaction. Server Response: ${errorText}`);
            }

            const result = await response.json();
            alert("Transaction added successfully!");
            document.querySelector(".add-expense-form").reset();
            
            let storedTransactions = JSON.parse(sessionStorage.getItem("transactions") || "[]");
            storedTransactions.push(result.transaction);
            sessionStorage.setItem("transactions", JSON.stringify(storedTransactions));
            
            refreshTransactionTable();
        } catch (error) {
            console.error("Error adding transaction:", error);
        }
    }

    document.querySelector(".add-expense-form").addEventListener("submit", handleAddTransaction);


    if (budgetDisplay) budgetDisplay.addEventListener("click", () => window.location.href = "budget.html");
    if (goalDisplay) goalDisplay.addEventListener("click", () => window.location.href = "goal.html");

    await fetchCategories();
    await refreshDashboard();
    await refreshTransactionTable();
});