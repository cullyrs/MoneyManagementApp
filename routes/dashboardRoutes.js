const express = require("express");
const { findUser } = require("../db/userFunctions");
const { getSpentAmount, getBudget } = require("../db/budgetFunctions");
const { getSavedAmount, getTargetAmount } = require("../db/goalFunctions");

const router = express.Router();

/**
 * Get dashboard data (Budget & Goal)
 * @route GET /api/users/:id/dashboard
 */
router.get("/:id/dashboard", async (req, res) => {
    const userId = req.params.id;

    try {
        const user = await findUser(userId);
        if (!user) return res.status(404).json({ error: "User not found" });

        // Get budget details
        let budget = { current: 0, target: 100 };
        if (user.budgetList.length > 0) {
            const latestBudgetId = user.budgetList[user.budgetList.length - 1]; // Get latest budget
            const budgetObj = await getBudget(userId, latestBudgetId);
            if (budgetObj) {
                budget = {
                    current: await getSpentAmount(userId, latestBudgetId),
                    target: budgetObj.amount
                };
            }
        }

        // Get goal details
        let goal = { current: 0, target: 100 };
        if (user.goalList.length > 0) {
            const latestGoalId = user.goalList[user.goalList.length - 1]; // Get latest goal
            goal = {
                current: await getSavedAmount(userId, latestGoalId),
                target: await getTargetAmount(userId, latestGoalId)
            };
        }

        res.json({ budget, goal });
    } catch (error) {
        console.error("Error fetching dashboard data:", error);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
