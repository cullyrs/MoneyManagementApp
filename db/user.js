/**
 * Name : Arewa (Morountudun) Ojelade
 * Date : 1/31/2025
 * File Name: user.js
 * Course : CMSC 495 Capstone in Computer Science
 * Project : Expense Tracker Capstone Project
 * Description : The purpose of the user.js module is to provide 
 * compact functions to interact with the User collection of
 * the Expence Tracker Accounts database.
 */
import mongoose from "mongoose";
import User from "./models/User.js";
import Transaction from "./models/Transaction.js";
import Category from "./models/Category.js";
import hashed,{compareEntry} from "../utils/helper.js";
import connectDB from "./dbconnect.js"; connectDB();

/**
 * Function to add a user to the User collection of the 
 * Expense Tracer Accounts database.
 * @param {String} name - The name of the user. 
 * @param {String} entry - The string provided to access user account.
 * @param {String} email - The email of the user.
 * @param {Number} amount - The total amount of funds currently available.
 * @returns {Object} The  created instance of the user object.
 */
const  addUser = async (name, entry, email,amount)=> {
    const user = await User.create({
         userName: name,
         password : await hashed(entry),
         email : email,
         totalAmount : parseFloat(amount)
    });
    return user;
}
/**
 * Function to update the toatal amount in the User collection of the 
 * Expense Tracer Accounts database.
 * @param {String} userID - The unique id of the User instance. 
 * @param {Number} newAmount - The updated total amount currently available.
 * @returns {Object} The updated instance of the user object. 
 * Returns null if invalid userID is provided.
 */
const updateTotalAmount = async(userID, newAmount)=>{
    
    const user = await User.findById(userID).exec();
    if(user){
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
 * Returns null if invalid userID is provided.
 */
const updateUsername = async(userID, newName)=> {
    const user = await User.findById(userID).exec();
    if(user){
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
 *      2. Unassociated email is provided.
 */
const updateEmail = async (userID, oldEmail, newEmail) => {    
    const user = await User.findOne({_id : userID}).where("email").equals(oldEmail);
    console.log(user);
    if(user){
        try{
            user.email = newEmail;
            await user.save();
            return user;
        }catch(error){
            return null;
        }
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
const findUser = async(email) => {
    const user = await User.findOne({email : email});
    if(user){
        return user;
    }
    return null;
}
/**
 * Function to confirm login of a user instance in the User collection of the 
 * Expense Tracer Accounts database.
 * @param {String} email - The current email of the User instance.
 * @param {String} entry - The string provided to access user account.
 * @returns {Object} The instance of the associated user object.
 * Returns null if:
 *      1.  User collection is unassociated with email provided.
 *      2. Invalid entry is provided.
 */
const loginUser = async(email, entry) => {
    const user = await User.findOne({email : email});
    if(user && await compareEntry(entry,user.password)){
        return user;
    }
    return null;
}
/**
 * Function to update password of a user instance in the User collection of the 
 * Expense Tracer Accounts database.
 * @param {String} email - The current email of the User instance.
 * @param {String} entry - The string provided to access user account.
 * @returns {Object} The instance of the associated user object.
 * Returns null if:
 *      1.  User collection is unassociated with email provided.
 *      2.  Invalid entry is provided.
 */
const updatePassword = async(userID, oldEntry, newEntry) => {
    const user = await User.findOne({_id : userID});
    if(await loginUser(user.email, oldEntry)){
        user.updateOne({password : await hashed(newEntry)});
        return user;
    }
    return null;
}

export{ addUser as default, findUser, loginUser, updateEmail,
        updatePassword, updateTotalAmount, updateUsername
};


