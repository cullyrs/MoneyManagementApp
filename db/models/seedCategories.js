const mongoose = require('mongoose');
const Category = require('./models/Category');
const { username, password } = require('../api.json');  

async function seedCategories() {
  try {
    const uri = `mongodb+srv://${username}:${password}@expensemanager1.3yfoo.mongodb.net/?retryWrites=true&w=majority&appName=ExpenseManager1`;
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to DB for seeding categories.');

    await Category.deleteMany({});

    const expenseCategories = [
      { categoryID: 0, name: "Food", schemaVersion: 1.1, version: 1, type: "expense" },
      { categoryID: 1, name: "Transportation", schemaVersion: 1.1, version: 1, type: "expense" },
      { categoryID: 2, name: "Entertainment", schemaVersion: 1.1, version: 1, type: "expense" },
      { categoryID: 3, name: "Utilities", schemaVersion: 1.1, version: 1, type: "expense" },
      { categoryID: 4, name: "Health", schemaVersion: 1.1, version: 1, type: "expense" },
      { categoryID: 5, name: "Other", schemaVersion: 1.1, version: 1, type: "expense" },
      { categoryID: 6, name: "Custom", schemaVersion: 1.1, version: 1, type: "expense" }
    ];

    const incomeCategories = [
      { categoryID: 0, name: "Salary", schemaVersion: 1.1, version: 1, type: "income" },
      { categoryID: 1, name: "Bonus", schemaVersion: 1.1, version: 1, type: "income" },
      { categoryID: 2, name: "Investment", schemaVersion: 1.1, version: 1, type: "income" },
      { categoryID: 3, name: "Custom", schemaVersion: 1.1, version: 1, type: "income" }
    ];

    const categories = expenseCategories.concat(incomeCategories);

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

