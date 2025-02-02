document.addEventListener("DOMContentLoaded", async () => {

  const loggedInUserId = localStorage.getItem("userId");
  console.log("Logged in user ID:", loggedInUserId);
  
  if (!loggedInUserId) {
    console.error("No logged in user found. Redirect to login page or display error.");

    return;
  }


  async function refreshDashboard() {
    console.log("Refreshing dashboard...");
    const result = await window.electronAPI.invoke('getDashboardData', loggedInUserId);
    if (result.success) {
      const { budgetCurrent, budgetTarget, goalCurrent, goalTarget } = result;
      document.getElementById("budget-display").innerText = `Budget - $${budgetCurrent}/${budgetTarget}`;
      document.getElementById("goal-display").innerText = `Goal - $${goalCurrent}/${goalTarget}`;
      console.log("Dashboard updated:", result);
    } else {
      console.error("Failed to load dashboard data:", result.error);
    }
  }


  await refreshDashboard();


  const updateBudgetBtn = document.getElementById("update-budget");
  const updateGoalBtn = document.getElementById("update-goal");

  if (updateBudgetBtn) {
    updateBudgetBtn.addEventListener("click", async () => {
      console.log("Update Budget button clicked");
      const newBudget = prompt("Enter new budget amount:");
      if (newBudget === null) return; // User cancelled
      const newBudgetValue = parseFloat(newBudget);
      if (isNaN(newBudgetValue) || newBudgetValue < 0) {
        alert("Please enter a valid non-negative number for budget.");
        return;
      }
      const result = await window.electronAPI.invoke("updateBudget", { userId: loggedInUserId, newBudgetValue });
      if (result.success) {
        alert("Budget updated successfully!");
        await refreshDashboard();
      } else {
        alert("Error updating budget: " + result.error);
      }
    });
  } else {
    console.error("Update Budget button not found in DOM");
  }

  if (updateGoalBtn) {
    updateGoalBtn.addEventListener("click", async () => {
      console.log("Update Goal button clicked");
      const newGoalCurrentStr = prompt("Enter current goal value:");
      if (newGoalCurrentStr === null) return;
      const newGoalCurrent = parseFloat(newGoalCurrentStr);
      if (isNaN(newGoalCurrent) || newGoalCurrent < 0) {
        alert("Please enter a valid non-negative number for current goal.");
        return;
      }
      const newGoalTargetStr = prompt("Enter target goal value:");
      if (newGoalTargetStr === null) return;
      const newGoalTarget = parseFloat(newGoalTargetStr);
      if (isNaN(newGoalTarget) || newGoalTarget < 0) {
        alert("Please enter a valid non-negative number for target goal.");
        return;
      }
      const result = await window.electronAPI.invoke("updateGoal", { userId: loggedInUserId, newGoalCurrent, newGoalTarget });
      if (result.success) {
        alert("Goal updated successfully!");
        await refreshDashboard();
      } else {
        alert("Error updating goal: " + result.error);
      }
    });
  } else {
    console.error("Update Goal button not found in DOM");
  }
});