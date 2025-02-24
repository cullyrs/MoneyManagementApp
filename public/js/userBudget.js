const USD = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

document.addEventListener("DOMContentLoaded", async () => {
    const userId = sessionStorage.getItem("userId");
    const token = sessionStorage.getItem("token");
    const urlParams = new URLSearchParams(window.location.search);
    const selectedMonth = urlParams.get("month"); // Get month from URL

    if (!userId || !token) {
        console.error("No logged-in user found. Redirecting to login page.");
        window.location.href = "login.html";
        return;
    }

    console.log("User logged in:", userId);

    // UI Elements
    const currentBudgetDiv = document.getElementById("current-budget");
    const budgetForm = document.getElementById("budget-form");
    const budgetNameInput = document.getElementById("budget-name");
    const budgetAmountInput = document.getElementById("budget-input");

    /** Fetch and Display Current Budget */
    async function loadCurrentBudget() {
        try {
            const response = await fetch(`/api/dashboard/${userId}/budgets/${selectedMonth}`);
            const result = await response.json();

            if (!result.success || !result.budget) {
                currentBudgetDiv.innerText = "No Budget Set";
                return;
            }

            const budget = result.budget;
            const budgetTarget = budget.totalAmount || 0;
            const budgetCurrent = parseFloat(sessionStorage.getItem(`expense_${selectedMonth}`)) || 0;
            const budgetPercent = budgetTarget > 0 ? (budgetCurrent / budgetTarget) * 100 : 0;

            currentBudgetDiv.innerHTML = `
                <div id="budget-progress-container">
                    <progress class="prog-budget" max="100" value="${budgetPercent}"></progress>
                    <span class="budget-progress-text">Budget - ${USD.format(budgetCurrent)} / ${USD.format(budgetTarget)}</span>
                </div>
            `;

            budgetNameInput.value = budget.name;
            budgetAmountInput.value = budget.totalAmount;
        } catch (err) {
            console.error("Error loading budget:", err);
            currentBudgetDiv.innerText = "No Budget Set.";
        }
    }

    await loadCurrentBudget();

    /** Handle Budget Update */
    budgetForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const newBudgetName = budgetNameInput.value.trim();
        const newBudgetAmount = parseFloat(budgetAmountInput.value.trim());

        if (!newBudgetName) {
            alert("Please enter a budget name.");
            return;
        }
        if (isNaN(newBudgetAmount) || newBudgetAmount <= 0) {
            alert("Please enter a valid budget amount.");
            return;
        }

        try {
            const updateResponse = await fetch(`/api/dashboard/${userId}/budgets/update`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userID: userId,
                    month: selectedMonth,
                    name: newBudgetName,
                    totalAmount: newBudgetAmount
                }),
            });

            const updateResult = await updateResponse.json();
            console.log("update", {updateResponse, updateResult});

            if (!updateResponse.ok && !updateResult.success) {
                const response = await fetch(`/api/dashboard/${userId}/budgets/add`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        userId,
                        month: selectedMonth,
                        name: newBudgetName,
                        totalAmount: newBudgetAmount,
                        current: 0,
                    }),
                });

                const result = await response.json();

                if (response.ok && result.success) {
                    let storedBudgets = JSON.parse(sessionStorage.getItem("budgets") || "{}");
                    storedBudgets[selectedMonth] = result.budget;
                    sessionStorage.setItem("budgets", JSON.stringify(storedBudgets));
                    window.location.href = "dashboard.html";
                } else {
                    alert("Failed to add budget: " + (result.error || "Unknown error"));
                }
            } else if (updateResponse.ok && updateResult.success) {
                let storedBudgets = JSON.parse(sessionStorage.getItem("budgets") || "{}");
                storedBudgets[selectedMonth] = updateResult.budget;
                sessionStorage.setItem("budgets", JSON.stringify(storedBudgets));
                window.location.href = "dashboard.html";
            } else {
                alert("Failed to add budget: " + (updateResult.error || "Unknown error"));
            }
        } catch (err) {
            console.error("Error updating budget:", err);
            alert("Error updating budget: " + err.message);
        }
    });
});
