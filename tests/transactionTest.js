const mongoose = require("mongoose");
const { connectToDB } = require("../db/dbconnect"); // Ensure this connects to your DB
const { addTransaction } = require("../db/transactionsFunctions"); // Import function

// Test User ID (use the one provided)
const userID = "67a9ff033776d910f3e76da3";

async function runTest() {
    try {
        await connectToDB(); // Connect to MongoDB
        console.log("Connected to MongoDB");

        // Test transaction data
        const transactionData = {
            userID,
            amount: 45.99,
            type: "expense", // Change to "income" for testing
            date: "2025-02-10",
            categoryName: "Transportation", // Must match existing category name in DB
            description: "Test transaction",
        };

        console.log("Adding Transaction:", transactionData);

        const result = await addTransaction(
            transactionData.userID,
            transactionData.amount,
            transactionData.type,
            transactionData.date,
            transactionData.categoryName,
            transactionData.description
        );

        if (!result) {
            console.error("Failed to add transaction. Check function logs.");
        } else {
            console.log("Transaction added successfully:", result);
        }

    } catch (error) {
        console.error("Error in test script:", error);
    } finally {
        mongoose.connection.close();
        console.log("MongoDB connection closed.");
    }
}

runTest();
