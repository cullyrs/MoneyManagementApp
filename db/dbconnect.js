import mongoose from "mongoose";
import cin from "../api.json" with {"type" : "json"};
const uri = `mongodb+srv://${cin.username}:${cin.password}@expensemanager1.3yfoo.mongodb.net/Accounts?retryWrites=true&w=majority&appName=ExpenseManager1`;
const connectDB = async ()=>{
  mongoose.connect(uri);
  mongoose.connection.on('error', err => {
    console.log(err);
  });
};

export default connectDB;
