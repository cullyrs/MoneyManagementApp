/**
 * Name : Cully Stearns
 * Contributors : Arewa 
 * Date : 1/31/2025
 * File Name : ipcHandlers.js
 * Course : CMSC 495 Capstone in Computer Science
 * Project : Expense Tracker Capstone Project
 * Description : The purpose of the ipcHandlers.js module is to register and handle
 * IPC events between the Electron main process and the Expense Tracker 
 * Accounts database. 
 */

const {ipcMain, BrowserWindow} = require('electron');
const {Types: {ObjectId}} = require('mongoose');
const {compareEntry} = require('../utils/helper.js');
const { addUser, loginUser, updateEmail, updatePassword, updateTotalAmount,
    updateUsername, findUser} = require('../db/userFunctions.js');
const User = require('../db/models/User.js');
const {addBudget} = require('../db/budgetFunctions.js');
const Budget = require('../db/models/Budget.js');
const {addGoal} = require('../db/goalFunctions.js');
const Goal = require('../db/models/Goal.js');
const Transactions = require('../db/models/Transactions.js');
const {addCategory, deleteCategory, getCategoryByName} = require('../db/categoryFunctions.js');
const Category = require('../db/models/Category.js')



/**
 * Function to handle the login process for the Expense Tracker Accounts database.
 * This function authenticates the provided username and password, retrieves the user's
 * record along with associated transactions, budgets, and goals, and returns them if
 * authentication is successful. The user's ObjectId is converted to a hex string for ease
 * of use on the client side.
 * 
 * @param {Object} event - The IPC event object (not used directly in the function).
 * @param {Object} credentials - An object containing the login credentials.
 * @param {String} credentials.username - The username of the user attempting to log in.
 * @param {String} credentials.password - The password of the user attempting to log in.
 * @returns {Object} An object containing:
 *   - success {Boolean} - True if login is successful, false otherwise.
 *   - userId {String} - The hex string representation of the user's unique identifier (if successful).
 *   - recentBudget {Object|null} - The most recent budget of the user (if available).
 *   - recentGoal {Object|null} - The most recent goal of the user (if available).
 *   - recentTransaction {Object|null} - The most recent transaction of the user (if available).
 *   - error {String} (optional) - An error message if login fails.
 */
ipcMain.handle('login', async (event, { username, password }) => {
    try {
        console.log('Login attempt for', username);
        const result = await loginUser(username, password);
        if (!result) {
            throw new Error('Invalid credentials');
        }
        const [user, transactions, budgets, goals] = result;
        const userIdString = user._id.toString();
        const recentBudget = budgets && budgets.length > 0 ? budgets[budgets.length - 1] : null;
        const recentGoal = goals && goals.length > 0 ? goals[goals.length - 1] : null;
        const recentTransaction = transactions && transactions.length > 0 ? transactions[transactions.length - 1] : null;
        return {
            success: true,
            userId: userIdString,
            recentBudget,
            recentGoal,
            recentTransaction
        };
    } catch (err) {
        console.error('Login error:', err);
        return {success: false, error: err.message};
}
});

/**
 * Function to handle the signup process for the Expense Tracker Accounts database.
 * This function receives the new user's credentials (username, password, and email),
 * attempts to create a new user in the database, and returns the newly created user's
 * unique identifier if the signup process is successful.
 *
 * @param {Object} event - The IPC event object (not used directly in the function).
 * @param {Object} userData - An object containing the new user's details.
 * @param {String} userData.username - The desired username for the new user.
 * @param {String} userData.password - The desired password for the new user.
 * @param {String} userData.email - The email address for the new user.
 * @returns {Object} An object containing:
 *   - success {Boolean} - True if signup is successful, false otherwise.
 *   - userId {String} - The unique identifier of the newly created user (if successful).
 *   - error {String} (optional) - An error message if signup fails.
 */
ipcMain.handle('signup', async (event, { username, password, email }) => {
    try {
        console.log("Signup values:", {username, password, email});
        const newUser = await addUser(username, password, email);
        if (!newUser) {
            throw new Error("User creation failed. Check that all required fields are provided.");
        }
        return {success: true, userId: newUser._id};
    } catch (error) {
        console.error("Signup error:", error);
        return {success: false, error: error.message};
}
});
/**
 * Function to retrieve a user from the Expense Tracker Accounts database.
 * This function accepts a userID, retrieves the corresponding user document,
 * and converts it to a plain object if found.
 *
 * @param {Object} event - The IPC event object (not used directly).
 * @param {String} userID - The unique identifier of the user to be retrieved.
 * @returns {Object} An object containing:
 *   - success {Boolean} - True if the user is found, false otherwise.
 *   - user {Object} - The plain user object if found.
 *   - error {String} (optional) - An error message if the user is not found or an error occurs.
 */
ipcMain.handle('findUser', async (event, userID) => {
    try {
        if (!userID) {
            throw new Error("No userID provided.");
        }
        const user = await findUser(userID);
        if (user) {
            return {success: true, user: user.toObject()};
        }
        return {success: false, error: "User not found."};
    } catch (err) {
        console.error("Error in ipcMain.handle('findUser'):", err);
        return {success: false, error: err.message};
    }
});

/**
 * Retrieves transactions for a specified user from the Expense Tracker Accounts database.
 * This function validates the provided userId and, if a month is specified, filters the transactions
 * to those created within that month. The transactions are then sorted in descending order based on their creation date.
 *
 * @param {Object} event - The IPC event object (not used directly in this function).
 * @param {String} userId - The unique identifier of the user whose transactions are to be retrieved.
 * @param {String} [month] - An optional string in the format "YYYY-MM" representing the month to filter transactions.
 * @returns {Object} An object containing:
 *   - success {Boolean} - True if the transactions are successfully retrieved; false otherwise.
 *   - transactions {Array} - An array of transaction objects if successful.
 *   - error {String} (optional) - An error message if the retrieval fails.
 */
ipcMain.handle('getUserTransactions', async (event, userId, month) => {
    try {
        if (!ObjectId.isValid(userId)) {
            throw new Error('Invalid userId format.');
        }
        const validUserId = new ObjectId(userId);
        const query = {userID: validUserId};
        if (month) {
            const startDate = new Date(`${month}-01`);
            const endDate = new Date(startDate);
            endDate.setMonth(endDate.getMonth() + 1);
            query.createdAt = {$gte: startDate, $lt: endDate};
        }
        const transactions = await Transactions.find(query)
                .sort({createdAt: -1})
                .lean();
        console.log("Transactions retrieved for user", userId, transactions);
        return {success: true, transactions};
    } catch (err) {
        console.error("Error retrieving transactions:", err);
        return {success: false, error: err.message};
    }
});

/**
 * Retrieves the most recent dashboard data for a given user from the Expense Tracker Accounts database.
 * This function queries the Budget, Goal, and Transactions collections using the provided userId, sorting each
 * in descending order to obtain the most recent entries. The retrieved data is used to update the user's dashboard.
 *
 * @param {Object} event - The IPC event object (not used directly in this function).
 * @param {String} userId - The unique identifier of the user whose dashboard data is being retrieved.
 * @returns {Object} An object containing:
 *   - success {Boolean} - True if the dashboard data is successfully retrieved; false otherwise.
 *   - recentBudget {Object|null} - The most recent budget object for the user, or null if none exists.
 *   - recentGoal {Object|null} - The most recent goal object for the user, or null if none exists.
 *   - recentTransactions {Object|null} - The most recent transaction object for the user, or null if none exists.
 *   - error {String} (optional) - An error message if the retrieval fails.
 */
ipcMain.handle('getDashboardData', async (event, userId) => {
    try {
        const recentBudget = await Budget.findOne({userID: userId}).sort({createdAt: -1});
        const recentGoal = await Goal.findOne({userID: userId}).sort({createdAt: -1});
        const recentTransactions = await Transactions.findOne({userID: userId}).sort({date: -1});
        return {
            success: true,
            recentBudget,
            recentGoal,
            recentTransactions
        };
    } catch (err) {
        console.error('Error retrieving dashboard data:', err);
        return {success: false, error: err.message};
    }
});

/**
 * Function to add a new budget entry to the Expense Tracker Accounts database.
 * This function first validates that the new budget value is a non-negative number.
 * It then uses the addBudget function  to create a new budget record
 * for the specified user. If the budget creation is successful, the newly created Mongoose document is
 * converted to a plain object and returned.
 *
 * @param {Object} event - The IPC event object (not used directly in this function).
 * @param {Object} params - An object containing budget parameters.
 * @param {String} params.userId - The unique identifier of the user adding the budget.
 * @param {String} params.newBudgetName - The name assigned to the new budget.
 * @param {Number} params.newBudgetValue - The monetary value of the new budget; must be a non-negative number.
 * @param {String} params.budgetCategory - The category assigned to the new budget.
 * @returns {Object} An object containing:
 *   - success {Boolean} - True if the budget is added successfully; false otherwise.
 *   - budget {Object} - The newly created budget document converted to a plain object (if successful).
 *   - error {String} (optional) - An error message if the operation fails.
 */
ipcMain.handle('addBudget', async (event, { userId, newBudgetName, newBudgetValue, budgetCategory }) => {
    try {
        if (typeof newBudgetValue !== 'number' || newBudgetValue < 0) {
            throw new Error('Invalid budget value: must be a non-negative number.');
        }
        const budget = await addBudget(userId, newBudgetName, newBudgetValue, budgetCategory);
        if (!budget) {
            throw new Error("Budget creation failed.");
        }
        return {success: true, budget: budget.toObject()};
    } catch (err) {
        console.error('Error updating budget:', err);
        return {success: false, error: err.message};
}
});

/**
 * Function to add a new goal entry to the Expense Tracker Accounts database.
 * This function validates that the new goal value is a non-negative number.
 * It then calls the addGoal function to create a new goal record
 * for the specified user. If successful, the function converts the Mongoose 
 * document to a plain object before returning.
 *
 * @param {Object} event - The IPC event object (not used directly in this function).
 * @param {Object} params - An object containing goal details.
 * @param {String} params.userId - The unique identifier of the user adding the goal.
 * @param {String} params.newGoalName - The name assigned to the new goal.
 * @param {Number} params.newGoalValue - The target value for the new goal; must be a non-negative number.
 * @returns {Object} An object containing:
 *   - success {Boolean} - True if the goal is added successfully; false otherwise.
 *   - goal {Object} - The newly created goal document converted to a plain object (if successful).
 *   - error {String} (optional) - An error message if the operation fails.
 */
ipcMain.handle('addGoal', async (event, { userId, newGoalName, newGoalValue }) => {
    try {
        if (typeof newGoalValue !== 'number' || newGoalValue < 0) {
            throw new Error('Invalid goal value: must be a non-negative number.');
        }
        const goal = await addGoal(userId, newGoalName, newGoalValue, 0);
        if (!goal) {
            throw new Error("Goal creation failed.");
        }
        return {success: true, goal: goal.toObject()};
    } catch (err) {
        console.error('Error updating goal:', err);
        return {success: false, error: err.message};
}
});

/**
 * Function to add a new transaction to the Expense Tracker Accounts database.
 * This function validates the provided transaction data, creates a new transaction record,
 * and updates the corresponding user's transaction list and total amount based on the transaction type.
 *
 * @param {Object} event - The IPC event object (not used directly in this function).
 * @param {Object} transactionData - An object containing the transaction details.
 * @param {String} transactionData.userID - The unique identifier of the user performing the transaction.
 * @param {String|Number} transactionData.amount - The transaction amount, which will be parsed as a float. Must be a non-negative number.
 * @param {Number} transactionData.type - The type of transaction (0 for expense, 1 for income).
 * @param {String} transactionData.date - The date of the transaction.
 * @param {Number|String} transactionData.categoryID - The category identifier associated with the transaction.
 * @param {String} [transactionData.description] - An optional description for the transaction.
 * @returns {Object} An object containing:
 *   - success {Boolean} - True if the transaction was successfully added; false otherwise.
 *   - transaction {Object} - The newly created transaction document converted to a plain object (if successful).
 *   - error {String} (optional) - An error message if the operation fails.
 */
ipcMain.handle("addTransaction", async (event, transactionData) => {
    console.log("Received transactionData in main:", transactionData);
    try {
        const {
            userID,
            amount,
            type,
            date,
            categoryID,
            description
        } = transactionData;
        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount) || parsedAmount < 0) {
            throw new Error("Transaction amount must be a non-negative number.");
        }
        if (!ObjectId.isValid(userID)) {
            throw new Error("Invalid userID: must be a 24-character hex string.");
        }
        const validUserID = new ObjectId(userID);
        const newTransaction = await Transactions.create({
            userID: validUserID,
            amount: parsedAmount,
            type,
            date,
            categoryID,
            description
        });
        const user = await User.findById(validUserID);
        if (user) {
            user.transactionList.push(newTransaction._id);

            if (type === 0) {
                user.totalAmount -= parsedAmount;
            } else if (type === 1) {
                user.totalAmount += parsedAmount;
            }
            await user.save();
        }
        return {success: true, transaction: newTransaction.toObject()};
    } catch (error) {
        console.error("Error in 'addTransaction':", error);
        return {success: false, error: error.message};
    }
});

/**
 * NEED TO IMPLEMENT APPROPRIATELY right now the application uses front end data.
 * Retrieves all categories from the Expense Tracker Accounts database.
 * This function does not require any parameters. It queries the Category collection,
 * converts the result to a plain JavaScript object using `.lean()`, and validates that
 * the result is an array.
 *
 * @param {Object} event - The IPC event object (unused in this function).
 * @returns {Object} An object containing:
 *   - success {Boolean} - True if the categories are successfully retrieved; false otherwise.
 *   - categories {Array} - An array of category objects if retrieval is successful.
 *   - error {String} (optional) - An error message if the retrieval fails.
 */
ipcMain.handle('getCategories', async (event) => {
    try {
        const categories = await Category.find({}).lean();
        if (!Array.isArray(categories)) {
            throw new Error("Unexpected data format: categories is not an array.");
        }
        return {success: true, categories};
    } catch (err) {
        console.error("Error retrieving categories:", err);
        return {success: false, error: err.message};
    }
});

/**
 * Function to add a new category to the Expense Tracker Accounts database.
 * This function validates the provided category name (ensuring it is a non-empty string,
 * not exceeding 50 characters), checks if a category with the same name already exists
 * (using a case-insensitive search), and if not, creates the new category. The newly created
 * category document is then converted to a plain object before being returned.
 *
 * @param {Object} event - The IPC event object (not used directly in this function).
 * @param {String} categoryName - The name of the category to be added.
 * @returns {Object} An object containing:
 *   - success {Boolean} - True if the category is added successfully; false otherwise.
 *   - category {Object} - The newly created category document (as a plain object) if successful.
 *   - error {String} (optional) - An error message if the operation fails.
 */
ipcMain.handle('addCategory', async (event, categoryName) => {
    try {
        if (typeof categoryName !== "string") {
            throw new Error("Category name must be a string.");
        }
        const trimmedName = categoryName.trim();
        if (!trimmedName) {
            throw new Error("Invalid category name: cannot be empty.");
        }
        if (trimmedName.length > 50) { // match your schema maxlength constraint
            throw new Error("Category name is too long. Maximum 50 characters allowed.");
        }
        const existingCategory = await getCategoryByName(trimmedName);
        if (existingCategory) {
            throw new Error("Category already exists.");
        }
        const category = await addCategory(trimmedName);
        if (!category) {
            throw new Error("Category creation failed.");
        }
        return {success: true, category: category.toObject()};
    } catch (err) {
        console.error("Error adding category:", err);
        return {success: false, error: err.message};
    }
});

/**
 * Function to delete a category from the Expense Tracker Accounts database.
 * This function accepts either a string or an object containing a `categoryName` property,
 * validates the input, retrieves the corresponding category (using a case-insensitive helper function),
 * and then deletes the category using its application-level categoryID.
 *
 * @param {Object} event - The IPC event object (unused in this function).
 * @param {String|Object} data - The category name to be deleted. This can be provided directly as a string,
 *                               or as an object with a `categoryName` property.
 * @returns {Object} An object containing:
 *   - success {Boolean} - True if the category was successfully deleted; false otherwise.
 *   - deleted {Object} - The deletion result object (if successful), typically including a deletedCount.
 *   - error {String} (optional) - An error message if the deletion fails.
 */
ipcMain.handle('deleteCategory', async (event, data) => {
    try {
        let categoryName;
        if (typeof data === 'object' && data !== null && data.categoryName !== undefined) {
            categoryName = data.categoryName;
        } else {
            categoryName = data;
        }
        if (typeof categoryName !== 'string') {
            throw new Error("Category name must be a string.");
        }
        const trimmedName = categoryName.trim();
        if (!trimmedName) {
            throw new Error("Invalid category name: cannot be empty.");
        }
        const category = await getCategoryByName(trimmedName);
        if (!category) {
            throw new Error(`Category with name "${trimmedName}" not found.`);
        }
        const deleted = await Category.deleteOne({categoryID: category.categoryID});
        if (!deleted || deleted.deletedCount === 0) {
            throw new Error("No category was deleted.");
        }
        return {success: true, deleted};
    } catch (err) {
        console.error("Error deleting category:", err);
        return {success: false, error: err.message};
    }
});
/**INCOMPLETE LOGOUT FUNCTIONS
 * Function to log out the current user from the Expense Tracker Accounts database.
 * This function performs any necessary logout cleanup (if applicable) and returns a success status.
 *
 * @async
 * @function logout
 * @param {Object} event - The IPC event object (not used directly).
 * @returns {Object} An object containing:
 *   - success {Boolean} - True if logout was successful; false otherwise.
 *   - error {String} (optional) - An error message if the logout process fails.
 */
ipcMain.handle('logout', async (event) => {
    try {
        // Perform any necessary logout cleanup here (e.g., logging, cache clearing, etc.).
        console.log("User logged out successfully.");
        return { success: true };
    } catch (err) {
        console.error("Logout error:", err);
        return { success: false, error: err.message };
    }
});
module.exports = function registerIPCHandlers() {
    console.log("IPC Handlers registered.");
};


