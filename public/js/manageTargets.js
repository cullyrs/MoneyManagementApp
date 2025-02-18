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
            const response = await fetch(`/api/dashboard/${userID}/budgets-goals`, {
                headers: { Authorization: `Bearer ${token}` },
            });
    
            if (!response.ok) {
                throw new Error("Failed to fetch budgets and goals.");
            }
    
            const data = await response.json();
            console.log("Fetched Budgets and Goals:", JSON.stringify(data, null, 2)); // Debugging
    
            if (!data.success) {
                throw new Error(data.error || "Unknown error");
            }
    
            displayBudgetsAndGoals(data.budgetsByMonth, data.goalsByMonth);
        } catch (error) {
            console.error("Error fetching budgets and goals:", error);
        }
    }
    

    function displayBudgetsAndGoals(budgetsByMonth, goalsByMonth) {
        budgetGoalList.innerHTML = ""; // Clear previous content
    
        const months = new Set([...Object.keys(budgetsByMonth), ...Object.keys(goalsByMonth)]);
        const sortedMonths = [...months].sort().reverse(); // Sort descending
    
        sortedMonths.forEach(monthYear => {
            const monthSection = document.createElement("section");
            monthSection.classList.add("month-section");
    
            const title = document.createElement("h2");
            title.textContent = formatMonthYear(monthYear);
            monthSection.appendChild(title);
    
            if (budgetsByMonth[monthYear]) {
                const budgetList = document.createElement("ul");
                budgetList.innerHTML = `<h3>Budgets</h3>`;
                budgetsByMonth[monthYear].forEach(budget => {
                    const li = document.createElement("li");
                    li.innerHTML = `
                        ${budget.name || "Unnamed Budget"}: 
                        <strong>$${(budget.current || 0).toFixed(2)} / $${(budget.totalAmount || 0).toFixed(2)}</strong>
                        <button class="delete-budget" data-id="${budget.id}">Delete</button>
                    `;
                    budgetList.appendChild(li);
                });
                monthSection.appendChild(budgetList);
            }
    
            if (goalsByMonth[monthYear]) {
                const goalList = document.createElement("ul");
                goalList.innerHTML = `<h3>Goals</h3>`;
                goalsByMonth[monthYear].forEach(goal => {
                    const li = document.createElement("li");
                    li.innerHTML = `
                        Saved: 
                        <strong>$${(goal.savedAmount || 0).toFixed(2)} / $${(goal.targetAmount || 0).toFixed(2)}</strong>
                        <button class="delete-goal" data-id="${goal.id}">Delete</button>
                    `;
                    goalList.appendChild(li);
                });
                monthSection.appendChild(goalList);
            }
    
            budgetGoalList.appendChild(monthSection);
        });
    
        setupDeleteListeners();
    }
    

    function formatMonthYear(monthYear) {
        const [year, month] = monthYear.split("-");
        return new Date(year, month - 1).toLocaleDateString("en-US", { year: "numeric", month: "long" });
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

    async function deleteBudget(budgetID) {
        try {
            const response = await fetch(`/api/dashboard/${userID}/budgets/remove`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ budgetID }),
            });

            if (!response.ok) {
                throw new Error("Failed to delete budget.");
            }

            alert("Budget deleted successfully.");
        } catch (error) {
            console.error("Error deleting budget:", error);
        }
    }

    async function deleteGoal(goalID) {
        try {
            const response = await fetch(`/api/dashboard/${userID}/goals/remove`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ goalID }),
            });

            if (!response.ok) {
                throw new Error("Failed to delete goal.");
            }

            alert("Goal deleted successfully.");
        } catch (error) {
            console.error("Error deleting goal:", error);
        }
    }

    fetchBudgetsAndGoals();
});
