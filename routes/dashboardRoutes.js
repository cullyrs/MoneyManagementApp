const express = require("express");
const { findUser } = require("../db/userFunctions");
const { getSpentAmount, getBudget, addBudget, removeBudget } = require("../db/budgetFunctions");
const { getSavedAmount, getTargetAmount, getGoal, addGoal, removeGoal } = require("../db/goalFunctions");


const router = express.Router();


router.post("/:id/budgets/add", async (req, res) => {
    const userID = req.params.id;
    const { name, amount, categoryID } = req.body;
    try {
        const budget = await addBudget(userID, name, amount, categoryID);
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
    const { name, targetAmount, savedAmount, savedToDate, categoryID } = req.body;
    try {
        const goal = await addGoal(userID, name, targetAmount, savedAmount, savedToDate, categoryID);
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

module.exports = router;
