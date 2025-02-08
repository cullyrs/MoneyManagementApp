/**
 * Name : Arewa 
 * Date : 1/31/2025
 * File Name : dbConnection.js
 * Course : CMSC 495 Capstone in Computer Science
 * Project : Expense Tracker Capstone Project
 * Description : This module handles the connection to the MongoDB database using Mongoose.
 *  It provides functions to establish a connection and retrieve the active connection.
 */

const mongoose = require('mongoose');
const {username, password} = require('../api.json');

const uri = `mongodb+srv://${username}:${password}@expensemanager1.3yfoo.mongodb.net/Accounts?retryWrites=true&w=majority&appName=ExpenseManager1`;

async function connectToDB() {
    try {
        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB via mongoose!');
    } catch (err) {
        console.error('Failed to connect to MongoDB via mongoose:', err);
        throw err;
    }
}

function getDB() {
    return mongoose.connection;
}

module.exports = {connectToDB, getDB
};
