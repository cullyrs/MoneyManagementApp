/**
 * Name : Cully Stearns
 * Date : 1/31/2025
 * File Name: User.js
 * Course : CMSC 495 Capstone in Computer Science
 * Project : Expense Tracker Capstone Project
 * Description : The purpose of the User.js module is to build
 * and export the schema for the User collection in the 
 * Expense Tracker Accounts database.
 */

const mongoose = require('mongoose');
const mongooseInt32 = require('mongoose-int32');
const mongooseDouble = require('mongoose-double');
mongooseDouble(mongoose);
mongooseInt32.loadType(mongoose);

const { Schema } = mongoose;
const { Double, Int32 } = Schema.Types; 

const passwordValidator = function (value) {
  const hasLetters = /[A-Za-z]/.test(value);
  const hasNumbers = /\d/.test(value);
  return value.length >= 6 && hasLetters && hasNumbers;
};

const userSchema = new Schema({
  userName: { type: String, required: true, unique: true, index: true }, // Ensure unique index
    password: {
    type: String,
    required: true,
    validate: {
      validator: passwordValidator,
      message: 'Password must be at least 6 chars, contain letters and numbers'
    }
  },
  email: { 
    type: String, 
    required: true, 
    lowercase: true, 
    unique: true,
    index: true, // Ensure unique index for email
    match: [ /^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address' ]
  },
  transactionList: [{ type: Schema.Types.ObjectId, ref: 'Transaction' }],
  budgetList: [{ type: Schema.Types.ObjectId, ref: 'Budget' }],
  goalList: [{ type: Schema.Types.ObjectId, ref: 'Goal' }],
  version: { type: Int32, default: 1 },

}, { collection: 'User', timestamps: true });

const User = mongoose.model('User', userSchema);

module.exports = mongoose.model('User', userSchema);

