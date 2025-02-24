document.addEventListener("DOMContentLoaded", async () => {
    const userID = sessionStorage.getItem("userId");
    const token = sessionStorage.getItem("token");

    if (!userID || !token) {
        console.error("No logged-in user found. Redirecting to login page.");
        window.location.href = "./login.html";
        return;
    }

    const budgetGoalList = document.getElementById("budget-goal-list");

    async function fetchBudgetsAndGoals() {
        try {
            let monthsData = {};

            // Fetch all budgets and goals in one request
            const response = await fetch(`/api/dashboard/${userID}/budgets-goals/all`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) {
                console.error("Failed to fetch budgets and goals.");
                return;
            }

            const data = await response.json();

            console.log("Fetched DATA======>:", data);
            const budgetsByMonth = data.budgetsByMonth || {};
            const goalsByMonth = data.goalsByMonth || {};


            // Get current and past 12 months
            const currentDate = new Date();
            for (let i = 0; i < 12; i++) {
                const monthYear = currentDate.toISOString().slice(0, 7);
                monthsData[monthYear] = { budget: null, goal: null };

                // Assign fetched budgets & goals
                if (budgetsByMonth[monthYear]) {
                    monthsData[monthYear].budget = budgetsByMonth[monthYear][0]; // Use first budget for that month
                }
                if (goalsByMonth[monthYear]) {
                    monthsData[monthYear].goal = goalsByMonth[monthYear][0]; // Use first goal for that month
                }

                currentDate.setMonth(currentDate.getMonth() - 1); // Move to previous month
            }
            // Only keep months that have at least a budget or goal
    

            displayBudgetsAndGoals(monthsData);
            console.log("Fetched budgets and goals:", monthsData);
        } catch (error) {
            console.error("Error fetching budgets and goals:", error);
        }
    }

    function displayBudgetsAndGoals(monthsData) {
        budgetGoalList.innerHTML = "";

        const months = Object.keys(monthsData).sort().reverse();
        if (months.length === 0) {
            budgetGoalList.innerHTML = `<p>No budgets or goals set.</p>`;
            return;
        }

        months.forEach(monthYear => {
            const monthSection = document.createElement("section");
            monthSection.classList.add("month-section");

            const title = document.createElement("h2");
            title.textContent = formatMonthYear(monthYear);
            monthSection.appendChild(title);

            // Fetch total income & expenses from session storage
            const totalIncome = parseFloat(sessionStorage.getItem(`income_${monthYear}`)) || 0;
            const totalExpense = parseFloat(sessionStorage.getItem(`expense_${monthYear}`)) || 0;

            // Display Budget
            if (monthsData[monthYear].budget) {
                const budget = monthsData[monthYear].budget;
                const budgetPercent = budget.totalAmount > 0 ? (totalExpense / budget.totalAmount) * 100 : 0;

                const budgetList = document.createElement("ul");
                budgetList.innerHTML = `<h3>Budget</h3>`;
                const li = document.createElement("li");
                li.innerHTML = `
                    ${budget.name || "Unnamed Budget"}: 
                    <strong>$${totalExpense.toFixed(2)} / $${budget.totalAmount.toFixed(2)}</strong>
                    <progress class="prog-budget" max="100" value="${budgetPercent}"></progress>
                    <button class="delete-goal" data-id="${budget.month}">Delete</button>

                `;
                budgetList.appendChild(li);
                monthSection.appendChild(budgetList);
            }

            // Display Goal
            if (monthsData[monthYear].goal) {
                const goal = monthsData[monthYear].goal;
                const goalPercent = goal.totalAmount > 0 ? (totalIncome / goal.totalAmount) * 100 : 0;

                const goalList = document.createElement("ul");
                goalList.innerHTML = `<h3>Goal</h3>`;
                const li = document.createElement("li");
                li.innerHTML = `
                    ${goal.name || "Unnamed Goal"}: 
                    <strong>$${totalIncome.toFixed(2)} / $${goal.totalAmount.toFixed(2)}</strong>
                    <progress class="prog-goal" max="100" value="${goalPercent}"></progress>
                    <button class="delete-goal" data-id="${goal.month}">Delete</button>
                `;
                goalList.appendChild(li);
                monthSection.appendChild(goalList);
            }

            budgetGoalList.appendChild(monthSection);
        });

        setupDeleteListeners();
    }

    function setupDeleteListeners() {
        document.querySelectorAll(".delete-budget").forEach(button => {
            button.addEventListener("click", async () => {
                const budgetID = button.getAttribute("data-id");
                if (confirm("Are you sure you want to delete this budget?")) {
                    await deleteBudget(budgetID);
                    fetchBudgetsAndGoals();
                }
            });
        });

        document.querySelectorAll(".delete-goal").forEach(button => {
            button.addEventListener("click", async () => {
                const goalID = button.getAttribute("data-id");
                if (confirm("Are you sure you want to delete this goal?")) {
                    await deleteGoal(goalID);
                    fetchBudgetsAndGoals();
                }
            });
        });
    }

    async function deleteBudget(month) {
        try {
            const response = await fetch(`/api/dashboard/${userID}/budgets/remove`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ month }),
            });

            if (!response.ok) {
                throw new Error("Failed to delete budget.");
            }

            alert("Budget deleted successfully.");
        } catch (error) {
            console.error("Error deleting budget:", error);
        }
    }

    async function deleteGoal(month) {
        try {
            const response = await fetch(`/api/dashboard/${userID}/goals/remove`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ month }),
            });

            if (!response.ok) {
                throw new Error("Failed to delete goal.");
            }

            alert("Goal deleted successfully.");
        } catch (error) {
            console.error("Error deleting goal:", error);
        }
    }

    function formatMonthYear(monthYear) {
        const [year, month] = monthYear.split("-");
        return new Date(year, month - 1).toLocaleDateString("en-US", { year: "numeric", month: "long" });
    }

    fetchBudgetsAndGoals();
});
