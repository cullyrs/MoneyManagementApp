/**
 * Name : Arewa (Morountudun) Ojelade
 * Contributors : Steven Mounie, and Cully Stearns
 * Date : 1/31/2025
 * File Name: User.js
 * Course : CMSC 495 Capstone in Computer Science
 * Project : Expense Tracker Capstone Project
 * Description : The purpose of the User.js module is to build
 * and export the schema for the User collection in the 
 * Expense Tracker Accounts database.
 */
import mongoose from "mongoose";
const { Schema,model} = mongoose;

const userSchema = new Schema({
  userName: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, lowercase:true, unique: true },
  transactionList: [{ type: Schema.Types.ObjectId, ref: 'Transaction'}],
  budgetList: [{ type: Schema.Types.ObjectId, ref: 'Budget' }],
  goalList: [{ type: Schema.Types.ObjectId, ref: 'Goal' }],
  totalAmount: { type: Schema.Types.Double, required: true },
  version: {type: Number, default: 1},
}, { collection: 'User', timestamps: true });
const User = model('User', userSchema);
export default User;
