const { default: hashPassword, compareEntry } = require("../utils/helper");

test("Should hash a password and verify it correctly", async () => {
  const password = "SecurePass123";
  const hash = await hashPassword(password);
  const isValid = await compareEntry(password, hash);
  
  expect(isValid).toBe(true);
});

test("Should fail for incorrect password", async () => {
  const password = "SecurePass123";
  const hash = await hashPassword(password);
  const isValid = await compareEntry("WrongPass", hash);
  
  expect(isValid).toBe(false);
});
