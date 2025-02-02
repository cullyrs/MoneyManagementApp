const mongoose = require('mongoose');
const { Schema } = mongoose;
require('mongoose-double')(mongoose);
const mongooseInt32 = require('mongoose-int32');
mongooseInt32.loadType(mongoose);

const categorySchema = new Schema({
  id: { type: Schema.Types.Int32, required: true, unique: true },
  schemaVersion: { type: Schema.Types.Double, default: 1.1 },
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true, trim: true, minlength: 1, maxlength: 50 },
  type: { type: String, enum: ['income', 'expense', 'both'], default: 'expense' },
  icon: String,
  color: String,
  description: String,
  isActive: { type: Boolean, default: true },
  parentCategory: { type: Schema.Types.ObjectId, ref: 'Category' },
  version: { type: Schema.Types.Int32, default: 1 }
}, { timestamps: true });

categorySchema.index({ userId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Category', categorySchema);
