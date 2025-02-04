/**
 * Name : Arewa (Morountudun) Ojelade
 * Contributors : Steven Mounie, and Cully Stearns
 * Date : 1/31/2025
 * File Name: Category.js
 * Course : CMSC 495 Capstone in Computer Science
 * Project : Expense Tracker Capstone Project
 * Description : The purpose of the Category.js module is to build
 * and export the schema for the Category collection in the 
 * Expense Tracker Accounts database.
 */

const mongoose = require('mongoose');
const { Schema } = mongoose;
require('mongoose-double')(mongoose);
const mongooseInt32 = require('mongoose-int32');
mongooseInt32.loadType(mongoose);

const { Int32 } = Schema.Types;

const categorySchema = new Schema({
  categoryID: { type: Int32, required: true, unique: true },
  name: { type: String, required: true, trim: true, minlength: 1, maxlength: 50 },
  icon: String,
  color: String,
  description: String,
  version: { type: Int32, default: 1 },
}, { collection: 'Category', timestamps: true });

module.exports = mongoose.model('Category', categorySchema);
