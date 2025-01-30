const mongoose = require('mongoose');
//Must install mongoose int 32 plugin "npm install mongoose-int32"
const Int32 = require ('mongoose-int32').loadType(mongoose);
const { Schema } = (mongoose);

const goalSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  goalName: { type: String, required: true },
  targetAmount: { type: Int32, required: true },
  savedAmount: { type: Int32, default: 0 },
  savedToDate: { type: Date, default: Date.now },
  category: { type: Schema.Types.ObjectId, ref: 'Category' }
}, { collection : 'Goal', timestamps: true });

module.exports = mongoose.model('Goal', goalSchema);
