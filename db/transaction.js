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
 * @param {Int32} type - {Expense : 0, Income : 1} The bit interpretation of the transaction type.
 * @param {Date} date - The transaction date.
 * @param {Int32} categoryID - The categoryID that categorizes the transaction. 
 * @returns {Object} The  created instance of the transaction object.
 * Returns null if :
 *      1. Invalid userID is provided.
 *      2. Invalid amount is provided. (Positive values only)
 *      3. Type is not {Expense : 0, Income : 1} The bit interpretation of transaction type.
 */
const addTransaction = async(userID, amount, type = 0, date = date, 
                            categoryID = 0, description ="") => {
        
    const user = await User.findOne({_id : userID});
    if(user && amount > 0 && (type == 0 || type == 1)){        
        const category_exist = await Category.findOne({categoryID : categoryID});
        if(!category_exist){
            categoryID = 0;
        }
        const transaction = await Transaction.create({
            userID : user._id,
            amount : parseFloat(amount),
            type : type,
            date : date,
            categoryID : categoryID,
            description : description
       });       
        // Updates transactionList with created transtion _id.
        user.transactionList.push(transaction._id);
        
        // Increments/Decrements totalAmount in accordance with type.
        user.totalAmount = (transaction.type == 0) ?
                            user.totalAmount-= transaction.amount:
                            user.totalAmount+= transaction.amount;
      
        await user.save();
        await transaction.save(); // #### test and remove (unecessary)
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
 * @returns {Object} The removed instance of the transaction object.
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
        await transaction.save(); // #### test and remove (unecessary)
        return transaction;
    }
   return null
}
/**
 * Function to retrieve a transaction from the Transaction collection of the 
 * Expense Tracker Accounts database. The unique transaction _id of the transaction
 * must be associated with the transactionList array in the specified User collection.
 * @param {String} userID - The unique _id of the associated User instance. 
 * @param {String} transactionID - The unique _id of the transaction. 
 * @returns {Object} The instance of the transaction object.
 * Returns null if :
 *      1. Invalid userID is provided.
 *      2. transactionID is not associated with the User instance provided.
 */
const getTransaction = async(userID, transactionID)=>{
    const user = await User.findOne({_id : userID});
    const index = user.transactionList.indexOf(transactionID);

    if(user && index >= 0){
        const transaction = await Transaction.findOne({_id : transactionID});
        return transaction;
    }
    return null;
}
/**
 * Function to change a transaction's type in the Transaction collection 
 * of the Expense Tracker Accounts database. 
 * @param {String} userID - The unique _id of the associated User instance. 
 * @param {String} transactionID - The unique _id of the transaction. 
 * @param {Int32} newType - {Expense : 0, Income : 1} The bit interpretation of the transaction type.
 * @returns {Object} The updated instance of the transaction object.
 * Returns null if :
 *      1. Invalid userID is provided.
 *      2. transactionID is not associated with the User instance provided.
 *      3. Type is not {Expense : 0, Income : 1} The bit interpretation of transaction type.
 *      4. Transaction type is unchanged.
 * 
 */
const updateTransactionType = async (userID, transactionID, newType) =>{
    const user = await User.findOne({_id : userID});
    const index = user.transactionList.indexOf(transactionID);
    if(user && index >= 0 && (newType == 0 || newType == 1)){
        const transaction = Transaction.findOne({_id : transactionID});
        if(transaction.type != newType){
            transaction.set('type', newType);
            // Resets and increments/decrements total amount in accordance with type.
            user.totalAmount = (transaction.type == 0) ?
                                user.totalAmount-= (transaction.amount * 2):
                                user.totalAmount+= (transaction.amount * 2);
            await user.save();
            await transaction.save();
            return transaction;
        }
    }
    return null;

}
/**
 * Function to change a transaction's amount in the Transaction collection 
 * of the Expense Tracker Accounts database. 
 * @param {String} userID - The unique _id of the associated User instance. 
 * @param {String} transactionID - The unique _id of the transaction. 
 * @param {Double} newCategoryID - The new categoryId that categorizes the object.
 * @returns {Object} The updated instance of the transaction object.
 * Returns null if :
 *      1. Invalid userID is provided.
 *      2. Invalid categoryID is provided.
 *      3. transactionID is not associated with the User instance provided.
 */
const updateTransactionCategory = async(userID, transactionID, newCategoryID) =>{
    const user = await User.findOne({_id : userID});
    const index = user.transactionList.indexOf(transactionID);
    const category = await Category.findOne({categeoryID : newCategoryID});
    if(user && category && index >= 0){
        const transaction = Transaction.findOneAndUpdate({_id : transactionID, categoryID : newCategoryID});
        await transaction.save();
        return transaction;        
    }
    return null;
}

/**
 * Function to change a transaction's amount in the Transaction collection 
 * of the Expense Tracker Accounts database. 
 * @param {String} userID - The unique _id of the associated User instance. 
 * @param {String} transactionID - The unique _id of the transaction. 
 * @param {Double} newAmount - The updated transaction amount.
 * @returns {Object} The updated instance of the transaction object.
 * Returns null if :
 *      1. Invalid userID is provided.
 *      2. Invalid amount is provided. (Positive values only)
 *      3. transactionID is not associated with the User instance provided.
 */
const updateTransactionAmount = async(userID, transactionID, newAmount) => {
    const user = await User.findOne({_id : userID});
    const index = user.transactionList.indexOf(transactionID);
    if(user && newAmount > 0 && index >= 0){
        const transaction = Transaction.findOne({_id : transactionID});
        const previousAmount = transaction.amount;
        const currentTotal = user.totalAmount;
        /* If transaction is an expense reset totalAmount by incrementing 
         * previous transaction ammount, then decrement totalAmount with updated 
         * transaction amount.
         */
        if(transaction.type == 0){
            user.set('totalAmount' , currentTotal + previousAmount - newAmount);
            
        }
        /* Else, transaction is income. Reset totalAmount by decrementing 
         * previous transaction ammount, then increment totalAmount with updated 
         * transaction amount.
         */
        else{
            user.set('totalAmount' , currentTotal - previousAmount + newAmount);
        }
        // Update and save trasaction and user instance.
        transaction.set('amount' , newAmount);
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
 * @param {Date} newDate - The updated transaction date.
 * @returns {Object} The updated instance of the transaction object.
 * Returns null if :
 *      1. Invalid userID is provided.
 *      2. transactionID is not associated with the User instance provided.
 */
const updateTransactionDate = async(userID, transactionID, newDate) =>{
    const user = await User.findOne({_id : userID});
    const index = user.transactionList.indexOf(transactionID);
    if(user && index >= 0){
        const transaction = Transaction.findOneAndUpdate({_id : transactionID, date: newDate});
        await transaction.save();
        return transaction;
    }
    return null;
}
export{addTransaction as default, getTransaction, removeTransaction, updateTransactionType,
       updateTransactionAmount, updateTransactionDate, updateTransactionCategory
}; 
