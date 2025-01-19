// db/models/Goal.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const goalSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  goalName: { type: String, required: true },
  targetAmount: { type: Number, required: true },
  savedAmount: { type: Number, default: 0 },
  savedToDate: { type: Date, default: Date.now },
  categoryId: { type: Schema.Types.ObjectId, ref: 'Category' }
}, { timestamps: true });

module.exports = mongoose.model('Goal', goalSchema);