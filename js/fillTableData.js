// this script is used to fill the table with data and sort the data based on the header clicked

document.addEventListener("DOMContentLoaded", () => {

    const tableBody = document.getElementById("expense-table-body");
    const tableHeaders = document.querySelectorAll("thead th");
    
    // Example data to simulate fetched data from MongoDB
    const expenses = [
        { category: "Utilities", description: "Electricity Bill", date: "2025-01-05", amount: 75.00 },
        { category: "Entertainment", description: "Netflix Subscription", date: "2025-01-01", amount: 15.99 },
        { category: "Groceries", description: "Weekly Grocery Shopping", date: "2025-01-07", amount: 120.00 },
        { category: "Transportation", description: "Monthly Bus Pass", date: "2025-01-10", amount: 75.00 },
        { category: "Dining", description: "Dinner at Italian Restaurant", date: "2025-01-14", amount: 45.00 },
        { category: "Health", description: "Doctor's Appointment", date: "2025-01-20", amount: 50.00 },
        { category: "Other", description: "Miscellaneous Expense", date: "2025-01-25", amount: 30.00 },
        { category: "Utilities", description: "Water Bill", date: "2025-01-28", amount: 50.00 },
        { category: "Entertainment", description: "Concert Tickets", date: "2025-01-30", amount: 100.00 },
        { category: "Transportation", description: "Gas Refill", date: "2025-01-31", amount: 40.00 },
        { category: "Health", description: "Prescription Medication", date: "2025-01-15", amount: 25.00 },
        { category: "Utilities", description: "Internet Bill", date: "2025-01-20", amount: 60.00 },
        { category: "Entertainment", description: "Movie Night", date: "2025-01-22", amount: 20.00 },
        { category: "Groceries", description: "Farmer's Market", date: "2025-01-05", amount: 50.00 },
        { category: "Dining", description: "Lunch with Friends", date: "2025-01-10", amount: 35.00 },
        { category: "Health", description: "Dental Checkup", date: "2025-01-15", amount: 75.00 },
        { category: "Other", description: "Gift Purchase", date: "2025-01-20", amount: 25.00 },
        { category: "Utilities", description: "Gas Bill", date: "2025-01-25", amount: 70.00 },
        { category: "Entertainment", description: "Gaming Subscription", date: "2025-01-30", amount: 10.00 },
        { category: "Transportation", description: "Taxi Ride", date: "2025-01-31", amount: 25.00 },
    ];

    // Function to render table rows
    const renderTableRows = (data) => {
        tableBody.innerHTML = ""; // Clear existing rows
        data.forEach((expense) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${expense.category}</td>
                <td>${expense.description}</td>
                <td>${expense.date}</td>
                <td>$${expense.amount.toFixed(2)}</td>
            `;
            tableBody.appendChild(row);
        });
    };

    // Sort data
    const sortData = (data, key, order) => {
        return data.sort((a, b) => {
            if (a[key] < b[key]) return order === "asc" ? -1 : 1; // -1 for ascending order or 1 for descending order.
            if (a[key] > b[key]) return order === "asc" ? 1 : -1; // 1 for ascending order or -1 for descending order.
            return 0; // No change in order. The order parameter determines whether the sorting is in ascending or descending order.
        });
    };

    // Handle header clicks
    tableHeaders.forEach((header, index) => {
        header.addEventListener("click", () => {
            const key = header.getAttribute("data-key");
            const currentOrder = header.getAttribute("data-order") || "asc"; // Default order is ascending
            const newOrder = currentOrder === "asc" ? "desc" : "asc"; // Toggle order on each click

            // Update data-order attribute for the clicked header
            tableHeaders.forEach((h) => h.removeAttribute("data-order"));
            header.setAttribute("data-order", newOrder);

            // Sort and re-render table rows
            const sortedData = sortData(expenses, key, newOrder);
            renderTableRows(sortedData);
        });
    });

    
    // Default sort by date descending
    const sortedExpenses = sortData(expenses, "date", "desc");
    renderTableRows(sortedExpenses);

    // Update the header for the default sorting
    const dateHeader = document.querySelector('thead th[data-key="date"]');
    if (dateHeader) {
        dateHeader.setAttribute("data-order", "desc");
    }
});
