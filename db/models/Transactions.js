/**
 * Name : Arewa (Morountudun) Ojelade
 * Contributors : Steven Mounie, and Cully Stearns
 * Date : 1/31/2025
 * File Name: Transaction.js
 * Course : CMSC 495 Capstone in Computer Science
 * Project : Expense Tracker Capstone Project
 * Description : The purpose of the Transaction.js module is to build
 * and export the schema for the Transaction collection in the 
 * Expense Tracker Accounts database..
 */
import mongoose from "mongoose";
const { Schema, SchemaTypes, model } = mongoose;

const transactionSchema = new Schema({
  userId: { type: SchemaTypes.ObjectId, ref: 'User', required: true },
  amount: { type: SchemaTypes.Double, required: true },
  type: { type: SchemaTypes.Int32, required: true },
  date: { type: SchemaTypes.Date, default: Date.now },
  category: { id: SchemaTypes.Int32, name : String},
  description: { type: String },
  version: {type: Number, default : 1}
}, { collection : 'Transaction', timestamps: true });

const Transaction = model('Transaction', transactionSchema);
export default Transaction;
