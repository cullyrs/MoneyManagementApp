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

import mongoose from "mongoose";
import Category from "./models/Category.js";
import Transaction from "./models/Transaction.js";
import Budget from "./models/Budget.js";
import User from "./models/User.js";
import connectDB from "./dbconnect.js"; connectDB();

/**
 * Function to add a budget to the Budget collection of the 
 * Expense Tracker Accounts database. The budgetList array in the 
 * User collection is updated with the unique budget _id.
 * @param {String} userID - The unique _id of the associated User instance.
 * @param {String} name - The name of the associated Budget instance.
 * @param {Double} amount - The budget amount.
 * @param {Int32} categoryID - The unique categoryID (id) of the budget. 
 * @returns {Object} The  created instance of the budget object.
 * Returns null if :
 *   1. Invalid userID is provided.
 *   2. No name is provided.
 *   3. Invalid amount is provided.
 */
const addBudget = async(userID, name, amount, categoryID = 0) =>{    
    const user = await User.findOne({_id : userID});
    const category_exist = await Category.findOne({categoryID : categoryID});
        if(!category_exist){
            categoryID = 0;
        }
    if(user && name && amount > 0){
        const budget = await Budget.create({
            userID : userID,
            name : name,
            amount : amount,
            categoryID : categoryID
        });
        user.budgetList.push(budget._id);
        user.save();
        return budget;
    }
    return null;
}
/**
 * Function to remove a budget from the Budget collection of the 
 * Expense Tracker Accounts database. The unique budget _id of the budget
 * is removed from the budgetList array in the User collection.
 * @param {String} userID - The unique _id of the associated User instance. 
 * @param {String} budgetID - The unique _id of the budget. 
 * @returns {Object} The removed instance of the budget object.
 * Returns null if :
 *      1. Invalid userID is provided.
 *      2. budgetID is not associated with the User instance provided.
 */
const removeBudget = async(userID, budgetID)=>{
    const user = await User.findOne({_id : userID});
    const index = user.budgetList.indexOf(budgetID);

    if(user && index >= 0){
        const budget = await Budget.findOneAndDelete({_id : budgetID});
        user.budgetList.splice(index, 1);
        await user.save();
        return budget;
    }
    return null;
}
/**
 * Function to retrieve a budget from the Budget collection of the 
 * Expense Tracker Accounts database. The unique budget _id of the budget
 * must be associated with the budgetList array in the specified User collection.
 * @param {String} userID - The unique _id of the associated User instance. 
 * @param {String} budgetID - The unique _id of the budget. 
 * @returns {Object} The instance of the budget object.
 * Returns null if :
 *      1. Invalid userID is provided.
 *      2. budgetID is not associated with the User instance provided.
 */
const getBudget = async(userID, budgetID)=>{
    const user = await User.findOne({_id : userID});
    const index = user.budgetList.indexOf(budgetID);

    if(user && index >= 0){
        const budget = await Budget.findOne({_id : budgetID});
        return budget;
    }
    return null;
}
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
const updateBudgetName = async(userID, budgetID, newName) =>{
    const user = await User.findOne({_id : userID});
    const index = user.budgetList.indexOf(budgetID);
    if(user && newName && index >= 0){
        const budget = await Budget.findOneAndUpdate({_id : budgetID, name : newName});
        await budget.save();
        return budget;
    }
    return null;
}
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
const updateBudgetAmount = async(userID, budgetID, newAmount) =>{
    const user = await User.findOne({_id : userID});
    const index = user.budgetList.indexOf(budgetID);
    if(user && newAmount > 0 && index >= 0){
        const budget = Budget.findOneAndUpdate({_id : budgetID, amount : newAmount});
        await budget.save();
        return budget;        
    }
    return null;
}
/**
 * Function to change a budget's amount in the Budget collection 
 * of the Expense Tracker Accounts database. 
 * @param {String} userID - The unique _id of the associated User instance. 
 * @param {String} budgetID - The unique _id of the budget. 
 * @param {Double} newCategoryID - The unique categoryID of the category.
 * @returns {Object} The updated instance of the budget object.
 * Returns null if :
 *      1. Invalid userID is provided.
 *      2. budgetID is not associated with the User instance provided.
 */
const updateBudgetCategory = async(userID, budgetID, newCategoryID) =>{
    const user = await User.findOne({_id : userID});
    const index = user.budgetList.indexOf(budgetID);
    if(user && index >= 0){
        const budget = Budget.findOneAndUpdate({_id : budgetID, categoryID : newCategoryID});
        await budget.save();
        return budget;        
    }
    return null;
}

const checkIfOverBudget = async(userID, budgetID) =>{
    // TODO : Implement function
    if(/**expenses in budget category is greater than budget */ true){
        return true;
    }
    return false;
}
export{addBudget as default, getBudget, removeBudget, updateBudgetName,
       updateBudgetAmount, updateBudgetCategory

};
