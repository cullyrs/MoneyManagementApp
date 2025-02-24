const express = require("express");
const { getSpentAmount, addBudget, removeBudget, updateBudgetCurrent, getBudgetByMonth, getAllBudgets } = require("../db/budgetFunctions");
const { getSavedAmount, getTargetAmount, addGoal, removeGoal, increaseSavedAmount, getGoalByMonth, getAllGoals } = require("../db/goalFunctions");
const { findUser } = require("../db/userFunctions");


const router = express.Router();


router.post("/:id/budgets/add", async (req, res) => {
    const userID = req.params.id;
    const { name, totalAmount, month } = req.body;

    console.log("Request Body:", req.body);
    if (!userID || !name || !totalAmount || !month) {
        if (!userID) {
            console.error("Missing userID in request params");
        }
        if (!name) {
            console.error("Missing name in request body");
        }
        if (!totalAmount) {
            console.error("Missing totalAmount in request body");
        }
        if (!month) {
            console.error("Missing month in request body");
        }
        return res.status(400).json({ success: false, error: "Missing required fields" });

    }

    try {
        const budget = await addBudget(userID, name, totalAmount, month, 0); // Initialize current to 0
        if (budget) {
            res.status(201).json({ success: true, budget });
        } else {
            res.status(400).json({ success: false, error: "Budget creation failed." });
        }
        console.log("Budget:", budget);
    } catch (error) {
        console.error("Error adding budget:", error);
        res.status(500).json({ success: false, error: "Server error while adding budget." });
    }
});

// router.post("/:id/budgets/update", async (req, res) => {
//     const { userID, budgetID, amountToAdd } = req.body;

//     if (!userID || !budgetID || !amountToAdd) {
//         console.error("Missing required fields:", { userID, budgetID, amountToAdd});
//         return res.status(400).json({ success: false, error: "Missing required fields" });
//     }
//     try {
//         const budget = await updateBudgetCurrent(userID, budgetID, amountToAdd);
//         if (budget) {
//             res.status(200).json({ success: true, budget });
//         } else {
//             res.status(400).json({ success: false, error: "Budget update failed." });
//         }
//     } catch (error) {
//         console.error("Error updating budget:", error);
//         res.status(500).json({ success: false, error: "Server error while updating budget." });
//     }
// });

router.post("/:id/budgets/remove", async (req, res) => {
    const userID = req.params.id;
    const { budgetID } = req.body;
    if (!userID || !budgetID) {
        return res.status(400).json({ success: false, error: "Missing required fields" });
    }

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
    const { name, totalAmount, month } = req.body;

    if (!userID || !name || !totalAmount || !month) {
        if (!userID) {
            console.error("Missing userID in request params");
        }
        if (!name) {
            console.error("Missing name in request body");
        }
        if (!totalAmount) {
            console.error("Missing totalAmount in request body");
        }
        if (!month) {
            console.error("Missing month in request body");
        }
    }
    console.log("Request Body:", req.body);
    try {
        const goal = await addGoal(userID, name, totalAmount, month, 0); // Initialize current to 0
        console.log("Goal:", goal);
        if (goal) {
            res.status(200).json({ success: true, goal });
        } else {
            res.status(400).json({ success: false, error: "Goal creation failed." });
        }
        console.log("Goal:", goal);
    } catch (error) {
        console.error("Error adding goal:", error);
        res.status(500).json({ success: false, error: "Server error while adding goal." });
    }
});

// router.post("/:id/goals/update", async (req, res) => {
//     const { userID, goalID, amount } = req.body;

//     if (!userID || !goalID || amount === undefined) {
//         return res.status(400).json({ success: false, error: "Missing required fields" });
//     }

//     try {
//         const goal = await increaseSavedAmount(userID, goalID, amount);
//         if (goal) {
//             res.status(200).json({ success: true, goal });
//         } else {
//             res.status(400).json({ success: false, error: "Goal update failed." });
//         }
//     } catch (error) {
//         console.error("Error updating goal:", error);
//         res.status(500).json({ success: false, error: "Server error while updating goal." });
//     }
// });
router.post("/:id/goals/remove", async (req, res) => {
    const userID = req.params.id;
    const { goalID } = req.body;

    if (!userID || !goalID) {
        return res.status(400).json({ success: false, error: "Missing required fields" });
    }
    try {
        const removedGoal = await removeGoal(userID, month);
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

// router.get("/:userID/budgets/:budgetID", async (req, res) => {
//     try {
//         const budget = await getBudget(req.params.userID, req.params.budgetID);
//         if (!budget) {
//             return res.status(404).json({ success: false, message: "Budget not found" });
//         }
//         res.json({ success: true, budget });
//     } catch (error) {
//         console.error("Error retrieving budget:", error);
//         res.status(500).json({ success: false, error: "Server error" });
//     }
// });

// router.get("/:userID/goals/:goalID", async (req, res) => {
//     try {
//         const goal = await getGoal(req.params.userID, req.params.goalID);
//         if (!goal) {
//             return res.status(404).json({ success: false, message: "Goal not found" });
//         }
//         res.json({ success: true, goal });
//     } catch (error) {
//         console.error("Error retrieving goal:", error);
//         res.status(500).json({ success: false, error: "Server error" });
//     }
// });

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
router.get("/:id/budgets/:month", async (req, res) => {
    const userID = req.params.id;
    const month = req.params.month;

    try {
        const budget = await getBudgetByMonth(userID, month);

        if (!budget) {
            return res.status(404).json({ success: false, message: "No budget found for this month." });
        }

        res.json({ success: true, budget });
    } catch (error) {
        console.error("Error retrieving budget by month:", error);
        res.status(500).json({ success: false, error: "Server error while fetching budget." });
    }
});

router.get("/:id/goals/:month", async (req, res) => {
    const userID = req.params.id;
    const month = req.params.month;

    try {
        const goal = await getGoalByMonth(userID, month);

        if (!goal) {
            return res.status(404).json({ success: false, message: "No goal found for this month." });
        }

        res.json({ success: true, goal });
    } catch (error) {
        console.error("Error retrieving goal by month:", error);
        res.status(500).json({ success: false, error: "Server error while fetching goal." });
    }
});
router.get("/:id/budgets-goals/all", async (req, res) => {
    const userID = req.params.id;

    try {
        // Fetch user budgets and goals directly from DB
        const budgets = await getAllBudgets(userID);
        const goals = await getAllGoals(userID);

        if (!budgets && !goals) {
            return res.status(404).json({ success: false, error: "No budgets or goals found for user." });
        }

        const budgetsByMonth = {};
        const goalsByMonth = {};

        // Organize budgets by month
        budgets.forEach(budget => {
            const month = budget.month; // YYYY-MM format
            if (!budgetsByMonth[month]) budgetsByMonth[month] = [];
            budgetsByMonth[month].push({
                id: budget._id,
                name: budget.name || "Unnamed Budget",
                current: budget.current || 0,
                totalAmount: budget.totalAmount || 0
            });
        });

        // Organize goals by month
        goals.forEach(goal => {
            const month = goal.month; // YYYY-MM format
            if (!goalsByMonth[month]) goalsByMonth[month] = [];
            goalsByMonth[month].push({
                id: goal._id,
                name: goal.name || "Unnamed Goal",
                current: goal.current || 0,
                totalAmount: goal.totalAmount || 0
            });
        });

        res.json({
            success: true,
            budgetsByMonth,
            goalsByMonth
        });

    } catch (error) {
        console.error("Error fetching budgets and goals:", error);
        res.status(500).json({ success: false, error: "Server error while fetching budgets and goals." });
    }
});




module.exports = router;