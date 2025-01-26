const mongoose = require('mongoose');
//Must install mongoose int 32 plugin "npm install mongoose-int32"
const Int32 = require ('mongoose-int32').loadType(mongoose);
const { Schema } = (mongoose);

const transactionSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Int32, required: true },
  type: { type: String, enum: ['income', 'expense'], required: true },
  date: { type: Date, default: Date.now },
  category: { type: Schema.Types.ObjectId, ref: 'Category' },
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
