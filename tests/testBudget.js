const mongoose = require("mongoose");
const { connectToDB } = require("../db/dbconnect");
const {
  addBudget,
  getBudget,
  removeBudget,
  updateBudgetName,
  updateBudgetAmount,
  updateBudgetCategory,
  getSpentAmount
} = require("../db/budgetFunctions");

async function test() {
  try {
    await connectToDB(); // Connect to MongoDB

    const userID = "67a9ff033776d910f3e76da3";  //copy and paste from the database
    const budgetID = "64bb6e1b2bcd8134a5f5e672"; 

    console.log("Adding a new budget...");
    const newBudget = await addBudget(userID, "Groceries", 500, 2);
    console.log("Budget Created:", newBudget);

    console.log("\n Retrieving budget...");
    const budget = await getBudget(userID, newBudget._id);
    console.log(" Retrieved Budget:", budget);

    console.log("\n Updating budget name...");
    const updatedBudgetName = await updateBudgetName(userID, newBudget._id, "Food Expenses");
    console.log(" Updated Name:", updatedBudgetName);

    console.log("\n Updating budget amount...");
    const updatedBudgetAmount = await updateBudgetAmount(userID, newBudget._id, 700);
    console.log(" Updated Amount:", updatedBudgetAmount);

    console.log("\n Updating budget category...");
    const updatedBudgetCategory = await updateBudgetCategory(userID, newBudget._id, 5);
    console.log(" Updated Category:", updatedBudgetCategory);

    console.log("\n Calculating spent amount...");
    const spentAmount = await getSpentAmount(userID, newBudget._id);
    console.log("Total Spent:", spentAmount);

    // console.log("\n Removing budget...");
    // const removedBudget = await removeBudget(userID, newBudget._id);
    // console.log(" Removed Budget:", removedBudget);

  } catch (error) {
    console.error("Error:", error);
  } finally {
    mongoose.connection.close(); // Close connection after test
  }
}

test();
