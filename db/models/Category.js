const mongoose = require('mongoose');
//Must install mongoose int 32 plugin "npm install mongoose-int32"
const Int32 = require ('mongoose-int32').loadType(mongoose);
const { Schema } = (mongoose);
                       
const categorySchema = new Schema({
  id: {type: Int32, required: true, unique: true},
  version: {type: Int32, default: 1},
  userId: {type: Schema.Types.ObjectId, ref: 'User'},
  name: {type: String, required: true, trim: true, minlength: 1, maxlength: 50},
  type: {type: String, enum: ['income', 'expense', 'both'], default: 'expense'},
  icon: String,
  color: String,
  description: String,
  isActive: {type: Boolean,default: true},
  parentCategory: {type: Schema.Types.ObjectId, ref: 'Category'}
}, { timestamps: true });

categorySchema.index({ userId: 1, name: 1 }, { unique: true });
module.exports = model('Category', categorySchema);

//General Categories
await Category.create({
  id: 0,
  name: "All",
  version: 1
});

await Category.create({
  id: 1,
  name: "Housing",
  version: 1
});

await Category.create({
  id: 2,
  name: "Transportation",
  version: 1
});

await Category.create({
  id: 3,
  name: "Vehicle",
  version: 1
});

await Category.create({
  id: 4,
  name: "Life & Entertainment",
  version: 1
});




