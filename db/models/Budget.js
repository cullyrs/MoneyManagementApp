const mongoose = require('mongoose');
const { Schema } = mongoose;

const BudgetSchema = new Schema({
  budgetId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  budgetName: { type: String, required: true },
  amount: { type: Number, required: true },
  duration: {
    type: Date,
    default: () => new Date(Date.now() + 7 * 24 * 3600 * 1000), // one week from now
    required: true
  },
  category: { type: Schema.Types.ObjectId, ref: 'Category' }
}, { timestamps: true });

module.exports = mongoose.model('Budget', budgetSchema);
