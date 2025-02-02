const mongoose = require('mongoose');
const Category = require('./category');
const { username, password } = require('.../api.json');

async function seedCategories() {
  try {
    const uri = `mongodb+srv://${username}:${password}@expensemanager1.3yfoo.mongodb.net/?retryWrites=true&w=majority&appName=ExpenseManager1`;
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to DB for seeding categories.');
    await Category.deleteMany({});
    const categories = [
      { id: 0, name: "Utilities", schemaVersion: 1.1, version: 1 },
      { id: 1, name: "Entertainment", schemaVersion: 1.1, version: 1 },
      { id: 2, name: "Groceries", schemaVersion: 1.1, version: 1 },
      { id: 3, name: "Transportation", schemaVersion: 1.1, version: 1 },
      { id: 4, name: "Dining", schemaVersion: 1.1, version: 1 },
      { id: 5, name: "Health", schemaVersion: 1.1, version: 1 },
      { id: 6, name: "Other", schemaVersion: 1.1, version: 1 }
    ];

    await Category.insertMany(categories, { ordered: false });
    console.log('Categories seeded successfully.');
  } catch (error) {
    console.error('Error seeding categories:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed.');
  }
}

seedCategories();

