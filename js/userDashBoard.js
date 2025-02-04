/**
 * Name : Arewa (Morountudun) Ojelade
 * Date : 2/4/2025
 * File Name: userDashBoard.js
 * Contributors: Cully Stearns Naeem Levitt
 * Course : CMSC 495 Capstone in Computer Science
 * Project : Expense Tracker Capstone Project
 * Description : The userDashBoard.js module serves as the front-end controller 
 * for the dashboard interface. It initializes the user interface, handles both 
 * income and expense transaction inputs, and dynamically updates the dashboard 
 * by rendering transaction records alongside current budget and goal data. Additionally, 
 * it supports month-based filtering and sorting of transactions, seamlessly 
 * communicating with the main process via IPC calls to retrieve and update data.
 */


document.addEventListener("DOMContentLoaded", async () => {
  //Check user login
  const userId = localStorage.getItem("userId");
  if (!userId) {
    console.error("No logged in user found. Redirecting to login page.");
    window.location.href = "login.html";
    return;
  }
  console.log("Retrieved userId:", userId);

  // Categories and form for transactions
  const incomeCategories = ["Salary", "Bonus", "Investment", "Custom"];
  const expenseCategories = ["Food", "Transportation", "Entertainment", "Utilities", "Health", "Other", "Custom"];
  const categorySelect = document.getElementById("category");
  const customCategoryContainer = document.getElementById("custom-category-container");
  const incomeButton = document.getElementById("income-button");
  const expenseButton = document.getElementById("expense-button");


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

// Add expense menu elements
const addExpenseButton = document.getElementById("add-expense-button");
const addExpenseContainer = document.getElementById("add-expense-container");
const closeExpenseButton = document.getElementById("close-add-expense");


closeExpenseButton.addEventListener("click", () => {
  addExpenseContainer.classList.remove("active");
});

//Trying to figure out why the field is protected. COuld not solve it.
addExpenseButton.addEventListener("click", () => {
  addExpenseContainer.classList.add("active");
  setTimeout(() => {
    const amountInput = document.getElementById("amount");
    if (amountInput) {
      amountInput.focus();
    }
  }, 100); 
});

document.addEventListener("click", (event) => {
  console.log("Document click; target:", event.target);
  if (!addExpenseContainer.contains(event.target) && event.target !== addExpenseButton) {
    addExpenseContainer.classList.remove("active");
    console.log("Active class removed from container");
  }
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

  // On blur, if the number is negative, convert it
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
  
  //Budget and Goal will be completed later. 
  async function refreshDashboard() {
    console.log("Refreshing dashboard...");
    const result = await window.electronAPI.invoke("getDashboardData", userId);
    if (result.success) {
      const { recentBudget, recentGoal } = result;
      const budgetCurrent = recentBudget ? recentBudget.amount : 0;
      const budgetTarget = recentBudget ? recentBudget.budgetTarget || "9,999" : "9,999";
      const goalCurrent = recentGoal ? recentGoal.savedAmount : 0;
      const goalTarget = recentGoal ? recentGoal.targetAmount : "9,999";

      document.getElementById("budget-display").innerText =
        `Budget - $${budgetCurrent}/${budgetTarget}`;
      document.getElementById("goal-display").innerText =
        `Goal - $${goalCurrent}/${goalTarget}`;

      console.log("Dashboard updated:", result);
    } else {
      console.error("Failed to load dashboard data:", result.error);
    }
  }

  await refreshDashboard();


  const tableBody = document.getElementById("expense-table-body");
  const tableHeaders = document.querySelectorAll("thead th");

  // Render transactions
function renderTransactionRow(transactions) {
  const row = document.createElement("tr");

  // Define category mappings for expenses and income.
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
      : "";

  let displayDate = transactions.date || "N/A";

  const displayAmount = !isNaN(parseFloat(transactions.amount))
    ? parseFloat(transactions.amount).toFixed(2)
    : "0.00";

  row.innerHTML = `
    <td>${categoryDisplay}</td>
    <td>${descriptionDisplay}</td>
    <td>${displayDate}</td>
    <td>$${displayAmount}</td>
  `;
  
  return row;
}

  function sortData(data, key, order) {
    return data.sort((a, b) => {
      if (a[key] < b[key]) return order === "asc" ? -1 : 1;
      if (a[key] > b[key]) return order === "asc" ? 1 : -1;
      return 0;
    });
  }
  
const prevMonthBtn = document.getElementById("prev-month");
const nextMonthBtn = document.getElementById("next-month");
const monthSelector = document.getElementById("month-selector");

let currentMonth = new Date().toISOString().slice(0, 7);
monthSelector.value = currentMonth; 


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
      sortedTransactions.forEach((transaction) => {
        const row = renderTransactionRow(transaction);
        tableBody.appendChild(row);
      });
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

  // Handle transactions
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

  async function handleAddExpense(event) {
  event.preventDefault();

  const categorySelect = document.getElementById("category");
  const customCategoryInput = document.getElementById("custom-category");
  const dateInput = document.getElementById("date");
  const amountInput = document.getElementById("amount");
  const descriptionInput = document.getElementById("description");

  let rawCategory = categorySelect.value.toLowerCase();
  
  let catID;
  if (currentType === 1) { // income

    catID = incomeCategoryMapFront[rawCategory] ?? 0;
  } else { // expense
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
    type: currentType, // 0 for expense, 1 for income
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
  
  refreshTransactionTable();
});
