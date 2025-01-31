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
import mongoose from "mongoose";
const { Schema, model } = mongoose;
const categorySchema = new Schema({
  id: {type: Number, required: true, unique: true},
  name: {type: String, required: true, trim: true, minlength: 1, maxlength: 50},
  icon: String,
  color: String,
  description: String,
  isActive: {type: Boolean,default: true},
  parentCategory: {type: Schema.Types.ObjectId, ref: 'Category'},
  version: {type: Number, default: 1},
}, { collection : 'Category',timestamps: true });
const Category = model('Category', categorySchema);
export default Category;
