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
  userID: { type: ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  current: { type: Double, default: 0 }, // Added from db branch
  totalAmount: { type: Double, required: true },
  duration: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 3600 * 1000) // Default month duration
  },
  categoryID: { type: Int32, default: 0 },
  version: { type: Int32, default: 1 }
}, { collection: 'Budget', timestamps: true });

module.exports = mongoose.model('Budget', BudgetSchema);
