const { Schema, model } = require('mongoose');

const categorySchema = new Schema({
  id: {type: Number, required: true, unique: true},
  schema: {type: Number, default: 1.1},
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
  schema: 1.1
});

await Category.create({
  id: 1,
  name: "Housing",
  schema: 1.1
});

await Category.create({
  id: 2,
  name: "Transportation",
  schema: 1.1
});

await Category.create({
  id: 3,
  name: "Vehicle",
  schema: 1.1
});

await Category.create({
  id: 4,
  name: "Life & Entertainment",
  schema: 1.1
});




