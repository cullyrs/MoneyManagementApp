const { app, BrowserWindow } = require('electron');
const path = require('path');

// DB connection
const { connectToDB, getDB } = require('./db/connect');

let mainWindow;

async function createWindow() {
  await connectToDB();
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


