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
import Category from "./models/Category.js";
import Goal from "./models/Goal.js";
import User from "./models/User.js";
import connectDB from "./dbconnect.js"; connectDB();

/**
 * Function to add a goal to the Goal collection of the 
 * Expense Tracker Accounts database. The goalList array in the 
 * User collection is updated with the unique goal _id.
 * @param {String} userID - The unique _id of the associated User instance.
 * @param {String} name - The name of the associated goal instance.
 * @param {Double} targetAmount - The targeted goal amount to save.
 * @param {Int32} savedAmount - The current amount saved towards target goal.  * 
 * @param {Int32} categoryID - The categoryID that categorizes the goal. 
 * @returns {Object} The created instance of the goal object.
 * Returns null if :
 *   1. Invalid userID is provided.
 *   2. No name is provided.
 *   3. Invalid targetAmount is provided.
 */
const addGoal = async(userID, name, targetAmount, savedAmount = 0, 
                     savedToDate = new Date(Date.now() + 30 * 24 * 3600 * 1000), 
                     categoryID = 0) =>{    
    const user = await User.findOne({_id : userID});
    categoryID = parseInt(categoryID);
    targetAmount = parseFloat(targetAmount);
    savedAmount = parseFloat(savedAmount);
    
    const category_exist = await Category.findOne({categoryID : categoryID});
    if(!category_exist){
        categoryID = 0;
    }
     if(user && name && targetAmount > 0 ){
       
        const goal = await Goal.create({
            userID : userID,
            name : name,
            targetAmount : targetAmount,
            savedAmount : savedAmount,            
            savedToDate : new Date(savedToDate),
            categoryID : categoryID
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
        return goal.targetAmount;
    }
    return null;
}

/**
 * Function to change a goal's name in the Goal collection of the 
 * Expense Tracker Accounts database. 
 * @param {String} userID - The unique _id of the associated User instance. 
 * @param {String} goalID - The unique _id of the goal.
 * @param {String} newName - The updated goal name.  
 * @returns {Object} The updated instance of the goal object.
 * Returns null if :
 *      1. Invalid userID is provided.
 *      2. Invalid newName is provided. (Empty String)
 *      3. goalID is not associated with the User instance provided.
 */
const updateGoalName = async(userID, goalID, newName) =>{
    const user = await User.findOne({_id : userID});
    const index = user.goalList.indexOf(goalID);
    if(user && newName && index >= 0){
        const goal = await Goal.findOne({_id : goalID});
        goal.set('name' , newName);
        await goal.save();
        return goal;
    }
    return null;
}

/**
 * Function to change a goal's amount in the goal collection 
 * of the Expense Tracker Accounts database. 
 * @param {String} userID - The unique _id of the associated User instance. 
 * @param {String} goalID - The unique _id of the goal. 
 * @param {Double} newCategoryID - The new categoryId that categorizes the object.
 * @returns {Object} The updated instance of the goal object.
 * Returns null if :
 *      1. Invalid userID is provided.
 *      2. Invalid categoryID is provided.
 *      3. goalID is not associated with the User instance provided.
 */
const updateGoalCategory = async(userID, goalID, newCategoryID) =>{
    const user = await User.findOne({_id : userID});
    const index = user.goalList.indexOf(goalID);
    const category = await Category.findOne({categoryID : newCategoryID});
    if(user && category && index >= 0){
        const goal = await Goal.findOne({_id : goalID});
        goal.set('categoryID', newCategoryID);
        await goal.save();
        return goal;        
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
        goal.set('targetAmount' , newTargetAmount);
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
        goal.set('savedAmount' , newSavedAmount);
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
        goal.set('savedAmount' , goal.savedAmount + amount);
        await goal.save();
        return goal;
    }
    return null;
}
export{addGoal, removeGoal, getGoal, updateGoalName, 
    updateGoalCategory, updateTargetAmount, updateSavedAmount, 
    increaseSavedAmount, getSavedAmount, getTargetAmount

};
