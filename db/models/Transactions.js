/**
 * Name : Arewa (Morountudun) Ojelade
 * Contributors : Steven Mounie, and Cully Stearns
 * Date : 1/31/2025
 * File Name: Transaction.js
 * Course : CMSC 495 Capstone in Computer Science
 * Project : Expense Tracker Capstone Project
 * Description : The purpose of the Transaction.js module is to build
 * and export the schema for the Transaction collection in the 
 * Expense Tracker Accounts database.
 */
import mongoose from "mongoose";
const { Schema, model } = mongoose;

const transactionSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Schema.Types.Double, required: true },
  type: { type: Number, required: true },
  date: { type: Schema.Types.Date, default: Date.now },
  category: { id: Number, name : String},
  description: { type: String },
  version: {type: Number, default : 1}
}, { collection : 'Transaction', timestamps: true });

const Transaction = model('Transaction', transactionSchema);
export default Transaction;
