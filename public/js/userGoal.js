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
    const currentGoalDiv = document.getElementById("current-goal");
    const goalForm = document.getElementById("goal-form");
    const goalNameInput = document.getElementById("budget-name"); // Incorrectly named in HTML
    const goalTargetInput = document.getElementById("goal-input");

    /** Fetch and Display Current Goal */
    async function loadCurrentGoal() {
        try {
            const response = await fetch(`/api/dashboard/${userId}/goals/${selectedMonth}`);
            const result = await response.json();

            if (!result.success || !result.goal) {
                currentGoalDiv.innerText = "No Goal Set";
                return;
            }

            const goal = result.goal;
            const goalTarget = goal.totalAmount || 0;
            const goalCurrent = parseFloat(sessionStorage.getItem(`income_${selectedMonth}`)) || 0;
            const goalPercent = goalTarget > 0 ? (goalCurrent / goalTarget) * 100 : 0;

            currentGoalDiv.innerHTML = `
                <div id="goal-progress-container">
                    <progress class="prog-goal" max="100" value="${goalPercent}"></progress>
                    <span class="goal-progress-text">Goal - ${USD.format(goalCurrent)} / ${USD.format(goalTarget)}</span>
                </div>
            `;

            goalNameInput.value = goal.name;
            goalTargetInput.value = goal.totalAmount;
        } catch (err) {
            console.error("Error loading goal:", err);
            currentGoalDiv.innerText = "No Goal Set.";
        }
    }

    await loadCurrentGoal();

    /** Handle Goal Update */
    goalForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const newGoalName = goalNameInput.value.trim();
        const newGoalTarget = parseFloat(goalTargetInput.value.trim());

        if (!newGoalName) {
            alert("Please enter a goal name.");
            return;
        }
        if (isNaN(newGoalTarget) || newGoalTarget <= 0) {
            alert("Please enter a valid goal target amount.");
            return;
        }
        try {
            const updateResponse = await fetch(`/api/dashboard/${userId}/goals/update`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId,
                    month: selectedMonth,
                    name: newGoalName,
                    totalAmount: newGoalTarget,
                }),
            });

            const updateResult = await updateResponse.json();
            console.log("update", {updateResponse, updateResult});

            if (!updateResponse.ok && !updateResult.success) {

                const response = await fetch(`/api/dashboard/${userId}/goals/add`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        userId,
                        month: selectedMonth,
                        name: newGoalName,
                        totalAmount: newGoalTarget,
                        current: 0,
                    }),
                });

                const result = await response.json();

                if (response.ok && result.success) {
                    let storedGoals = JSON.parse(sessionStorage.getItem("goals") || "{}");
                    storedGoals[selectedMonth] = result.goal;
                    sessionStorage.setItem("goals", JSON.stringify(storedGoals));
                    window.location.href = "dashboard.html";
                } else {
                    alert("Failed to add goal: " + (result.error || "Unknown error"));
                }
            } else if (updateResponse.ok && updateResult.success) {
                let storedGoals = JSON.parse(sessionStorage.getItem("goals") || "{}");
                    storedGoals[selectedMonth] = updateResult.goal;
                    sessionStorage.setItem("goals", JSON.stringify(storedGoals));
                    window.location.href = "dashboard.html";
            } else {
                alert("Failed to update goal: " + (updateResult.error || "Unknown error"));
            }
        } catch (err) {
            console.error("Error updating goal:", err);
            alert("Error updating goal: " + err.message);
        }
    });
});
