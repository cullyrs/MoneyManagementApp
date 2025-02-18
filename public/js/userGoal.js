
//This works 
const USD = new Intl.NumberFormat('en-US', {style:'currency', currency:'USD'});
document.addEventListener("DOMContentLoaded", async () => {

    const userId = sessionStorage.getItem("userId");
    const token = sessionStorage.getItem("token");

    if (!userId || !token) {
        console.error("No logged-in user found. Redirecting to login page.");
        window.location.href = "login.html";
        return;
    }
    console.log("User logged in:", userId);


    const currentGoalDiv = document.getElementById("current-goal");
    const goalForm = document.getElementById("goal-form");
    const goalTargetInput = document.getElementById("goal-input");
    const goalSavedInput = document.getElementById("goal-saved");
    const goalDueDateInput = document.getElementById("goal-due-date");


    async function loadCurrentGoal() {
        try {
            const goalsData = sessionStorage.getItem("goals");
            const goals = goalsData ? JSON.parse(goalsData) : [];
            console.log("Parsed goals:", goals);
            
            const currentGoal = goals.length ? goals[goals.length - 1] : null;
            if (!currentGoal) {
                currentGoalDiv.innerText = "No goal set.";
            } else {
                const goalCurrent = currentGoal.savedAmount || 0;
                const goalTarget = currentGoal.targetAmount || 9999;
                const goalPercent = goalTarget > 0 ? (goalCurrent / goalTarget) * 100 : 0;
                currentGoalDiv.innerHTML = `
                    <div id="goal-progress-container">    
                    <progress class="prog-goal" max="100" value="${goalPercent}" 
                        data-label="Goal - ${USD.format(goalCurrent)}/${USD.format(goalTarget)}"></progress>
                    <span class="goal-progress-text">Goal - ${USD.format(goalCurrent)}/${USD.format(goalTarget)}</span>
                    </div>
                `;
                const goalProgressBar = document.querySelector(".prog-goal");
                if (goalProgressBar) {
                    goalProgressBar.style.background = `linear-gradient(to right, #0c5460 ${goalPercent}%, #d1ecf1 ${goalPercent}%)`;
                }
            }
            
        } catch (err) {
            console.error("Error loading current goal:", err);
            currentGoalDiv.innerText = "No goal set.";
        }
    }
    await loadCurrentGoal();


    goalForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const newGoalTarget = parseFloat(goalTargetInput.value.trim());
        const newGoalSaved = goalSavedInput ? parseFloat(goalSavedInput.value.trim()) : 0;
        const newGoalDueDate = goalDueDateInput ? goalDueDateInput.value.trim() : "";

        if (isNaN(newGoalTarget) || newGoalTarget <= 0) {
            alert("Please enter a valid goal target amount (must be greater than 0).");
            return;
        }

        const response = await fetch(`/api/transactions/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        
        const data = await response.json();
        let transactions = data.transactions;
        
        // Get current month and year
        const today = new Date();
        const currentMonth = today.getMonth(); // 0-based (Jan = 0)
        const currentYear = today.getFullYear();
        
        // Filter transactions for the current month and year
        const currentMonthTransactions = transactions.filter(transaction => {
            const transactionDate = new Date(transaction.date);
            return (
                transactionDate.getMonth() === currentMonth &&
                transactionDate.getFullYear() === currentYear
            );
        });
        
        // Calculate the net balance (income - expenses)
        const currentTotal = currentMonthTransactions.reduce((sum, transaction) => {
            return sum + (transaction.type === "income" ? transaction.amount : -transaction.amount);
        }, 0);
        
        console.log("Net Total for Current Month (Income - Expenses):", currentTotal);
        // don't trust the user to know the right amount? or just remove the saved input?
        let newGoalSaved2 = newGoalSaved > currentTotal ? newGoalSaved : currentTotal;

        try {
            const response = await fetch(`/api/users/${userId}/goals/add`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    targetAmount: newGoalTarget,
                    savedAmount: newGoalSaved2,
                    savedToDate: newGoalDueDate,
                })
            });

            const result = await response.json();
            console.log("addGoal result:", result);

            if (response.ok && result.success) {
                alert("Goal updated successfully!");
                if (result.goals) {
                    sessionStorage.setItem("goals", JSON.stringify(result.goals));
                } else {

                    let storedGoals = JSON.parse(sessionStorage.getItem("goals") || "[]");
                    storedGoals.push(result.goal);
                    sessionStorage.setItem("goals", JSON.stringify(storedGoals));
                }

                window.location.href = "dashboard.html";
            } else {
                alert("Failed to update goal: " + (result.error || "Unknown error"));
            }
        } catch (err) {
            console.error("Error updating goal:", err);
            alert("Error updating goal: " + err.message);
        }
    });
});