import mongoose from "mongoose";
import Category from "./models/Category.js";
import Transaction from "./models/Transaction.js";
import User from "./models/User.js";
import connectDB from "./dbconnect.js"; connectDB();

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
            // category : {id : category, 
            //     name : await Category.where("id").equals(category)
            // },
            description : description
       });       
        user.transactionList.push(transaction._id);
        
        user.totalAmount = (transaction.type == 0) ?
                            user.totalAmount-= transaction.amount:
                            user.totalAmount+= transaction.amount;
      
        await user.save();
        await transaction.save();
        console.log(user);
        return user;
        
    }
    return null
}
const removeTransaction = async (userID, transactionID) =>{
    const user = await User.findOne({_id : userID});
    const index = user.transactionList.indexOf(transactionID);
    
    if(user && index >= 0){
        const transaction = await Transaction.findOneAndDelete({_id : transactionID});
        user.transactionList.splice(index, 1);
        user.totalAmount = (transaction.type == 0) ?
                            user.totalAmount+= transaction.amount:
                            user.totalAmount-= transaction.amount;
        await user.save();
    }
   return null
}

const changeTransactionType = async (userID, transactionID, type) =>{
    const user = await User.findOne({_id : userID});
    const index = user.transactionList.indexOf(transactionID);
    if(user && index >= 0 && (type == 0 || type == 1)){
        const transaction = Transaction.findOneAndUpdate({_id : transactionID, type: type});
        
        user.totalAmount = (transaction.type == 0) ?
                            user.totalAmount-= (transaction.amount * 2):
                            user.totalAmount+= (transaction.amount * 2);
        await user.save();
        await transaction.save();
        return transaction;
    }
    return null;

}

const changeTransactionCategory = async(userID, transactionID, category) =>{
    // TODO : Implement function
}
const changeTransactionAmount = async(userID, transactionID, amount) => {
    const user = await User.findOne({_id : userID});
    const index = user.transactionList.indexOf(transactionID);
    if(user && index >= 0){
        const transaction = Transaction.findOne({_id : transactionID});
        const previousAmount = transaction.amount;
        const currentTotal = user.totalAmount;
        if(transaction.type == 0){
            user.updateOne({totalAmount : currentTotal + previousAmount - amount});
            transaction.updateOne({amount : amount});
        }else{
            user.updateOne({totalAmount : currentTotal - previousAmount + amount});
        }
        await user.save();
        await transaction.save();
        return transaction;
    }
    return null;
}

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
