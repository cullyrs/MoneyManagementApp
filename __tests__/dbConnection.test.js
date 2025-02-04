/**
 * This test file is used to test the connection to the MongoDB database.
 * It uses the mongodb package to connect to the database and perform a ping operation.
 * The test checks if the connection is successful and the ping response is as expected.
 * The connection is established using the URI from the api.json file.
 */
const { MongoClient, ServerApiVersion } = require("mongodb");
const { username, password } = require("../api.json");

const uri = `mongodb+srv://${username}:${password}@expensemanager1.3yfoo.mongodb.net/?retryWrites=true&w=majority&appName=ExpenseManager1`;

describe("MongoDB Connection Test", () => {
  let client;

  beforeAll(async () => {
    client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true
      }
    });

    await client.connect();
  }, 20000); // 20s timeout

  afterAll(async () => {
    if (client) {
      await client.close();
    }
  });

  test("Should successfully connect to MongoDB", async () => {
    expect(client).toBeDefined();

    const adminDb = client.db("admin");
    const pingResponse = await adminDb.command({ ping: 1 });

    expect(pingResponse).toHaveProperty("ok", 1);
  });
});
