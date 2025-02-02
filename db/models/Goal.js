const mongoose = require('mongoose');
const { Schema } = mongoose;
require('mongoose-double')(mongoose);
const mongooseInt32 = require('mongoose-int32');
mongooseInt32.loadType(mongoose);

const goalSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  goalName: { type: String, required: true },
  

  targetAmount: { type: Schema.Types.Double, required: true },
  savedAmount: { type: Schema.Types.Double, default: 0 },
  
  savedToDate: { type: Date, default: Date.now },
  category: { type: Schema.Types.ObjectId, ref: 'Category' },
  

  version: { type: Schema.Types.Int32, default: 1 }
}, { timestamps: true });

module.exports = mongoose.model('Goal', goalSchema);
