const express = require("express");
const { getUserTransactions, addTransaction, getTransaction, updateTransactionAmount, updateTransactionCategory, updateTransactionDate, removeTransaction } = require("../db/transactionsFunctions");

const router = express.Router();

/**
 * Get all transactions for a user
 * @route GET /api/transactions/:id
 */
router.get("/:id", async (req, res) => {
    const userId = req.params.id;

    try {
        // console.log(`Fetching transactions for userID: ${userId}`);

        const transactions = await getUserTransactions(userId);
        // console.log(`Found ${transactions.length} transactions for userID: ${userId}`);

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

/**
 * Update a transaction
 * @route PUT /api/transactions/:userID/:transactionID
 */
router.put("/:userID/:transactionID", async (req, res) => {
    const { userID, transactionID } = req.params;
    const { amount, category, date, description } = req.body;

    console.log(`Attempting to update transaction: ${transactionID} for user: ${userID}`);

    if (!userID || !transactionID) {
        return res.status(400).json({ success: false, error: "Missing user ID or transaction ID" });
    }

    try {
        let transaction = await getTransaction(userID, transactionID);
        if (!transaction) {
            return res.status(404).json({ success: false, error: "Transaction not found" });
        }

        if (amount) await updateTransactionAmount(userID, transactionID, amount);
        if (category) await updateTransactionCategory(userID, transactionID, category);
        if (date) await updateTransactionDate(userID, transactionID, date);
        if (description) transaction.description = description;

        await transaction.save();

        res.json({ success: true, message: "Transaction updated successfully", transaction });
    } catch (error) {
        console.error("Error updating transaction:", error);
        res.status(500).json({ success: false, error: "Server error" });
    }
});

/**
 * Delete a transaction
 * @route DELETE /api/transactions/:userID/:transactionID
 */
router.delete("/:userID/:transactionID", async (req, res) => {
    const { userID, transactionID } = req.params;

    console.log(`Attempting to delete transaction: ${transactionID} for user: ${userID}`);

    if (!userID || !transactionID) {
        return res.status(400).json({ success: false, error: "Missing user ID or transaction ID" });
    }

    try {
        const transaction = await removeTransaction(userID, transactionID);
        if (!transaction) {
            return res.status(404).json({ success: false, error: "Transaction not found" });
        }

        res.json({ success: true, message: "Transaction deleted successfully" });
    } catch (error) {
        console.error("Error deleting transaction:", error);
        res.status(500).json({ success: false, error: "Server error" });
    }
});
module.exports = router;
