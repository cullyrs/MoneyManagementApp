import mongoose from "mongoose";
const { Schema, model } = mongoose;
const categorySchema = new Schema({
  id: {type: Number, required: true, unique: true},
  __v: {type: Number, default: 0},
  name: {type: String, required: true, trim: true, minlength: 1, maxlength: 50},
  icon: String,
  color: String,
  description: String,
  isActive: {type: Boolean,default: true},
  parentCategory: {type: Schema.Types.ObjectId, ref: 'Category'}
}, { collection : 'Category',timestamps: true });
const Category = model('Category', categorySchema);
export default Category;
