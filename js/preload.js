/**
 * Name : Cully Stearns
 * Date : 1/31/2025
 * File Name : preload.js
 * Course : CMSC 495 Capstone in Computer Science
 * Project : Expense Tracker Capstone Project
 * Description : This preload script securely exposes a subset of the Electron IPC 
 * functionality to the renderer process via contextBridge. It creates 
 * an 'electronAPI' object in the global window, allowing safe invocation 
 * of IPC channels.
 */
const {contextBridge, ipcRenderer} = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    invoke: (channel, data) => ipcRenderer.invoke(channel, data)
});
