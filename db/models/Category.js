const { Schema, model } = require('mongoose');

const categorySchema = new Schema({
  category: {type: Schema.Types.ObjectId, ref: 'User'},
  name: {type: String, required: true, trim: true, minlength: 1, maxlength: 50},
  type: {type: String, enum: ['income', 'expense', 'both'], default: 'expense'},
  icon: String,
  color: String,
  description: String,
  isActive: {type: Boolean,default: true},
  parentCategory: {type: Schema.Types.ObjectId, ref: 'Category'}
}, { timestamps: true });

categorySchema.index({ userId: 1, name: 1 }, { unique: true });
module.exports = model('Category', categorySchema);
