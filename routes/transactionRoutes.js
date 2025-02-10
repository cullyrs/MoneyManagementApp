const express = require("express");
const { getUserTransactions, addTransaction } = require("../db/transactionsFunctions");

const router = express.Router();

/**
 * Get all transactions for a user
 * @route GET /api/transactions/:id
 */
router.get("/:id", async (req, res) => {
    const userId = req.params.id;

    try {
        console.log(`Fetching transactions for userID: ${userId}`);

        const transactions = await getUserTransactions(userId);
        console.log(`Found ${transactions.length} transactions for userID: ${userId}`);

        res.json({ success: true, transactions });
    } catch (error) {
        console.error("Error fetching transactions:", error);
        res.status(500).json({ success: false, error: "Server error" });
    }
});

/**
 * Add a new transaction
 * @route POST /api/transactions
 */
router.post("/", async (req, res) => {
    const { userID, amount, type, category, date, description } = req.body; // Destructure incoming data

    console.log("[Transaction Request Received] ==================");
    console.log("Incoming Transaction Data:", req.body);
    console.log("Checking category exists for ID:", category); // debugging

    // Ensure required fields are present
    if (!userID || !amount || !type || !category || !date) {
        console.error("Missing required fields:", { userID, amount, type, category, date });
        return res.status(400).json({ success: false, error: "Missing required fields" });
    }

    try {
        const transaction = await addTransaction(userID, amount, type, category, date, description);
        if (!transaction) {
            console.error("Failed to create transaction.");
            return res.status(400).json({ success: false, error: "Failed to add transaction" });
        }
        res.json({ success: true, transaction });
    } catch (error) {
        console.error("Error adding transaction:", error);
        res.status(500).json({ success: false, error: "Server error" });
    }
});

module.exports = router;
