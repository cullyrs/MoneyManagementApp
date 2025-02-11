const mongoose = require("mongoose");
const { connectToDB } = require("../db/dbconnect"); 
const { addTransaction } = require("../db/transactionsFunctions"); 
const { getCategoryByName } = require("../db/categoryFunctions"); 

// Test User ID
const userID = "67a9ff033776d910f3e76da3"; //user ID from DB
const categoryName = "Entertainment"; //category name in DB

async function runTest() {
    try {
        await connectToDB();
        console.log("[TEST] Connected to MongoDB");

        // Fetch the category ObjectId from DB
        const categoryData = await getCategoryByName(categoryName);
        if (!categoryData) {
            console.error(`[ERROR] Category '${categoryName}' not found in DB.`);
            return;
        }

        // Test transaction data
        const transactionData = {
            userID,
            amount: 150.00,
            type: "expense", // Change to "income" 
            date: new Date("2025-02-11"),
            category: categoryData._id, //  ObjectId instead of category name
            description: "Test transaction",
        };

        console.log("[TEST] Adding Transaction:", transactionData);

        const result = await addTransaction(
            transactionData.userID,
            transactionData.amount,
            transactionData.type,
            transactionData.category,
            transactionData.date,
            transactionData.description
        );

        if (!result) {
            console.error("[TEST FAILED] Failed to add transaction. Check function logs.");
        } else {
            console.log("[TEST SUCCESS] Transaction added successfully:", result);
        }

    } catch (error) {
        console.error("[TEST ERROR] Error in test script:", error);
    } finally {
        mongoose.connection.close();
        console.log("[TEST] MongoDB connection closed.");
    }
}

runTest();
