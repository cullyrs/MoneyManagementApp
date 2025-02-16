/**
 * Name : Arewa (Morountudun) Ojelade
 * contributors : Cully Stearns, Naeem Lovitt
 * Date : 1/31/2025
 * File Name: transaction.js
 * Course : CMSC 495 Capstone in Computer Science
 * Project : Expense Tracker Capstone Project
 * Description : The purpose of the transaction.js module is to provide 
 * compact functions to interact with the Transcaction collection of
 * the Expense Tracker Accounts database.
 */


const Category = require('./models/Category.js');
const Transactions = require ('./models/Transactions.js');
const User = require ('./models/User.js');

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

const addTransaction = async (userID, amount, type, category, date, description = "") => {
    console.log("[Processing Transaction] =================="); //debugging
    console.log("Parameters Received:", { userID, amount, type, category, date, description });

    amount = parseFloat(amount);

    // Validate user
    const user = await User.findOne({ _id: userID });
    if (!user || amount <= 0 || !["expense", "income"].includes(type)) {
        console.error("Invalid user or transaction data.");
        return null;
    }

    console.log("Checking category exists for ID:", category);
    
    // check category is not being overwritten. had an issue with this happening
    const categoryData = await Category.findById(category);
    if (!categoryData) {
        console.error(`Category "${category}" not found.`);
        return null;
    }

    //  date properly formatted. had an issue with this happening
    const formattedDate = new Date(`${date}T00:00:00Z`);  // Force UTC conversion
    if (isNaN(formattedDate.getTime())) {
        console.error("Invalid date provided:", date);
        return null;
    }

    console.log("Category found:", categoryData.name, "Date Validated:", formattedDate);

    // Create transaction
    const transaction = await Transactions.create({
        userID: user._id,
        amount,
        type,
        date: formattedDate, // Make sure this is correctly formatted
        category: categoryData._id, // Store category ObjectId
        description,
    });

    console.log("Transaction Created:", transaction);

    // Update user's transaction list
    user.transactionList.push(transaction._id);

    // Adjust totalAmount based on transaction type
    user.totalAmount = (type === "expense")
        ? user.totalAmount - transaction.amount
        : user.totalAmount + transaction.amount;

    await user.save();
    return transaction;
};



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
const removeTransaction = async (userID, transactionID) => {
    const user = await User.findOne({ _id: userID });
    if (!user) return null;

    const index = user.transactionList.indexOf(transactionID);
    if (index >= 0) {
        const transaction = await Transactions.findOne({ _id: transactionID });
        if (!transaction) return null;

        // Remove transaction from DB
        await Transactions.deleteOne({ _id: transactionID });

        // Remove transaction _id from user's transaction list.
        user.transactionList.splice(index, 1);

        // Adjust totalAmount
        user.totalAmount = (transaction.type === 0)
            ? user.totalAmount + transaction.amount
            : user.totalAmount - transaction.amount;

        await user.save();
        return transaction;
    }
    return null;
};

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
        const transaction = await Transactions.findOne({_id : transactionID});
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
    newType = parseInt(newType);
    const user = await User.findOne({_id : userID});
    const index = user.transactionList.indexOf(transactionID);
    if(user && index >= 0 && (newType == 0 || newType == 1)){
        const transaction = await Transactions.findOne({_id : transactionID});
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
    newCategoryID = parseInt(newCategoryID);
    const user = await User.findOne({_id : userID});
    const index = user.transactionList.indexOf(transactionID);
    const category = await Category.findOne({categoryID : newCategoryID});
    
    if(user && category && index >= 0){
        const transaction = await Transactions.findOne({_id : transactionID});
        transaction.set('categoryID', newCategoryID);
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
    newAmount = parseFloat(newAmount);
    const user = await User.findOne({_id : userID});
    const index = user.transactionList.indexOf(transactionID);    
   
    if(user && newAmount > 0 && index >= 0){
        const transaction = await Transactions.findOne({_id : transactionID});
        var previousAmount = transaction.amount;
        var currentTotal = user.totalAmount;
        /* If transaction is an expense reset totalAmount by incrementing 
         * previous transaction ammount, then decrement totalAmount with updated 
         * transaction amount.
         */
        var updatedAmount = (transaction.type == 0) ? 
                             currentTotal + previousAmount - newAmount :
                             currentTotal - previousAmount + newAmount;

 
        /* Else, transaction is income. Reset totalAmount by decrementing 
         * previous transaction ammount, then increment totalAmount with updated 
         * transaction amount.
         */
    
        // Update and save trasaction and user instance.
        user.set('totalAmount', updatedAmount);
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
        const transaction = await Transactions.findOne({_id : transactionID});
        transaction.set('date', new Date(newDate));
        await transaction.save();
        return transaction;
    }
    return null;
}
/**
 * Function to retrieve all transactions for a user.
 * @param {String} userID - The unique _id of the associated User instance.
 * @returns {Array} Array of transactions, or empty array if none found.
 */
const getUserTransactions = async (userID) => {
    try {
        const user = await User.findOne({ _id: userID }).lean();
        if (!user) return []; // Ensure we always return an array

        // Fetch transactions associated with the user, include category details
        const transactions = await Transactions.find({ userID })
            .sort({ date: -1 })
            .populate("category", "name type") // Ensure category details are populated
            .lean();
        console.log("transactions", transactions);
        // print variable type
        console.log("type", typeof transactions);

        return transactions || []; // Always return an array
    } catch (error) {
        console.error("Error fetching transactions:", error);
        return []; 
    }
};



module.exports = {addTransaction, getTransaction, removeTransaction, updateTransactionType,
       updateTransactionAmount, updateTransactionDate, updateTransactionCategory, getUserTransactions,
}; 