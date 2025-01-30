import mongoose from "mongoose";
import User from "./models/User.js";
import Transaction from "./models/Transaction.js";
import Category from "./models/Category.js";
import hashed,{compareEntry} from "../utils/helper.js";
import connectDB from "./dbconnect.js"; connectDB();

// Create a new user
const  addUser = async (name, entry, email,amount)=>{
    const user = await User.create({
         userName: name,
         password : await hashed(entry),
         email : email,
         totalAmount : parseFloat(amount)
    });
    return user;
}
const updateTotalAmount = async(userID, newAmount)=>{
    const user = await User.where("_id").equals(userID);
    if(user[0]){
        user[0].totalAmount = parseFloat(newAmount);
        await user[0].save();
        return user[0];
    }
    else{
        return null;
    }

}
const updateUsername = async(userID, newName)=>{
    const user = await User.where("_id").equals(userID);
    if(user[0]){
        user[0].userName = newName;
        await user[0].save();
        return user[0];
    }
    else{
        return null;
    }

}
const updateEmail = async (oldEmail, newEmail) =>{
    const user = await User.where("email").equals(oldEmail);
    if(user[0]){
        user[0].email = newEmail;
        await user[0].save();
        return user[0];
    }
    else{
        return null;
    }
}
const findUser = async(email) =>{
    const user = await User.where("email").equals(email);
    if(user[0]){
        return user[0];
    }
    return null;
}
const loginUser = async(email_, entry) =>{
    const user = await User.where("email").equals(email_);
    if(user[0] && await compareEntry(entry,user[0].password)){
        return user[0];
    }
    return null;
}
const addTransaction = async(userID, amount,  notes ="", category = 0,type = 'expense') =>{
    const user = await User.where("_id").equals(userID);
    if(user[0]){
        const transaction = await Transaction.create({
            userID: user[0]._id,
            amount : parseFloat(amount),
            type : type,
            category : category,
            notes : notes
       });       
        user[0].transactionList.push(transaction._id);
        await user[0].save();
        return user[0];
    }
    else{
        return null;
    }
}
export{ addUser as default, findUser, loginUser, updateEmail,
        updateTotalAmount, updateUsername, addTransaction
};


