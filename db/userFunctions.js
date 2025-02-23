/**
 * Name : Arewa (Morountudun) Ojelade
 * Date : 1/31/2025
 * File Name: user.js
 * Course : CMSC 495 Capstone in Computer Science
 * Project : Expense Tracker Capstone Project
 * Description : The purpose of the user.js module is to provide 
 * compact functions to Interact with the User collection of
 * the Expense Tracker Accounts database.
 */

const User = require('./models/User.js');
const Transactions = require('./models/Transactions.js');
const Budget = require('./models/Budget.js');
const Goal = require('./models/Goal.js');
const { hashed, compareEntry } = require('../utils/helper.js');

/**
 * Function to add a user to the User collection of the 
 * Expense Tracer Accounts database.
 * @param {String} name - The name of the user. 
 * @param {String} entry - The string provided to access user account.
 * @param {String} email - The email of the user.
 * @param {Double} amount - The total amount of funds currently available.
 * @returns {Object} The  created instance of the user object.
  * Returns null if :
 *      1. Invalid name/entry/email is provided. (Empty String)
 *      2. Invalid amount is provided (Positive values only)
 */
const addUser = async (username, entry, email) => {
    console.log("addUser inputs:", { username, entry, email });
    const name = username.toLowerCase();
    if (username && entry && email) {
        const user = await User.create({
            userName: name,
            password: await hashed(entry),
            email: email,
            totalAmount: 0
        });
        return user;
    }
    return null;
}
/**
 * Function to find a user instance with an email in the User collection of the 
 * Expense Tracer Accounts database.
 * @param {String} email - The current email of the User instance.
 * @returns {Object} The instance of the associated user object.
 * Returns null if User collection is unassociated with email provided.
 */
const getUser = async (email) => {
    email = email.toLowerCase();
    const user = await User.findOne({ email: email });
    if (user) {
        return user;
    }
    return null;
}

/**
 * Function to find a user instance with unique _id in the User collection of the 
 * Expense Tracer Accounts database.
 * @param {String} userID - The unique id of the User instance. 
 * @returns {Object} The instance of the associated user object.
 * Returns null if User collection is unassociated with email provided.
 */
const findUser = async (userID) => {
    try {
        const user = await User.findById(userID)
            .populate("budgetList") // Fetch full budget objects
            .populate("goalList") // Fetch full goal objects
            .lean(); // Convert to plain JS object

        return user;
    } catch (error) {
        console.error("Error finding user:", error);
        return null;
    }
    return null;
}
/**
 * Function to confirm login of a user instance in the User collection of the 
 * Expense Tracer Accounts database.
 * @param {String} email - The current email of the User instance.
 * @param {String} entry - The string provided to access user account.
 * @returns {Object} An array in the following indices:
 *                  0. The instance of the associated user object.
 *                  1. The transaction objects associated with the user.
 *                  2. The budget objects associated with the user.
 *                  3. The goal objects associated with the user.
 * Returns null if:
 *      1. User collection is unassociated with email provided.
 *      2. Invalid entry is provided. (Current entry mismatch)
 */
const loginUser = async (userName, entry) => {
    const name = userName;
    const user = await User.findOne({ userName: name });
    if (user && await compareEntry(entry, user.password)) {
        const transactions = await Transactions.where("userID").equals(user._id);
        const budgets = await Budget.where("userID").equals(user._id);
        const goals = await Goal.where("userID").equals(user._id);
        return [user, transactions, budgets, goals];
    }
    return null;
}
/**
 * Function to update the toatal amount in the User collection of the 
 * Expense Tracer Accounts database.
 * @param {String} userID - The unique id of the User instance. 
 * @param {Double} newAmount - The updated total amount currently available.
 * @returns {Object} The updated instance of the user object. 
 * Returns null if :
 *      1. Invalid userID is provided.
 *      2. Invalid amount is provided (Positive values only)
 */
const updateTotalAmount = async (userID, newAmount) => {

    const user = await User.findById(userID).exec();
    if (user && newAmount > 0) {
        user.totalAmount = parseFloat(newAmount);
        await user.save();
        return user;
    }
    return null;
}

/**
 * Function to update the user's name in the User collection of the 
 * Expense Tracer Accounts database.
 * @param {String} userID - The unique id of the User instance. 
 * @param {String} newName - The updated name.
 * @returns {Object} The updated instance of the user object. 
  * Returns null if :
 *      1. Invalid userID is provided.
 *      2. Invalid newName is provided. (Empty String)
 */
const updateUserName = async (userID, newName) => {
    const user = await User.findById(userID).exec();
    if (user && newName) {
        user.userName = newName;
        await user.save();
        return user;
    }
    return null;

}

/**
 * Function to update the user's email in the User collection of the 
 * Expense Tracer Accounts database.
 * @param {String} userID - The unique id of the User instance. 
 * @param {String} oldEmail - The current email of the User instance.
 * @param {String} newEmail - The updated email of the User instance.
 * @returns {Object} The updated instance of the user object. 
 * Returns null if :
 *      1. Invalid userID is provided.
 *      2. Invalid newEmail is provided. (Empty String)
 *      3. Unassociated email is provided.
 */
const updateEmail = async (userID, oldEmail, newEmail) => {
    oldEmail = oldEmail.toLowerCase();
    newEmail = newEmail.toLowerCase();
    const user = await User.findOne({ _id: userID }).where("email").equals(oldEmail);
    console.log(user);
    if (user && newEmail) {
        try {
            user.email = newEmail;
            await user.save();
            return user;
        } catch (error) {
            return null;
        }
    }
    return null;
}

/**
 * Function to update password of a user instance in the User collection of the 
 * Expense Tracer Accounts database.
 * @param {String} userID - The current unique id of the User instance.
 * @param {String} oldEntry - The current string to access user account.
 * @param {String} newEntry - The updated string provided to access user account.
 * @returns {Object} The pudated instance of the associated user object.
 * Returns null if:
 *      1.  User collection is unassociated with id provided.
 *      2.  Invalid oldEntry is provided. (Current entry mismatch)
 *      3. Invalid newEntry is provided. (Empty String)
 */
const updatePassword = async (userID, oldEntry, newEntry) => {
    const user = await User.findOne({ _id: userID });
    if (await loginUser(user.email, oldEntry) && newEntry) {
        user.set('password', await hashed(newEntry));
        await user.save();
        return user;
    }
    return null;
}

module.exports = {
    addUser, findUser, getUser, loginUser, updateEmail,
    updatePassword, updateTotalAmount, updateUserName
};