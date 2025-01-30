import mongoose from "mongoose";
import User from "./models/User.js";
import hashed,{compareEntry} from "../utils/helper.js";
import cin from "../api.json" with {"type" : "json"};
const uri = `mongodb+srv://${cin.username}:${cin.password}@expensemanager1.3yfoo.mongodb.net/Accounts?retryWrites=true&w=majority&appName=ExpenseManager1`;

mongoose.connect(uri);

// Create a new user
const  addUser = async (uname, entry, email_,amount)=>{
    const user = await User.create({
         userName: uname,
         password : await hashed(entry),
         email : email_,
         totalAmount : parseFloat(amount)
    });
    return user;
}
const updateEmail = async (oldEmail, newEmail) =>{
    const found = await User.exists({email: oldEmail});
    if(found){
        const user = await User.where("_id").equals(found._id);
        user[0].email = newEmail;
        await user[0].save();
    }
    else{
        console.log("This user does not exist.");
    }
}
const findUser = async(email) =>{
    const find = await User.where("email").equals(email);
    return find;
}
const loginUser = async(email_, entry) =>{
    const login = await User.where("email").equals(email_);
    const valid = await compareEntry(entry,login[0].password);
    return valid;
}
export{ addUser as default, findUser, loginUser, updateEmail};


