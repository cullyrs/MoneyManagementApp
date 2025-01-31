/**
 * Name : Arewa (Morountudun) Ojelade
 * Contributors : Steven Mounie, and Cully Stearns
 * Date : 1/31/2025
 * File Name: Budget.js
 * Course : CMSC 495 Capstone in Computer Science
 * Project : Expense Tracker Capstone Project
 * Description : The purpose of the Budget.js module is to build
 * and export the schema for the Budget collection in the 
 * Expense Tracker Accounts database.
 */

import mongoose from "mongoose";
const { Schema, SchemaTypes, model } = mongoose;
const mongoose = require('mongoose');

const budgetSchema = new Schema({
  userID: { type: SchemaTypes.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  amount: { type: SchemaTypes.Int32, required: true },
  duration: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 3600 * 1000), // default month duration
  },
  categoryID: { type: SchemaTypes.Int32, default : 0},
  version: { type: SchemaTypes.Int32, default : 1}
}, {collection : 'Budget', timestamps: true });

module.exports = model('Budget', budgetSchema);
