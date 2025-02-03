const mongoose = require('mongoose');
const { Schema } = mongoose;
require('mongoose-double')(mongoose);
const mongooseInt32 = require('mongoose-int32');
mongooseInt32.loadType(mongoose);

const BudgetSchema = new Schema({
  budgetId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  budgetName: { type: String, required: true },
  amount: { type: Schema.Types.Double, required: true },
  duration: {type: Date, default: () => new Date(Date.now() + 7 * 24 * 3600 * 1000), required: true},
  version: { type: Schema.Types.Int32, default: 1 },
  category: { type: Schema.Types.ObjectId, ref: 'Category' }
}, { timestamps: true });

module.exports = mongoose.model('Budget', BudgetSchema);
