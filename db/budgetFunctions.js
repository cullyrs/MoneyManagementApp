/**
 * Name : Arewa (Morountudun) Ojelade
 * Date : 1/31/2025
 * File Name: budget.js
 * Course : CMSC 495 Capstone in Computer Science
 * Project : Expense Tracker Capstone Project
 * Description : The purpose of the budget.js module is to provide 
 * compact functions to interact with the Budget collection of
 * the Expense Tracker Accounts database.
 */


// const Category = require('./models/Category.js');
const Budget = require('./models/Budget.js');
const User = require('./models/User.js');
const Transactions = require('./models/Transactions.js'); // Added from db branch

/**
 * Function to add a budget to the Budget collection of the 
 * Expense Tracker Accounts database. The budgetList array in the 
 * User collection is updated with the unique budget _id.
 * @param {String} userID - The unique _id of the associated User instance.
 * @param {String} name - The name of the associated Budget instance.
 * @param {Double} totalAmount - The budget amount.
 * @returns {Object} The created instance of the budget object.
 * Returns null if :
 *   1. Invalid userID is provided.
 *   2. No name is provided.
 *   3. Invalid amount is provided.
 */
const addBudget = async (userID, name, totalAmount, month, current = 0) => {
    totalAmount = parseFloat(totalAmount);
    current = parseFloat(current);

    const user = await User.findOne({ _id: userID });

    if (!user || !name || !totalAmount || !month) {
        console.error("Invalid budget parameters:", { userID, name, totalAmount, month });
        return null;
    }

    const budget = await Budget.create({
        userID,
        name,
        month,
        current,
        totalAmount
    });

    await user.save();
    return budget;
};

/**
 * Function to retrieve a budget from the Budget collection.
 * @param {String} userID - The unique _id of the associated User instance. 
 * @param {String} budgetID - The unique _id of the budget. 
 * @returns {Object} The instance of the budget object.
 */
const getBudgetByMonth = async (userID, month) => {
    return await Budget.findOne({ userID, month });
};

/**
 * Function to change a budget's amount in the Budget collection 
 * of the Expense Tracker Accounts database. 
 * @param {String} userID - The unique _id of the associated User instance. 
 * @param {String} budgetID - The unique _id of the budget. 
 * @param {Double} newAmount - The updated budget amount.
 * @returns {Object} The updated instance of the budget object.
 * Returns null if :
 *      1. Invalid userID is provided.
 *      2. Invalid newAmount is provided. (Positive values only)
 *      3. budgetID is not associated with the User instance provided.
 */

const updateBudgetCurrent = async (userID, name, totalAmount, month) => {
    totalAmount = parseFloat(totalAmount);
    const user = await User.findOne({ _id: userID });
    const budget = await Budget.findOne({ userID: userID, month: month });

    if (!user || isNaN(totalAmount) || totalAmount < 0 || !budget || !name) {
        console.error("Invalid update parameters:", { userID, budgetID, amountToAdd });
        return null;
    }

    budget.set( 'totalAmount', totalAmount);
    budget.set('name', name);
    await budget.save();
    return budget;
};


/**
 * Function to change a budget's name in the Budget collection of the 
 * Expense Tracker Accounts database. 
 * @param {String} userID - The unique _id of the associated User instance. 
 * @param {String} budgetID - The unique _id of the budget.
 * @param {String} newName - The updated budget name.  
 * @returns {Object} The updated instance of the budget object.
 * Returns null if :
 *      1. Invalid userID is provided.
 *      2. Invalid newName is provided. (Empty String)
 *      3. budgetID is not associated with the User instance provided.
 */
const updateBudgetName = async (userID, budgetID, newName) => {
    const user = await User.findOne({ _id: userID });
    if (!user || !newName || !user.budgetList.includes(budgetID)) return null;

    const budget = await Budget.findOne({ _id: budgetID });
    budget.set('name', newName);
    await budget.save();
    return budget;
};

/**
 * Function to remove a budget from the Budget collection.
 * Also removes it from the user's budget list.
 * @param {String} userID - The unique _id of the associated User instance. 
 * @param {String} budgetID - The unique _id of the budget. 
 * @returns {Object} The removed instance of the budget object.
 */
const removeBudget = async (userID, month) => {
    const user = await User.findOne({ _id: userID });
    if (!user) return null;

    const budget = await Budget.findOne({ userID, month });
    if (!budget) return null;

    const finalCopy = JSON.parse(JSON.stringify(budget));
    await Budget.deleteOne({ userID, month }); // Delete by user and month

    await user.save();
    return finalCopy;
};


/**
 * Function to change a budget's name in the Budget collection of the 
 * Expense Tracker Accounts database. 
 * @param {String} userID - The unique _id of the associated User instance. 
 * @param {String} budgetID - The unique _id of the budget.
 * @param {String} newName - The updated budget name.  
 * @returns {Object} The updated instance of the budget object.
 * Returns null if :
 *      1. Invalid userID is provided.
 *      2. Invalid newName is provided. (Empty String)
 *      3. budgetID is not associated with the User instance provided.
 */

const updateBudgetAmount = async (userID, budgetID, newAmount) => {
    newAmount = parseFloat(newAmount);
    const user = await User.findOne({ _id: userID });
    if (!user || newAmount <= 0 || !user.budgetList.includes(budgetID)) return null;

    const budget = await Budget.findOne({ _id: budgetID });
    budget.set('totalAmount', newAmount);
    await budget.save();
    return budget;
};
/**
 * function to get the total spent amount for a budget.
 * @param {String} userID - The unique _id of the associated User instance. 
 * @param {String} budgetID - The unique _id of the budget. 
 * @returns {Double} The total spent amount.
 */
const getSpentAmount = async (userID, budgetID) => {
    const user = await User.findOne({ _id: userID });
    if (!user || !user.budgetList.includes(budgetID)) return 0;

    const budget = await Budget.findOne({ _id: budgetID });
    if (!budget) return 0;

    const transactions = await Transactions.find({ userID, categoryID: budget.categoryID, type: 0 });

    let spentAmount = transactions.reduce((sum, transaction) => sum + transaction.amount, 0);
    //budget.current = spentAmount;
    //await budget.save();
    return spentAmount;
};
async function getAllBudgets(userID) {
    try {
        return await Budget.find({ userID }).sort({ month: -1 }); // Sort by most recent month first
    } catch (error) {
        console.error("Error fetching all budgets:", error);
        return [];
    }
}

module.exports = {
    addBudget,
    getBudgetByMonth,
    removeBudget,
    updateBudgetName,
    updateBudgetAmount,
    updateBudgetCurrent,
    getSpentAmount,
    getAllBudgets,
};