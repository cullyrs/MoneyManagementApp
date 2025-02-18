const express = require("express");
const { getSpentAmount, getBudget, addBudget, removeBudget } = require("../db/budgetFunctions");
const { getSavedAmount, getTargetAmount, getGoal, addGoal, removeGoal } = require("../db/goalFunctions");
const { findUser } = require("../db/userFunctions");


const router = express.Router();


router.post("/:id/budgets/add", async (req, res) => {
    const userID = req.params.id;
    const { name, amount } = req.body;
    try {
        const budget = await addBudget(userID, name, amount);
        if (budget) {
            res.status(201).json({ budget });
        } else {
            res.status(400).json({
                success: false,
                error: "Budget creation failed. Check that the user exists and all fields are valid (amount > 0)."
            });
        }
    } catch (error) {
        console.error("Error adding budget:", error);
        res.status(500).json({ success: false, error: "Server error while adding budget." });
    }
});

router.post("/:id/budgets/remove", async (req, res) => {
    const userID = req.params.id;
    const { budgetID } = req.body;
    try {
        const removedBudget = await removeBudget(userID, budgetID);
        if (removedBudget) {
            res.json({ success: true, removedBudget });
        } else {
            res.status(400).json({
                success: false,
                error: "Budget removal failed. Check if the budget exists and is associated with the user."
            });
        }
    } catch (error) {
        console.error("Error removing budget:", error);
        res.status(500).json({ success: false, error: "Server error while removing budget." });
    }
});

router.post("/:id/goals/add", async (req, res) => {
    const userID = req.params.id;
    const { targetAmount, savedAmount, savedToDate } = req.body;
    console.log("Hello?", [targetAmount, savedAmount, savedToDate])
    try {
        const goal = await addGoal(userID, targetAmount, savedAmount, savedToDate);
        if (goal) {
            res.status(201).json({ success: true, goal });
        } else {
            res.status(400).json({
                success: false,
                error: "Goal creation failed. Check that the user exists and all fields are valid (targetAmount > 0)."
            });
        }
    } catch (error) {
        console.error("Error adding goal:", error);
        res.status(500).json({ success: false, error: "Server error while adding goal." });
    }
});

router.post("/:id/goals/remove", async (req, res) => {
    const userID = req.params.id;
    const { goalID } = req.body;
    try {
        const removedGoal = await removeGoal(userID, goalID);
        if (removedGoal) {
            res.json({ success: true, removedGoal });
        } else {
            res.status(400).json({
                success: false,
                error: "Goal removal failed. Check if the goal exists and is associated with the user."
            });
        }
    } catch (error) {
        console.error("Error removing goal:", error);
        res.status(500).json({ success: false, error: "Server error while removing goal." });
    }
});


router.get("/users/:userID/budget/:budgetID/spent", async (req, res) => {
    const { userID, budgetID } = req.params;

    if (!userID || !budgetID) {
        return res.status(400).json({ success: false, error: 'Both userID and budgetID are required.' });
    }

    try {

        const spentAmount = await getSpentAmount(userID, budgetID);
        res.json({ success: true, spentAmount });
    } catch (error) {
        console.error("Error calculating spent amount:", error);
        res.status(500).json({ success: false, error: 'Server error while retrieving spent amount.' });
    }
});


router.get("/users/:userID/goals/:goalID/target", async (req, res) => {
    const { userID, goalID } = req.params;

    try {
        const targetAmount = await getTargetAmount(userID, goalID);

        if (targetAmount === null) {
            return res.status(404).json({
                success: false,
                error: "Goal not found or not associated with the user."
            });
        }

        res.json({
            success: true,
            targetAmount
        });
    } catch (error) {
        console.error("Error retrieving target amount:", error);
        res.status(500).json({
            success: false,
            error: "Server error."
        });
    }
});

router.get("/:userID/budgets/:budgetID", async (req, res) => {
    try {
        const userID = req.params.userID;
        const budgetID = req.params.budgetID;

        const budget = await getBudget(userID, budgetID);
        if (!budget) {
            return res.status(404).json({ success: false, message: "Budget not found" });
        }
        res.json({ success: true, budget });
    } catch (error) {
        console.error("Error retrieving budget:", error);
        res.status(500).json({ success: false, error: "Server error" });
    }
});

router.get("/:userID/goals/:goalID", async (req, res) => {
    try {
        const userID = req.params.userID;
        const goalID = req.params.goalID;

        const goal = await getGoal(userID, goalID);
        if (!goal) {
            return res.status(404).json({ success: false, message: "Goal not found" });
        }
        res.json({ success: true, goal });
    } catch (error) {
        console.error("Error retrieving goal:", error);
        res.status(500).json({ success: false, error: "Server error" });
    }
});

router.get("/:id/budgets-goals", async (req, res) => {
    const userID = req.params.id;

    try {
        const user = await findUser(userID);

        if (!user) {
            return res.status(404).json({ success: false, error: "User not found" });
        }

        console.log("Fetched User Data:", JSON.stringify(user, null, 2)); // Debug log

        const budgetsByMonth = {};
        const goalsByMonth = {};

        if (user.budgetList && user.budgetList.length > 0) {
            user.budgetList.forEach(budget => {
                if (!budget || !budget.name || !budget.createdAt) {
                    console.warn("Skipping invalid budget:", budget);
                    return;
                }

                const monthYear = budget.createdAt.toISOString().slice(0, 7); // Format YYYY-MM
                if (!budgetsByMonth[monthYear]) budgetsByMonth[monthYear] = [];
                budgetsByMonth[monthYear].push({
                    id: budget._id,
                    name: budget.name || "Unnamed Budget",
                    current: budget.current || 0,
                    totalAmount: budget.totalAmount || 0,
                    createdAt: budget.createdAt
                });
            });
        }

        if (user.goalList && user.goalList.length > 0) {
            user.goalList.forEach(goal => {
                if (!goal || !goal.targetAmount || !goal.savedToDate) {
                    console.warn("Skipping invalid goal:", goal);
                    return;
                }

                const monthYear = goal.savedToDate.toISOString().slice(0, 7);
                if (!goalsByMonth[monthYear]) goalsByMonth[monthYear] = [];
                goalsByMonth[monthYear].push({
                    id: goal._id,
                    savedAmount: goal.savedAmount || 0,
                    targetAmount: goal.targetAmount || 0,
                    savedToDate: goal.savedToDate
                });
            });
        }

        console.log("Budgets By Month:", JSON.stringify(budgetsByMonth, null, 2)); // Debugging
        console.log("Goals By Month:", JSON.stringify(goalsByMonth, null, 2)); // Debugging

        res.json({
            success: true,
            budgetsByMonth,
            goalsByMonth
        });
    } catch (error) {
        console.error("Error fetching budgets and goals:", error);
        res.status(500).json({ success: false, error: "Server error while fetching budgets and goals" });
    }
});



module.exports = router;