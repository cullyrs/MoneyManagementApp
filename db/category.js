import mongoose from "mongoose";
import Category from "./models/Category.js";
import connectDB from "./dbconnect.js"; connectDB();

//General Categories
const addCategory = async(name,id)=>{
    const category = await Category.create({
        id : id,
        name : name
    });
    console.log(category);
}
const initializeCategories = async() =>{
    const names = ["All","Housing","Transportation","Vehicle","Life & Entertainment",
                "Food & Drinks", "Income","Investments"];

    names.forEach((name,index)=>{
        const category = addCategory(name, index);
    });
   
};
const deleteCategories = async() =>{
   
    const deleted = await Category.deleteMany({__v : 0});
    console.log(deleted);
}
export {initializeCategories as default, addCategory}
