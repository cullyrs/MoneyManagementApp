document.addEventListener("DOMContentLoaded", async () => {
    const logoutLink = document.getElementById("logout-link");
    const userId = sessionStorage.getItem("userId");
    const token = sessionStorage.getItem("token");
    const dashboardLink = document.querySelector("h2 a[href='dashboard.html']");

    try {
        if (!userId || !token) {
            logoutLink.textContent = "Login";
            logoutLink.href = "/login.html";
            // redirect dashboard to index if not logged in
            if (dashboardLink) {
                dashboardLink.href = "index.html";
                dashboardLink.title = "Go To Homepage";

            }

        } else {
            logoutLink.textContent = "Logout";
            logoutLink.href = "/logout.html";
        }
        if (window.location.pathname.includes("login.html") && userId && token) {
            window.location.href = "/dashboard.html";
        }
        // snappier redirect for index.html
        if (window.location.pathname.includes("index.html") && userId && token) {
            const getStartedButton = document.querySelector('.btn[href="login.html"]');
            if (getStartedButton) {
                getStartedButton.href = "dashboard.html";
                getStartedButton.textContent = "Go to Dashboard";
            }
        }
    } catch (error) {
        console.error("Error checking login status:", error);
    }
});

async function exportTransactionsToCSV(userId, token) {
    if (!userId || !token) {
        console.error("Missing user authentication details.");
        return;
    }

    // Confirmation Popup
    const confirmDownload = window.confirm("Download your transactions?");
    if (!confirmDownload) {
        return; // Exit if the user cancels
    }

    try {
        const response = await fetch(`/api/transactions/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json();
        let transactions = data.transactions;
        if (!transactions || transactions.length === 0) {
            console.error("No transactions to export.");
            return;
        }

        // Define CSV headers
        const headers = ["Amount", "Date", "Category", "Description"];
        const csvRows = [];
        csvRows.push(headers.join(",")); // Add header row

        // Format transactions for CSV
        transactions.forEach(transaction => {
            let { amount, date, category, description, type } = transaction;

            // Convert amount to negative if type is "expense"
            if (type === "expense") {
                amount = -Math.abs(amount);
            }

            // Convert date to readable format
            const formattedDate = new Date(date).toISOString().split("T")[0]; // YYYY-MM-DD

            // Extract category name (if populated)
            const categoryName = category?.name || "Unknown";

            // Add row to CSV
            const row = [`"${amount}"`, `"${formattedDate}"`, `"${categoryName}"`, `"${description || ""}"`];
            csvRows.push(row.join(","));
        });

        // Create CSV Blob
        const csvContent = csvRows.join("\n");
        const blob = new Blob([csvContent], { type: "text/csv" });

        // Generate Auto-Filename (e.g., "transactions_2024-02-16_14-30-45.csv")
        const now = new Date();
        const timestamp = now.toISOString().slice(0, 19).replace("T", "_").replace(/:/g, "-");
        const fileName = `transactions_${timestamp}.csv`;

        // Create Download Link
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = fileName;

        // Trigger Download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

    } catch (error) {
        console.error("Error exporting transactions:", error);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const userID = sessionStorage.getItem("userId");
    const token = sessionStorage.getItem("token");
    // Select the export button
    const exportButton = document.getElementById("export-csv");
    const exportButton2 = document.getElementById("export-csv2");

    // Attach click event listener
    exportButton.addEventListener("click", async (event) => {
        await exportTransactionsToCSV(userID, token);
    });
    if (exportButton2) {
        // Attach click event listener
        exportButton2.addEventListener("click", async (event) => {
            await exportTransactionsToCSV(userID, token);
        });
    }
});