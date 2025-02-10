
db.Category.insertMany([
  // Income Categories
  { categoryID: 11, name: "Salary", type: "income", createdAt: new Date(), updatedAt: new Date() },
  { categoryID: 12, name: "Bonus", type: "income", createdAt: new Date(), updatedAt: new Date() },
  { categoryID: 13, name: "Investment", type: "income", createdAt: new Date(), updatedAt: new Date() },

  // Expense Categories
  { categoryID: 14, name: "Food", type: "expense", createdAt: new Date(), updatedAt: new Date() },
  { categoryID: 15, name: "Transportation", type: "expense", createdAt: new Date(), updatedAt: new Date() },
  { categoryID: 16, name: "Entertainment", type: "expense", createdAt: new Date(), updatedAt: new Date() },
  { categoryID: 17, name: "Utilities", type: "expense", createdAt: new Date(), updatedAt: new Date() },
  { categoryID: 18, name: "Health", type: "expense", createdAt: new Date(), updatedAt: new Date() },
  { categoryID: 19, name: "Other", type: "expense", createdAt: new Date(), updatedAt: new Date() }
])


// detele dupes based on name
db.Category.aggregate([
  {
    "$group": {
      "_id": "$name",
      "firstDoc": { "$first": "$_id" }
    }
  },
  {
    "$project": {
      "_id": 0,
      "name": "$_id",
      "firstDoc": 1
    }
  }
]).forEach(doc => {
  db.Category.deleteMany({ name: doc.name, _id: { "$ne": doc.firstDoc } });
});
