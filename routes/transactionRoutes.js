const express = require("express");
const { getTransaction, addTransaction } = require("../db/transactionsFunctions");

const router = express.Router();


router.get("/", async (req, res) => {
    const userId = req.params.id;

    try {
        console.log(`Fetching transactions for userID: ${userId}`);

        const transactions = await getTransaction(userId);
        console.log(`Found ${transactions.length} transactions for userID: ${userId}`);

        res.json({ success: true, transactions });
    } catch (error) {
        console.error("Error fetching transactions:", error);
        res.status(500).json({ success: false, error: "Server error" });
    }
});


router.post("/", async (req, res) => {
    const { userID, amount, type, categoryID, date, description } = req.body;

    if (!userID || !amount || type === undefined || !date) {
        return res.status(400).json({
            success: false,
            error: "Missing required fields: userID, amount, type, or date."
        });
    }

    try {
        // Call the addTransaction function.
        const transaction = await addTransaction(userID, amount, type, categoryID, date, description);
        if (!transaction) {
            return res.status(400).json({
                success: false,
                error: "Failed to add transaction"
            });
        }
        res.json({ success: true, transaction });
    } catch (error) {
        console.error("Error adding transaction:", error);
        res.status(500).json({ success: false, error: "Server error" });
    }
});


module.exports = router;
