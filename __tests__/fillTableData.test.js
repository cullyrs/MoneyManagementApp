/**
 * Jest test for `fillTableData.js`
 * Uses JSDOM to test table rendering and sorting behavior
 */

const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");

// load the script file
const scriptPath = path.resolve(__dirname, "../js/fillTableData.js");
const scriptContent = fs.readFileSync(scriptPath, "utf8");

// describe the test suite, and this will contain the test cases
describe("Expense Table Rendering and Sorting", () => {
  let dom;
  let document;
  let tableBody;
  let tableHeaders;

  beforeEach(() => {
    // Set up a mock HTML structure for the table
    dom = new JSDOM(`
      <!DOCTYPE html>
      <html>
      <body>
        <table id="expense-table">
          <thead>
            <tr>
              <th data-key="category">Category</th>
              <th data-key="description">Description</th>
              <th data-key="date">Date</th>
              <th data-key="amount">Amount</th>
            </tr>
          </thead>
          <tbody id="expense-table-body"></tbody>
        </table>
      </body>
      </html>
    `);

    document = dom.window.document;
    global.document = document;
    global.window = dom.window;

    // Create mock table elements
    tableBody = document.getElementById("expense-table-body");
    tableHeaders = document.querySelectorAll("thead th");

    // Execute the script in the test environment
    eval(scriptContent);
  });

  // this test case will check if the table is populated with data
  test("Should populate the table with expense data", () => {
    // Verify that table rows are created
    const rows = tableBody.querySelectorAll("tr");
    expect(rows.length).toBeGreaterThan(0);

    // Check if first row contains expected data
    const firstRowCells = rows[0].querySelectorAll("td");
    expect(firstRowCells.length).toBe(4); // Expecting 4 columns
    expect(firstRowCells[0].textContent).toBeTruthy(); // Category should exist
    expect(firstRowCells[1].textContent).toBeTruthy(); // Description should exist
  });

  // this test case will check if the table is sorted when a header is clicked
  test("Should sort the table when a header is clicked", () => {
    const dateHeader = document.querySelector('th[data-key="date"]');

    // Get first row before sorting
    const firstRowBefore = tableBody.querySelector("tr td:nth-child(3)").textContent;

    // simulate a click event on the date header
    dateHeader.click();

    // Get first row after sorting
    const firstRowAfter = tableBody.querySelector("tr td:nth-child(3)").textContent;

    // Verify that the table has been sorted (dates should be different)
    expect(firstRowBefore).not.toBe(firstRowAfter);
  });

  // this test case will check if the table is sorted in ascending order
  test("Should toggle sort order on consecutive clicks", () => {
    const amountHeader = document.querySelector('th[data-key="amount"]');

    // Simulate first click (ascending order)
    amountHeader.click();
    const firstRowAsc = tableBody.querySelector("tr td:nth-child(4)").textContent;

    // Simulate second click (descending order)
    amountHeader.click();
    const firstRowDesc = tableBody.querySelector("tr td:nth-child(4)").textContent;

    // The first row's amount should be different after the second click
    expect(firstRowAsc).not.toBe(firstRowDesc);
  });
});
