/**
 * Name : -- 
 * Date : 1/31/2025
 * File Name : dbConnection.js
 * Course : CMSC 495 Capstone in Computer Science
 * Project : Expense Tracker Capstone Project
 * Description : This module handles the connection to the MongoDB database using Mongoose.
 *  It provides functions to establish a connection and retrieve the active connection.
 */

const mongoose = require('mongoose');
const dotenv = require("dotenv");
const path = require("path");
configPath = path.resolve(__dirname, "./config.env");
dotenv.config({ path: configPath});

// NEW DB 
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@expensedata.aptda.mongodb.net/Accounts?retryWrites=true&w=majority&appName=ExpenseDATA`;

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
