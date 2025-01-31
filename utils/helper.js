/**
 * Name : Arewa (Morountudun) Ojelade
 * Date : 1/31/2025
 * File Name: helper.js
 * Course : CMSC 495 Capstone in Computer Science
 * Project : Expense Tracker Capstone Project
 * Description : The purpose of the helper.js module
 * to provide asynchronous password hashing and 
 * confirmation of user passwords for the 
 * Expence Tracker Accounts User collection.
 */

import bcrypt from 'bcrypt';


const saltRounds = 10;
/**
 * Function to hash password strings
 * @param {String} entry - The user provided string to be hashed.
 * @returns {String} - The hashed string.
 */
 const hashed =  async (entry) =>{
    const salt = bcrypt.genSaltSync(saltRounds)
    return bcrypt.hash(entry,salt);
};
/**
 * Function to compare user provided string with hashed string
 * @param {String} entry - The user provided string. 
 * @param {String} hashed - The hashed string contained in database.
 * @returns {Boolean} - The boolean result of entry and hashed comparison.
 */
const compareEntry = async (entry, hashed) =>{
    return bcrypt.compare(entry,hashed);
};

export {hashed as default, compareEntry};
