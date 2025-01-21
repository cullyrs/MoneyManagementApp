const mongoose = require('mongoose');
const { Schema } = mongoose;

const BudgetSchema = new Schema({
  userID: { type: Schema.Types.ObjectId, required: true },
  userName: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  transactionList: [{ type: Schema.Types.ObjectId, ref: 'Transaction'}],
  budgetList: [{ type: Schema.Types.ObjectId, ref: 'Budget' }],
  goalList: [{ type: Schema.Types.ObjectId, ref: 'Goal' }],
  totalAmount: { type: Schema.Types.ObjectId, required: true },
}, { timestamps: true });

module.exports = mongoose.model('User', budgetSchema);