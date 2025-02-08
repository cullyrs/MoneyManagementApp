/**
 * Name : Arewa (Morountudun) Ojelade
 * Date : 1/31/2025
 * File Name : main.js
 * Course : CMSC 495 Capstone in Computer Science
 * Project : Expense Tracker Capstone Project
 * Description : This is the main process file for the Expense Tracker application.
 * It sets up the Electron application, establishes a connection to the MongoDB
 * database via Mongoose, creates the main application window, and registers
 * IPC handlers for communication between the main and renderer processes.
 */

const {app, BrowserWindow, ipcMain} = require('electron');
const path = require('path');

const {connectToDB} = require('./js/dbconnect');
const User = require('./db/models/User.js');
const Budget = require('./db/models/Budget.js');
const Goal = require('./db/models/Goal.js');
const Transactions = require('./db/models/Transactions.js');

let mainWindow;

async function createWindow() {
    try {
        await connectToDB();

        mainWindow = new BrowserWindow({
            width: 800,
            height: 600,
            webPreferences: {
                preload: path.join(__dirname, './js/preload.js'),
                nodeIntegration: false,
//        contextIsolation: false,
                backgroundThrottling: false
            }
        });

        mainWindow.loadFile('index.html');
    } catch (err) {
        console.error('Error creating main window:', err);
    }
}

require('./ipcHandlers/ipcHandlers');

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

app.on('before-quit', async () => {
    console.log('Shutting down...');
    const mongoose = require('mongoose');
    await mongoose.connection.close();
});