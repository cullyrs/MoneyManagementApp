import mongoose from "mongoose";
import User from "models/User";
import hashed from "./utils/helper.js";
const { username, password } = require('../api.json');
const uri = `mongodb+srv://${username}:${password}@expensemanager1.3yfoo.mongodb.net/?retryWrites=true&w=majority&appName=ExpenseManager1`;

mongoose.connect(uri);

// Create a new user
export const createNewUser(name, entry, _email) =>{
    const user = new User({
        userName = name,
        password = hashed(entry),
        email = _email,
    });
    await article.save();
};
