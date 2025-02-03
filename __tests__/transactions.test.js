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

test("Should log an expense", async () => {
  const transactions = db.collection("Transaction");

  const transaction = {
    userId: new ObjectId(),
    amount: 50.75,
    type: "expense",
    category: new ObjectId(),
    notes: "Dinner with friends"
  };

  // Insert transaction
  const result = await transactions.insertOne(transaction);
  expect(result.insertedId).toBeDefined();

  // Retrieve transaction
  const savedTransaction = await transactions.findOne({ _id: result.insertedId });
  expect(savedTransaction).toBeDefined();
  expect(savedTransaction.notes).toBe("Dinner with friends");
});
