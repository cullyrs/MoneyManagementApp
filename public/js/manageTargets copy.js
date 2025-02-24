async function fetchBudgetsAndGoals() {
    try {
        const response = await fetch(`/api/dashboard/${userID}/budgets-goals/all`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
            throw new Error("Failed to fetch budgets and goals");
        }

        const data = await response.json();
        if (!data.success) {
            console.warn("No budgets or goals found for user.");
            return;
        }

        const { budgetsByMonth, goalsByMonth } = data;
        let monthsData = {};

        // Merge budgets and goals into monthsData
        Object.keys(budgetsByMonth).forEach(monthYear => {
            if (!monthsData[monthYear]) monthsData[monthYear] = { budget: null, goal: null };
            monthsData[monthYear].budget = budgetsByMonth[monthYear];
        });

        Object.keys(goalsByMonth).forEach(monthYear => {
            if (!monthsData[monthYear]) monthsData[monthYear] = { budget: null, goal: null };
            monthsData[monthYear].goal = goalsByMonth[monthYear];
        });

        displayBudgetsAndGoals(monthsData);
    } catch (error) {
        console.error("Error fetching budgets and goals:", error);
    }
}
