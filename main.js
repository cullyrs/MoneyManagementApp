// main.js (CommonJS)

const userModule = require('./db/user.js');
const addUser = userModule.default;
const { loginUser, updateEmail, updatePassword, updateTotalAmount, updateUsername, findUser } = userModule;
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

const { connectToDB } = require('./dbconnect');
const User = require('./db/models/User.js');
const Budget = require('./db/models/Budget');
const Goal = require('./db/models/Goal');
const Transactions = require('./db/models/Transactions'); // Ensure this exports the model as expected

let mainWindow;

async function createWindow() {
  try {
    // Connect to MongoDB Atlas
    await connectToDB();

    mainWindow = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'), // Preload script for exposing APIs
        nodeIntegration: false
      }
    });

    mainWindow.loadFile('index.html');
  } catch (err) {
    console.error('Error creating main window:', err);
  }
}

ipcMain.handle('login', async (event, { username, password }) => {
  try {
    console.log('Login attempt for', username);

    const user = await User.findOne({ userName: username });
    if (!user) throw new Error('User not found');
    if (user.password !== password) throw new Error('Invalid password');

    const [recentBudget, recentGoal, recentTransaction] = await Promise.all([
      Budget.findOne({ budgetId: user._id }).sort({ createdAt: -1 }),
      Goal.findOne({ userId: user._id }).sort({ createdAt: -1 }),
      Transaction.findOne({ userId: user._id }).sort({ date: -1 })
    ]);

    return {
      success: true,
      userId: user._id,
      recentBudget,
      recentGoal,
      recentTransaction
    };
  } catch (err) {
    console.error('Login error:', err);
    return { success: false, error: err.message };
  }
});

// IPC handler to refresh the dashboard without a full login cycle.
ipcMain.handle('getDashboardData', async (event, userId) => {
  try {
    const recentBudget = await Budget.findOne({ budgetId: userId }).sort({ createdAt: -1 });
    const recentGoal = await Goal.findOne({ userId: userId }).sort({ createdAt: -1 });
    const recentTransaction = await Transaction.findOne({ userId: userId }).sort({ date: -1 });

    return {
      success: true,
      recentBudget,
      recentGoal,
      recentTransaction
    };
  } catch (err) {
    console.error('Error retrieving dashboard data:', err);
    return { success: false, error: err.message };
  }
});

// IPC handler to update the budget for the logged-in user with validation.
ipcMain.handle('updateBudget', async (event, { userId, newBudgetValue }) => {
  try {
    // Validate newBudgetValue: it must be a number and non-negative.
    if (typeof newBudgetValue !== 'number' || newBudgetValue < 0) {
      throw new Error('Invalid budget value: must be a non-negative number.');
    }

    let budget = await Budget.findOne({ budgetId: userId }).sort({ createdAt: -1 });
    if (!budget) {
      // If no budget record exists, create one.
      budget = await Budget.create({
        budgetId: userId,
        budgetName: "Default Budget",
        amount: newBudgetValue,
        duration: new Date(Date.now() + 7 * 24 * 3600 * 1000)
      });
    } else {
      budget.amount = newBudgetValue;
      await budget.save();
    }
    return { success: true, budget };
  } catch (err) {
    console.error('Error updating budget:', err);
    return { success: false, error: err.message };
  }
});

// IPC handler to update the goal for the logged-in user with validation.
ipcMain.handle('updateGoal', async (event, { userId, newGoalCurrent, newGoalTarget }) => {
  try {
    // Validate newGoalCurrent and newGoalTarget: both must be numbers and non-negative.
    if (typeof newGoalCurrent !== 'number' || newGoalCurrent < 0) {
      throw new Error('Invalid current goal value: must be a non-negative number.');
    }
    if (typeof newGoalTarget !== 'number' || newGoalTarget < 0) {
      throw new Error('Invalid target goal value: must be a non-negative number.');
    }

    let goal = await Goal.findOne({ userId: userId }).sort({ createdAt: -1 });
    if (!goal) {
      // If no goal record exists, create one.
      goal = await Goal.create({
        userId: userId,
        goalName: "Default Goal",
        targetAmount: newGoalTarget,
        savedAmount: newGoalCurrent
      });
    } else {
      goal.savedAmount = newGoalCurrent;
      goal.targetAmount = newGoalTarget;
      await goal.save();
    }
    return { success: true, goal };
  } catch (err) {
    console.error('Error updating goal:', err);
    return { success: false, error: err.message };
  }
});

// IPC handler for user signup, utilizing functions from user.js.
ipcMain.handle('signup', async (event, { username, password, email, amount }) => {
  try {
    const newUser = await addUser(username, password, email, amount);
    return { success: true, userId: newUser._id };
  } catch (error) {
    console.error("Signup error:", error);
    return { success: false, error: error.message };
  }
});

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