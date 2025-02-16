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
const Category = require('./models/Category.js');
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
const addGoal = async(userID, targetAmount, savedAmount = 0, 
                     savedToDate = new Date(Date.now() + 30 * 24 * 3600 * 1000)) =>{    
    const user = await User.findOne({_id : userID});
    targetAmount = parseFloat(targetAmount);
    savedAmount = parseFloat(savedAmount);
    
    if(user && targetAmount > 0 ){
       
        const goal = await Goal.create({
            userID : userID,
            targetAmount : targetAmount,
            savedAmount : savedAmount,            
            savedToDate : new Date(savedToDate)
        });
        user.goalList.push(goal._id);
        user.save();
        return goal;
    }
    return null;
}
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
const removeGoal = async (userID, goalID) =>{
    const user = await User.findOne({_id : userID});
    const index = user.goalList.indexOf(goalID);
    if(user && index >= 0){
        
        const goal = await Goal.findOne({_id : goalID});
        const finalCopy = JSON.parse(JSON.stringify(goal));
        await Goal.deleteOne({_id : goalID});

        // Removes goal _id from goalList.
        user.goalList.splice(index, 1);

        await user.save();
        return finalCopy;
    }
   return null
}
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
const getGoal = async(userID, goalID)=>{
    const user = await User.findOne({_id : userID});
    const index = user.goalList.indexOf(goalID);

    if(user && index >= 0){
        const goal = await Goal.findOne({_id : goalID});
        return goal;
    }
    return null;
}
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
        return goal.current;
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
    const index = user.goalList.indexOf(goalID);
    if(user && newTargetAmount > 0 && index >= 0){
        const goal = await Goal.findOne({_id : goalID});      
     
        // Update and save goal instance.
        goal.set('target' , newTargetAmount);
        await goal.save();
        return goal;
    }
    return null;
}

/**
 * Function to change a goal's saved amount in the goal collection 
 * of the Expense Tracker Accounts database. 
 * @param {String} userID - The unique _id of the associated User instance. 
 * @param {String} goalID - The unique _id of the goal. 
 * @param {Double} newSavedAmount - The updated goal saved amount.
 * @returns {Object} The updated instance of the goal object.
 * Returns null if :
 *      1. Invalid userID is provided.
 *      2. Invalid savedAmount is provided. (Positive values only)
 *      3. goalID is not associated with the User instance provided.
 */
const updateSavedAmount = async(userID, goalID, newSavedAmount) => {
    const user = await User.findOne({_id : userID});
    const index = user.goalList.indexOf(goalID);
    if(user && newSavedAmount > 0 && index >= 0){
        const goal = await Goal.findOne({_id : goalID});      
     
        // Update and save goal instance.
        goal.set('current' , newSavedAmount);
        await goal.save();
        return goal;
    }
    return null;
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
const increaseSavedAmount = async(userID, goalID, amount) => {
    const user = await User.findOne({_id : userID});
    const index = user.goalList.indexOf(goalID);
    if(user && amount > 0 && index >= 0){
        const goal = await Goal.findOne({_id : goalID});      
     
        // Update and save goal instance.
        goal.set('current' , goal.current + amount);
        await goal.save();
        return goal;
    }
    return null;
}
module.exports ={addGoal, removeGoal, getGoal, updateTargetAmount,
    updateSavedAmount, increaseSavedAmount, getSavedAmount,
    getTargetAmount
};