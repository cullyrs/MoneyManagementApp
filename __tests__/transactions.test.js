/**
 * This test file is used to test the transactions collection in MongoDB.
 * It tests the ability to insert and retrieve transactions.
 * currently does not test the transactions js:: TODO: add tests for transactions.js to follow schema
 */
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const { username, password } = require("../api.json");

const uri = `mongodb+srv://${username}:${password}@expensemanager1.3yfoo.mongodb.net/?retryWrites=true&w=majority&appName=ExpenseManager1`;

let client;
let db;


beforeAll(async () => {
  try {
    client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true
      }
    });

    await client.connect();
    console.log("Connected to MongoDB for tests");

    db = client.db("test");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
  }
}, 20000); // 20s timeout

afterAll(async () => {
  if (client) {
    await client.close();
    console.log("MongoDB connection closed after tests");
  }
});

// Test for logging an expense
test("Should log an expense", async () => {
  const transactions = db.collection("Transaction");

  const transaction = {
    userId: new ObjectId(),
    amount: 50.75,
    type: "expense",
    category: "Food",
    description: "Dinner with friends"
  };

  // Insert transaction
  const result = await transactions.insertOne(transaction);
  expect(result.insertedId).toBeDefined();

  // Retrieve transaction
  const savedTransaction = await transactions.findOne({ _id: result.insertedId });
  expect(savedTransaction).toBeDefined();
  expect(savedTransaction.description).toBe("Dinner with friends");
});
