
//This works 
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
    const goalNameInput = document.getElementById("goal-name");
    const goalTargetInput = document.getElementById("goal-input");
    const goalCategorySelect = document.getElementById("goal-category");
    const goalSavedInput = document.getElementById("goal-saved");
    const goalDueDateInput = document.getElementById("goal-due-date");


    async function loadCurrentGoal() {
        try {
            const response = await fetch(`/api/users/${userId}/dashboard`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }
            const result = await response.json();
            console.log("Dashboard data:", result);
            if (result.goal) {
                currentGoalDiv.innerText = `Goal: $${result.goal.target} (Saved: $${result.goal.current})`;
            } else {
                currentGoalDiv.innerText = "No goal set.";
            }
        } catch (err) {
            console.error("Error loading current goal:", err);
            currentGoalDiv.innerText = "No goal set.";
        }
    }
    await loadCurrentGoal();


    async function fetchGoalCategories() {
        try {
            const response = await fetch("/api/categories/allCategories", {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            console.log("Categories fetched:", data);
            if (!data.success) {
                console.error("Failed to fetch categories:", data.error);
                return;
            }
            
            const categories = data.categories;
            if (!categories || !Array.isArray(categories)) {
                console.error("No categories returned from allCategories endpoint.");
                return;
            }
            
            populateGoalCategories(categories);
        } catch (error) {
            console.error("Error fetching goal categories:", error);
        }
    }

    function populateGoalCategories(categories) {
        goalCategorySelect.innerHTML = categories
            .map(cat => `<option value="${cat.categoryID}">${cat.name}</option>`)
            .join("");
    }

  
    await fetchGoalCategories();

    goalForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const newGoalName = goalNameInput.value.trim();
        const newGoalTarget = parseFloat(goalTargetInput.value.trim());
        const goalCategory = goalCategorySelect.value;
        const newGoalSaved = goalSavedInput ? parseFloat(goalSavedInput.value.trim()) : 0;
        const newGoalDueDate = goalDueDateInput ? goalDueDateInput.value.trim() : "";
        
        if (!newGoalName) {
            alert("Please enter a goal name.");
            return;
        }
        if (isNaN(newGoalTarget) || newGoalTarget <= 0) {
            alert("Please enter a valid goal target amount (must be greater than 0).");
            return;
        }

        try {
            const response = await fetch(`/api/users/${userId}/goals/add`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: newGoalName,
                    targetAmount: newGoalTarget,
                    savedAmount: newGoalSaved,
                    savedToDate: newGoalDueDate,
                    categoryID: goalCategory
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