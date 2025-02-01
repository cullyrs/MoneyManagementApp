/**
 * Name : Arewa (Morountudun) Ojelade
 * Contributors : Steven Mounie, and Cully Stearns
 * Date : 1/31/2025
 * File Name: Budget.js
 * Course : CMSC 495 Capstone in Computer Science
 * Project : Expense Tracker Capstone Project
 * Description : The purpose of the Goal.js module is to build
 * and export the schema for the Goal collection in the 
 * Expense Tracker Accounts database.
 */

import mongoose from "mongoose";
const { Schema, SchemaTypes, model } = mongoose;

const goalSchema = new Schema({
  userId: { type: SchemaTypes.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  targetAmount: { type: SchemaTypes.Double, required: true },
  savedAmount: { type: SchemaTypes.Double, default: 0 },
  savedToDate: { type: Date, 
    default: ()=> new Date(Date.now) + 30 * 24 * 3600 * 1000, // default month duration
  }, 
  categoryID: { type: SchemaTypes.Int32, default : 0},
  version : {type : SchemaTypes.Int32, default : 1}
}, { collection : 'Goal', timestamps: true });

module.exports = model('Goal', goalSchema);
