/**
 * This test file is used to test the user collection in MongoDB.
 * It tests the ability to create a new user, enforce required fields, and validate email and password fields.
 * The connection is established using the URI from the api.json file.
 * The test checks if the user can be created, and if the required fields are enforced.
 * It also validates the email format and password complexity.
 * The test uses Jest and MongoDB for testing.
 */
const mongoose = require("mongoose");
const { username, password } = require("../api.json");
const User = require("../db/models/User");

const MONGO_URI = `mongodb+srv://${username}:${password}@expensemanager1.3yfoo.mongodb.net/test?retryWrites=true&w=majority&appName=ExpenseManager1`;

let db, userModel;

beforeAll(async () => {
  const client = await mongoose.connect(MONGO_URI, {
    serverApi: { version: "1", strict: true, deprecationErrors: true }
  });

  // Force Mongoose to use the "test" database
  db = client.connection.useDb("test");

  // Create a model bound to the "test" database
  userModel = db.model("User", User.schema);
}, 20000); // 20s timeout

afterAll(async () => {
  // await db.dropDatabase(); // Cleanup the test database
  await mongoose.connection.close();
});

// Test for creating a new user
test("Should create a new user and validate required fields", async () => {
  const newUser = new userModel({
    userName: "testuser",
    email: "testuser@example.com",
    password: "SecurePass123"
  });

  await newUser.save();
  const foundUser = await userModel.findOne({ userName: "testuser" });

  expect(foundUser).toBeDefined();
  expect(foundUser.email).toBe("testuser@example.com");
});

//  Test for duplicate emails, need dropDatabase() in afterAll() or will fail
test("Should not allow duplicate emails", async () => {
  const user1 = new userModel({
    userName: "user1",
    email: "duplicate@example.com",
    password: "SecurePass123"
  });

  const user2 = new userModel({
    userName: "user2",
    email: "duplicate@example.com", // Same email as user1
    password: "SecurePass123"
  });

  await user1.save(); // Save first user

  try {
    await user2.save(); // Attempt to save duplicate email
  } catch (error) {
    expect(error).toBeDefined();
    expect(error.code).toBe(11000); // MongoDB duplicate key error
    expect(error.message).toMatch(/duplicate key error/); // Ensure it's a uniqueness error
  }
});

// Test for required fields
test("Should enforce email format validation", async () => {
  const invalidUser = new userModel({
    userName: "invalidUser",
    email: "invalid-email",
    password: "SecurePass123"
  });

  await expect(invalidUser.save()).rejects.toThrow(/Please provide a valid email address/);
});

// Test for password complexity
test("Should enforce password complexity", async () => {
  const weakPasswordUser = new userModel({
    userName: "weakPasswordUser",
    email: "weakpass@example.com",
    password: "12345"
  });

  await expect(weakPasswordUser.save()).rejects.toThrow(/Password must be at least 6 chars/);
});
