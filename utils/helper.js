/**
 * Name : Arewa (Morountudun) Ojelade
 * Date : 1/31/2025
 * File Name: helper.js
 * Course : CMSC 495 Capstone in Computer Science
 * Project : Expense Tracker Capstone Project
 * Description : The purpose of the helper.js module is to provide asynchronous password hashing and 
 * confirmation of user passwords for the Expense Tracker Accounts User collection.
 */

const bcrypt = require('bcrypt');

// The cost of processing the data, initialized at 10 (recommended)
const saltRounds = 10;

/**
 * Function to hash password strings.
 * @param {String} entry - The user provided string to be hashed.
 * @returns {Promise<String>} - The hashed string.
 */
const hashed = async (entry) => {
  const salt = await bcrypt.genSalt(saltRounds);
  return bcrypt.hash(entry, salt);
};

/**
 * Function to compare user provided string with hashed string.
 * @param {String} entry - The user provided string.
 * @param {String} hashedPassword - The hashed string contained in the database.
 * @returns {Promise<Boolean>} - The boolean result of the comparison.
 */
const compareEntry = async (entry, hashedPassword) => {
  return bcrypt.compare(entry, hashedPassword);
};

module.exports = {
  hashed,
  compareEntry
};


