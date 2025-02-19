/**
 * Name : Arewa (Morountudun) Ojelade
 * Contributors : Steven Mounie, and Cully Stearns, Naeem 
 * Date : 1/31/2025
 * File Name: Budget.js
 * Course : CMSC 495 Capstone in Computer Science
 * Project : Expense Tracker Capstone Project
 * Description : The purpose of the Budget.js module is to build
 * and export the schema for the Budget collection in the 
 * Expense Tracker Accounts database.
 */

const mongoose = require('mongoose');
const { Schema, SchemaTypes } = mongoose;
require('mongoose-double')(mongoose);
const mongooseInt32 = require('mongoose-int32');
mongooseInt32.loadType(mongoose);

const { ObjectId, Double, Int32 } = SchemaTypes;

const BudgetSchema = new Schema({
  userID: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  month: { type: String, required: true }, // Format: YYYY-MM
  name: { type: String, required: true },
  totalAmount: { type: Number, required: true, default: 0 }, // Total budget
  current: { type: Number, default: 0 }, // Tracks expenses
  version: { type: Int32, default: 1 }
}, 
{ collection: 'Budget', timestamps: true });

module.exports = mongoose.model('Budget', BudgetSchema);