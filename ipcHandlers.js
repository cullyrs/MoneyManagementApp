const { ipcMain, BrowserWindow } = require('electron');
const { Types: { ObjectId } } = require('mongoose');
const { compareEntry } = require('./utils/helper.js');

const { 
  addUser, 
  loginUser, 
  updateEmail, 
  updatePassword, 
  updateTotalAmount, 
  updateUsername, 
  findUser 
} = require('./db/userFunctions.js');

const User = require('./db/models/User.js');
const Budget = require('./db/models/Budget.js');
const Goal = require('./db/models/Goal.js');
const Transactions = require('./db/models/Transactions.js');


//Handle login
ipcMain.handle('login', async (event, { username, password }) => {
  try {
    console.log('Login attempt for', username);

    const result = await loginUser(username, password);
    if (!result) {
      throw new Error('Invalid credentials');
    }
    
    const [user, transactions, budgets, goals] = result;
    
    // Convert the ObjectId to a hex string.
    const userIdString = user._id.toString();
    const recentBudget = budgets && budgets.length > 0 ? budgets[budgets.length - 1] : null;
    const recentGoal = goals && goals.length > 0 ? goals[goals.length - 1] : null;
    const recentTransaction = transactions && transactions.length > 0 ? transactions[transactions.length - 1] : null;
    
    return {
      success: true,
      userId: userIdString,
      recentBudget,
      recentGoal,
      recentTransaction
    };
  } catch (err) {
    console.error('Login error:', err);
    return { success: false, error: err.message };
  }
});

//Handle application sign up
ipcMain.handle('signup', async (event, { username, password, email }) => {
  try {
    console.log("Signup values:", { username, password, email });
    const newUser = await addUser(username, password, email);
    if (!newUser) {
      throw new Error("User creation failed. Check that all required fields are provided.");
    }
    return { success: true, userId: newUser._id };
  } catch (error) {
    console.error("Signup error:", error);
    return { success: false, error: error.message };
  }
});

// Handle dashboard load
ipcMain.handle("loadDashboard", async (event) => {
  const windows = BrowserWindow.getAllWindows();
  if (windows && windows.length > 0) {
    windows[0].loadFile("dashboard.html");
  }
});


ipcMain.handle('getUserTransactions', async (event, userId, month) => {
  try {
    if (!ObjectId.isValid(userId)) {
      throw new Error('Invalid userId format.');
    }
    const validUserId = new ObjectId(userId);
    
    const query = { userID: validUserId };
    
    if (month) {
      const startDate = new Date(`${month}-01`);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);
      query.createdAt = { $gte: startDate, $lt: endDate };
    }
    
    const transactions = await Transactions.find(query)
      .sort({ createdAt: -1 })
      .lean();
      
    console.log("Transactions retrieved for user", userId, transactions);
    return { success: true, transactions };
  } catch (err) {
    console.error("Error retrieving transactions:", err);
    return { success: false, error: err.message };
  }
});

// Need to complete later
ipcMain.handle('getDashboardData', async (event, userId) => {
  try {
    const recentBudget = await Budget.findOne({ userID: userId }).sort({ createdAt: -1 });
    const recentGoal = await Goal.findOne({ userID: userId }).sort({ createdAt: -1 });
    const recentTransactions = await Transactions.findOne({ userID: userId }).sort({ date: -1 });

    return {
      success: true,
      recentBudget,
      recentGoal,
      recentTransactions
    };
  } catch (err) {
    console.error('Error retrieving dashboard data:', err);
    return { success: false, error: err.message };
  }
});

// Need to complete later
ipcMain.handle('updateBudget', async (event, { userId, newBudgetValue }) => {
  try {
    if (typeof newBudgetValue !== 'number' || newBudgetValue < 0) {
      throw new Error('Invalid budget value: must be a non-negative number.');
    }

    let budget = await Budget.findOne({ userID: userId }).sort({ createdAt: -1 });
    if (!budget) {
      budget = await Budget.create({
        userID: userId,
        name: "Default Budget",
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

// Need to complete later.
ipcMain.handle('updateGoal', async (event, { userId, newGoalCurrent, newGoalTarget }) => {
  try {
    if (typeof newGoalCurrent !== 'number' || newGoalCurrent < 0) {
      throw new Error('Invalid current goal value: must be a non-negative number.');
    }
    if (typeof newGoalTarget !== 'number' || newGoalTarget < 0) {
      throw new Error('Invalid target goal value: must be a non-negative number.');
    }

    let goal = await Goal.findOne({ userID: userId }).sort({ createdAt: -1 });
    if (!goal) {
      goal = await Goal.create({
        userID: userId,
        name: "Default Goal",
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


ipcMain.handle("addTransaction", async (event, transactionData) => {
  console.log("Received transactionData in main:", transactionData);
  try {
    const {
      userID,
      amount,
      type,
      date,        
      categoryID,  
      description
    } = transactionData;

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount < 0) {
      throw new Error("Transaction amount must be a non-negative number.");
    }

    if (!ObjectId.isValid(userID)) {
      throw new Error("Invalid userID: must be a 24-character hex string.");
    }
    const validUserID = new ObjectId(userID);

    const newTransaction = await Transactions.create({
      userID: validUserID,
      amount: parsedAmount,
      type,
      date,             
      categoryID,      
      description
    });


    const user = await User.findById(validUserID);
    if (user) {
      user.transactionList.push(newTransaction._id);

      if (type === 0) {
        user.totalAmount -= parsedAmount; 
      } else if (type === 1) {
        user.totalAmount += parsedAmount; 
      }
      await user.save();
    }

    return { success: true, transaction: newTransaction.toObject() };
  } catch (error) {
    console.error("Error in 'addTransaction':", error);
    return { success: false, error: error.message };
  }
});

module.exports = function registerIPCHandlers() {
  console.log("IPC Handlers registered.");
};


