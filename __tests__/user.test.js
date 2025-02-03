const mongoose = require("mongoose");
const User = require("../db/models/User");
const { username, password } = require("../api.json");

const MONGO_URI = `mongodb+srv://${username}:${password}@expensemanager1.3yfoo.mongodb.net/test?retryWrites=true&w=majority&appName=ExpenseManager1`;

let db;

beforeAll(async () => {
  const client = await mongoose.connect(MONGO_URI, {
    serverApi: { version: "1", strict: true, deprecationErrors: true }
  });

  // Force Mongoose to use the "test" database
  db = client.connection.useDb("test");
}, 20000); // 20s timeout

afterAll(async () => {
  await mongoose.connection.close();
});

test("Should create a new user and validate required fields", async () => {
  const user = db.model("User", User.schema); // Force to "test" db
  const newUser = new user({
    userName: "testuser",
    email: "testuser@example.com",
    password: "SecurePass123"
  });

  await newUser.save();
  const foundUser = await user.findOne({ userName: "testuser" });

  expect(foundUser).toBeDefined();
  expect(foundUser.email).toBe("testuser@example.com");
});

test("Should not allow duplicate emails", async () => {
  const user1 = new User({
    userName: "user1",
    email: "duplicate@example.com",
    password: "SecurePass123"
  });

  const user2 = new User({
    userName: "user2",
    email: "duplicate@example.com",
    password: "SecurePass123"
  });

  await user1.save();

  // Expect duplicate email save to throw an error
  await expect(user2.save()).rejects.toThrow();
});

test("Should enforce email format validation", async () => {
  const invalidUser = new User({
    userName: "invalidUser",
    email: "invalid-email",
    password: "SecurePass123"
  });

  await expect(invalidUser.save()).rejects.toThrow(/Please provide a valid email address/);
});

test("Should enforce password complexity", async () => {
  const weakPasswordUser = new User({
    userName: "weakPasswordUser",
    email: "weakpass@example.com",
    password: "12345"
  });

  await expect(weakPasswordUser.save()).rejects.toThrow(/Password must be at least 6 chars/);
});
