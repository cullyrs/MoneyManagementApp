const mongoose = require('mongoose');
const { Schema } = mongoose;

const transactionSchema = new Schema({
  transaction: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['income', 'expense'], required: true },
  date: { type: Date, default: Date.now },
  category: { type: Schema.Types.ObjectId, ref: 'Category' },
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
