
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
                const goalCurrent = currentGoal.current || 0;
                const goalTarget = currentGoal.target || 9999;
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



    async function fetchGoalCategories() {
        try {
            const response = await fetch(`/api/categories`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!response.ok) {
                console.error("Failed to fetch categories:", response.statusText);
                return;
            }

            const categories = await response.json(); // Directly get the array

            if (!Array.isArray(categories) || categories.length === 0) {
                console.error("No categories returned from API.");
                return;
            }

        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    }


    await fetchGoalCategories();

    goalForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const newGoalTarget = parseFloat(goalTargetInput.value.trim());
        const newGoalSaved = goalSavedInput ? parseFloat(goalSavedInput.value.trim()) : 0;
        const newGoalDueDate = goalDueDateInput ? goalDueDateInput.value.trim() : "";

        if (isNaN(newGoalTarget) || newGoalTarget <= 0) {
            alert("Please enter a valid goal target amount (must be greater than 0).");
            return;
        }

        try {
            const response = await fetch(`/api/users/${userId}/goals/add`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    targetAmount: newGoalTarget,
                    savedAmount: newGoalSaved,
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