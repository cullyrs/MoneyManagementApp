/**
 * Name : Arewa (Morountudun) Ojelade
 * Date : 1/31/2025
 * File Name: transaction.js
 * Course : CMSC 495 Capstone in Computer Science
 * Project : Expense Tracker Capstone Project
 * Description : The purpose of the transaction.js module is to provide 
 * compact functions to interact with the Transcaction collection of
 * the Expense Tracker Accounts database.
 */

import mongoose from "mongoose";
import Category from "./models/Category.js";
import Transaction from "./models/Transaction.js";
import User from "./models/User.js";
import connectDB from "./dbconnect.js"; connectDB();

/**
 * Function to add a transaction to the Transaction collection of the 
 * Expense Tracker Accounts database. The transactionList array in the 
 * User collection is updated with the unique transaction _id.
 * @param {String} userID - The unique _id of the associated User instance. 
 * @param {Double} amount - The transaction amount.
 * @param {INT32} type - {Expense : 0, Income : 1} The bit interpretation of the transaction type.
 * @param {Date} date - The transaction date.
 * @param {INT32} category - The unique categoryID (id) of the transaction. 
 * @returns {Object} The  created instance of the transaction object.
 * Returns null if :
 *      1. Invalid userID is provided.
 *      2. Type is not {Expense : 0, Income : 1} The bit interpretation of transaction type.
 */
const addTransaction = async(userID, amount, type = 0, date = date, 
    category = 0, description ="") => {
        
    const user = await User.findOne({_id : userID});
    if(user && (type == 0 || type == 1)){
        console.log(user._id);
        
        const category_exist = await Category.findOne({id : category});
        if(!category_exist){
            category = 0;
        }
        const transaction = await Transaction.create({
            userId : user._id,
            amount : parseFloat(amount),
            type : type,
            date : date,
            // CATEGORY UNDER CONSTRUCTION
            // category : {id : category, 
            //     name : await Category.where("id").equals(category)
            // },
            description : description
       });       
        // Updates transactionList with created transtion _id.
        user.transactionList.push(transaction._id);
        
        // Increments/Decrements totalAmount in accordance with type.
        user.totalAmount = (transaction.type == 0) ?
                            user.totalAmount-= transaction.amount:
                            user.totalAmount+= transaction.amount;
      
        await user.save();
        await transaction.save();
        console.log(user);
        return transaction;
        
    }
    return null
}
/**
 * Function to remove a transaction from the Transaction collection of the 
 * Expense Tracker Accounts database. The unique transaction _id of the transaction
 * is removed from the transactionList array in the User collection.
 * @param {String} userID - The unique _id of the associated User instance. 
 * @param {String} transactionID - The unique _id of the transaction. 
 * @returns {Object} The updated instance of the transaction object.
 * Returns null if :
 *      1. Invalid userID is provided.
 *      2. transactionID is not associated with the User instance provided.
 */
const removeTransaction = async (userID, transactionID) =>{
    const user = await User.findOne({_id : userID});
    const index = user.transactionList.indexOf(transactionID);
    
    if(user && index >= 0){
        const transaction = await Transaction.findOneAndDelete({_id : transactionID});

        // Removes transaction _id from transactionList.
        user.transactionList.splice(index, 1);

        // Increments/Decrements totalAmount in accordance with type.
        user.totalAmount = (transaction.type == 0) ?
                            user.totalAmount+= transaction.amount:
                            user.totalAmount-= transaction.amount;
        await user.save();
        await transaction.save();
        return transaction;
    }
   return null
}

/**
 * Function to change a transaction's type in the Transaction collection 
 * of the Expense Tracker Accounts database. 
 * @param {String} userID - The unique _id of the associated User instance. 
 * @param {String} transactionID - The unique _id of the transaction. 
 * @param {INT32} type - {Expense : 0, Income : 1} The bit interpretation of the transaction type.
 * @returns {Object} The updated instance of the transaction object.
 * Returns null if :
 *      1. Invalid userID is provided.
 *      2. transactionID is not associated with the User instance provided.
 */
const changeTransactionType = async (userID, transactionID, type) =>{
    const user = await User.findOne({_id : userID});
    const index = user.transactionList.indexOf(transactionID);
    if(user && index >= 0 && (type == 0 || type == 1)){
        const transaction = Transaction.findOneAndUpdate({_id : transactionID, type: type});
        
        // Resets and increments/decrements total amount in accordance with type.
        user.totalAmount = (transaction.type == 0) ?
                            user.totalAmount-= (transaction.amount * 2):
                            user.totalAmount+= (transaction.amount * 2);
        await user.save();
        await transaction.save();
        return transaction;
    }
    return null;

}
//
const changeTransactionCategory = async(userID, transactionID, category) =>{
    // TODO : Implement function
}

/**
 * Function to change a transaction's amount in the Transaction collection 
 * of the Expense Tracker Accounts database. 
 * @param {String} userID - The unique _id of the associated User instance. 
 * @param {String} transactionID - The unique _id of the transaction. 
 * @param {Double} amount - The updated transaction amount.
 * @returns {Object} The updated instance of the transaction object.
 * Returns null if :
 *      1. Invalid userID is provided.
 *      2. transactionID is not associated with the User instance provided.
 */
const changeTransactionAmount = async(userID, transactionID, amount) => {
    const user = await User.findOne({_id : userID});
    const index = user.transactionList.indexOf(transactionID);
    if(user && index >= 0){
        const transaction = Transaction.findOne({_id : transactionID});
        const previousAmount = transaction.amount;
        const currentTotal = user.totalAmount;
        /* If transaction is an expense reset totalAmount by incrementing 
         * previous transaction ammount, then decrement totalAmount with updated 
         * transaction amount.
         */
        if(transaction.type == 0){
            user.set('totalAmount' , currentTotal + previousAmount - amount);
            
        }
        /* Else, transaction is income. Reset totalAmount by decrementing 
         * previous transaction ammount, then increment totalAmount with updated 
         * transaction amount.
         */
        else{
            user.set('totalAmount' , currentTotal - previousAmount + amount);
        }
        // Update and save trasaction instance.
        transaction.set('amount' , amount);
        await user.save();
        await transaction.save();
        return transaction;
    }
    return null;
}
/**
 * Function to change a transaction's date in the Transaction collection 
 * of the Expense Tracker Accounts database. 
 * @param {String} userID - The unique _id of the associated User instance. 
 * @param {String} transactionID - The unique _id of the transaction. 
 * @param {Date} date - The updated transaction date.
 * @returns {Object} The updated instance of the transaction object.
 * Returns null if :
 *      1. Invalid userID is provided.
 *      2. transactionID is not associated with the User instance provided.
 */
const changeTransactionDate = async(userID, transactionID, date) =>{
    const user = await User.findOne({_id : userID});
    const index = user.transactionList.indexOf(transactionID);
    if(user && index >= 0){
        const transaction = Transaction.findOneAndUpdate({_id : transactionID, date: date});
        await user.save();
        await transaction.save();
        return transaction;
    }
    return null;
}
export{addTransaction as default, removeTransaction, changeTransactionType,
       changeTransactionAmount, changeTransactionDate
}; 
