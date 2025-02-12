/**
 * Name : Arewa (Morountudun) Ojelade
 * Contributors : Steven Mounie, and Cully Stearns
 * Date : 1/31/2025
 * File Name: Transaction.js
 * Course : CMSC 495 Capstone in Computer Science
 * Project : Expense Tracker Capstone Project
 * Description : The purpose of the Transaction.js module is to build
 * and export the schema for the Transaction collection in the 
 * Expense Tracker Accounts database.
 */
const mongoose = require("mongoose");
const { Schema } = mongoose;
require("mongoose-double")(mongoose);
const mongooseInt32 = require("mongoose-int32");
mongooseInt32.loadType(mongoose);
const SchemaTypes = Schema.Types;

const { ObjectId, Double, Int32 } = Schema.Types;

const transactionSchema = new Schema(
  {
    userID: { type: ObjectId, ref: "User", required: true },
    amount: { type: Double, required: true },
    date: { type: Date, required: true }, // Store as Date instead of String
    category: { type: ObjectId, ref: "Category", required: true }, 
    description: { type: String, trim: true },
    type: {
      type: String,
      enum: ["expense", "income"],
      required: true,
    },

    version: { type: Int32, default: 1 },
  },
  { collection: "Transaction", timestamps: true }
);

module.exports = mongoose.model("Transaction", transactionSchema);
