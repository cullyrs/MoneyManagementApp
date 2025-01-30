import mongoose from "mongoose";
const { Schema,model} = mongoose;

const UserSchema = new Schema({
  userName: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  transactionList: [{ type: Schema.Types.ObjectId, ref: 'Transaction'}],
  budgetList: [{ type: Schema.Types.ObjectId, ref: 'Budget' }],
  goalList: [{ type: Schema.Types.ObjectId, ref: 'Goal' }],
  totalAmount: { type: Schema.Types.Double, required: true },
}, { collection: 'User', timestamps: true });

const User = model('User', UserSchema);
export default User;
