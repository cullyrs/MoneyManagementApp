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
const { Schema,SchemaTypes, model} = mongoose;

const userSchema = new Schema({
  userName: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, lowercase:true, unique: true },
  transactionList: [{ type: SchemaTypes.ObjectId, ref: 'Transaction'}],
  budgetList: [{ type: SchemaTypes.ObjectId, ref: 'Budget' }],
  goalList: [{ type: SchemaTypes.ObjectId, ref: 'Goal' }],
  totalAmount: { type: SchemaTypes.Double, required: true },
  version: {type: SchemaTypes.Int32, default: 1},
}, { collection: 'User', timestamps: true });
const User = model('User', userSchema);
export default User;
