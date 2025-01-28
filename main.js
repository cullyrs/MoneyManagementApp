// main.js
const { app, BrowserWindow } = require('electron');
const path = require('path');

// DB connection
const { connectToDB, getDB } = require('./dbconnect');

let mainWindow;

async function createWindow() {
  // Connect to MongoDB
  await connectToDB();

  // Create the main browser window
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  });

  mainWindow.loadFile('index.html');

}

app.whenReady().then(createWindow);
