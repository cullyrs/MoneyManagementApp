const mongoose = require('mongoose');
const { Schema } = mongoose;

require('mongoose-double')(mongoose);


const mongooseInt32 = require('mongoose-int32');
mongooseInt32.loadType(mongoose);

const transactionSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  

  amount: { type: Schema.Types.Double, required: true },
  
  type: { type: String, enum: ['income', 'expense'], required: true },
  date: { type: Date, default: Date.now },
  category: { type: Schema.Types.ObjectId, ref: 'Category' },
  notes: { type: String },
  

  version: { type: Schema.Types.Int32, default: 1 }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
