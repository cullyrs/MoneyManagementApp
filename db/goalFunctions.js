/**
 * Name : Arewa (Morountudun) Ojelade
 * Date : 1/31/2025
 * File Name: transaction.js
 * Course : CMSC 495 Capstone in Computer Science
 * Project : Expense Tracker Capstone Project
 * Description : The purpose of the goal.js module is to provide 
 * compact functions to interact with the Goal collection of
 * the Expense Tracker Accounts database.
 */
// const Category = require('./models/Category.js');
const Goal = require ('./models/Goal.js');
const User = require('./models/User.js');


/**
 * Function to add a goal to the Goal collection of the 
 * Expense Tracker Accounts database. The goalList array in the 
 * User collection is updated with the unique goal _id.
 * @param {String} userID - The unique _id of the associated User instance.
 * @param {Double} targetAmount - The targeted goal amount to save.
 * @param {Int32} savedAmount - The current amount saved towards target goal.
 * @param {Date} savedToDate - The targeted date to save until.
 * @returns {Object} The created instance of the goal object.
 * Returns null if :
 *   1. Invalid userID is provided.
 *   3. Invalid targetAmount is provided.
 */
const addGoal = async (userID, name, totalAmount, month) => {
    totalAmount = parseFloat(totalAmount);

    const user = await User.findOne({ _id: userID });

    if (!user || !name || !totalAmount || !month) {
        console.error("Invalid goal parameters:", { userID, name, totalAmount, month });
        return null;
    }

    const goal = await Goal.create({
        userID,
        name,
        month,
        totalAmount,
        current: 0 // Initialize savings to 0
    });

    await user.save();
    return goal;
};

/**
 * Function to retrieve a goal from the goal collection of the 
 * Expense Tracker Accounts database. The unique goal _id of the goal
 * must be associated with the goalList array in the specified User collection.
 * @param {String} userID - The unique _id of the associated User instance. 
 * @param {String} goalID - The unique _id of the goal. 
 * @returns {Object} The instance of the goal object.
 * Returns null if :
 *      1. Invalid userID is provided.
 *      2. goalID is not associated with the User instance provided.
 */
const getGoalByMonth = async (userID, month) => {
    return await Goal.findOne({ userID, month });
};

/**
 * Function to remove a goal from the Goal collection of the 
 * Expense Tracker Accounts database. The unique goal _id of the goal
 * is removed from the goalList array in the User collection.
 * @param {String} userID - The unique _id of the associated User instance. 
 * @param {String} goalID - The unique _id of the goal. 
 * @returns {Object} The removed instance of the goal object.
 * Returns null if :
 *      1. Invalid userID is provided.
 *      2. goalID is not associated with the User instance provided.
 */
const removeGoal = async (userID, month) => {
    const user = await User.findOne({ _id: userID });
    if (!user) return null;

    const goal = await Goal.findOne({ userID, month });
    if (!goal) return null;

    const finalCopy = JSON.parse(JSON.stringify(goal));
    await Goal.deleteOne({ userID, month }); // Delete by user and month

    await user.save();
    return finalCopy;
};

/**
 * Function to retrieve a goal's total saved amount from the goal collection of the 
 * Expense Tracker Accounts database. The unique goal _id of the goal
 * must be associated with the goalList array in the specified User collection.
 * @param {String} userID - The unique _id of the associated User instance. 
 * @param {String} goalID - The unique _id of the goal. 
 * @returns {Object} The instance of the goal object.
 * Returns null if :
 *      1. Invalid userID is provided.
 *      2. goalID is not associated with the User instance provided.
 */
const getSavedAmount = async(userID, goalID)=>{
    const user = await User.findOne({_id : userID});
    const index = user.goalList.indexOf(goalID);

    if(user && index >= 0){
        const goal = await Goal.findOne({_id : goalID});
        return goal.savedAmount;
    }
    return null;
}
/**
 * Function to retrieve a goal's target amount from the goal collection of the 
 * Expense Tracker Accounts database. The unique goal _id of the goal
 * must be associated with the goalList array in the specified User collection.
 * @param {String} userID - The unique _id of the associated User instance. 
 * @param {String} goalID - The unique _id of the goal. 
 * @returns {Object} The instance of the goal object.
 * Returns null if :
 *      1. Invalid userID is provided.
 *      2. goalID is not associated with the User instance provided.
 */
const getTargetAmount = async(userID, goalID)=>{
    const user = await User.findOne({_id : userID});
    const index = user.goalList.indexOf(goalID);

    if(user && index >= 0){
        const goal = await Goal.findOne({_id : goalID});
        return goal.target;
    }
    return null;
}

/**
 * Function to change a goal's target amount in the goal collection 
 * of the Expense Tracker Accounts database. 
 * @param {String} userID - The unique _id of the associated User instance. 
 * @param {String} goalID - The unique _id of the goal. 
 * @param {Double} newTargetAmount - The updated goal target amount.
 * @returns {Object} The updated instance of the goal object.
 * Returns null if :
 *      1. Invalid userID is provided.
 *      2. Invalid targetAmount is provided. (Positive values only)
 *      3. goalID is not associated with the User instance provided.
 */
const updateTargetAmount = async(userID, goalID, newTargetAmount) => {
    const user = await User.findOne({_id : userID});
    const goal = await Goal.findOne({_id : goalID}); 
    if(!user || !newTargetAmount > 0 && !goal) return null;
    newTargetAmount = parseFloat(newTargetAmount);

    // Update and save goal instance.
    goal.set('target' , newTargetAmount);
    await goal.save();
    return goal;
}

/**
 * Function to change a goal's saved amount in the goal collection 
 * of the Expense Tracker Accounts database. 
 * @param {String} userID - The unique _id of the associated User instance. 
 * @param {String} month - The unique month of the goal. 
 * @param {Double} totalAmount - The updated goal saved amount.
 * @param {string} name - The name of the goal.
 * @returns {Object} The updated instance of the goal object.
 * Returns null if :
 *      1. Invalid userID is provided.
 *      2. Invalid savedAmount is provided. (Positive values only)
 *      3. goalID is not associated with the User instance provided.
 */
const updateSavedAmount = async(userID, month, totalAmount, name) => {
    totalAmount = parseFloat(totalAmount);

    const user = await User.findOne({ _id: userID });
    const goal = await Goal.findOne({ userID: userID, month: month });


    if (!user || !totalAmount || !month) {
        console.error("Invalid goal parameters:", { userID, totalAmount, month });
        return null;
    }

    // Update and save goal instance.
    goal.set('totalAmount' , totalAmount);
    goal.set('name', name);
    await goal.save();
    return goal;
}
/**
 * Function to add an amount to a goal's saved amount in the goal collection 
 * of the Expense Tracker Accounts database. 
 * @param {String} userID - The unique _id of the associated User instance. 
 * @param {String} goalID - The unique _id of the goal. 
 * @param {Double} amount - The amount to increase goal saved amount.
 * @returns {Object} The updated instance of the goal object.
 * Returns null if :
 *      1. Invalid userID is provided.
 *      2. Invalid amount is provided. (Positive values only)
 *      3. goalID is not associated with the User instance provided.
 */
const increaseSavedAmount = async (userID, month, amount) => {
    amount = parseFloat(amount);
    const user = await User.findOne({ _id: userID });
    // find by month instead of goalID, in format "YYYY-MM"
    const goal = await Goal.findOne({month: month});

    if (!user || isNaN(amount) || amount < 0 || !goal) {
        console.error("Invalid goal update parameters:", { userID, month, amount });
        return null;
    }

    goal.current += amount;
    await goal.save();
    return goal;
};

async function getAllGoals(userID) {
    try {
        return await Goal.find({ userID }).sort({ month: -1 }); // Sort by most recent month first
    } catch (error) {
        console.error("Error fetching all goals:", error);
        return [];
    }
}
module.exports ={addGoal, removeGoal, getGoalByMonth, updateTargetAmount,
    updateSavedAmount, increaseSavedAmount, getSavedAmount,
    getTargetAmount, getAllGoals
};