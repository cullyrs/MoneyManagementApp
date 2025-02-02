const mongoose = require('mongoose');
const mongooseInt32 = require('mongoose-int32');
const mongooseDouble = require('mongoose-double');

mongooseDouble(mongoose);
mongooseInt32.loadType(mongoose); 

const { Schema } = mongoose;
const { Double, Int32 } = mongoose.Schema.Types;

const passwordValidator = function(value) {
  const hasLetters = /[A-Za-z]/.test(value);
  const hasNumbers = /\d/.test(value);
  return value.length >= 6 && hasLetters && hasNumbers;
};

const userSchema = new Schema({
  userName: { type: String, required: true, unique: true },
    password: {
    type: String,
    required: true,
    validate: {
      validator: passwordValidator,
      message: 'Password must be at least 6 chars, contain letters and numbers'
    }
  },
    email: {
    type: String,
    required: true,
    lowercase: true,
    unique: true,
    match: [ /^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address' ]
  },

  transactionList: [{ type: Schema.Types.ObjectId, ref: 'Transaction' }],
  budgetList: [{ type: Schema.Types.ObjectId, ref: 'Budget' }],
  goalList: [{ type: Schema.Types.ObjectId, ref: 'Goal' }],


  version: { type: Int32, default: 1 },

}, { collection: 'User', timestamps: true });

module.exports = mongoose.model('User', userSchema);

