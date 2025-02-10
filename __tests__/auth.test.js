/** npm test to run tests in MoneyManagementApp/__tests__/auth.test.js 
 * This will output an HTML report in the test-results folder.
 * The report will contain the test results and coverage information.
 * This test file is used to test the authentication helper functions.
 */

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
