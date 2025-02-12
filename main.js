const express = require("express");
const path = require("path");

// Import functions
const { connectToDB } = require("./db/dbconnect");
const budgetFunctions = require("./db/budgetFunctions");
const userFunctions = require("./db/userFunctions");
const categoryFunctions = require("./db/categoryFunctions");
const goalFunctions = require("./db/goalFunctions");
const transactionsFunctions = require("./db/transactionsFunctions");

// Import routes
const authRoutes = require("./routes/authenRoutes"); 
const userRoutes = require("./routes/userRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const transactionRoutes = require("./routes/transactionRoutes");

// Initialize Express app
const app = express();

// Body Parser Middleware (Needed for post and put requests)
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve static files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/users", dashboardRoutes); 
app.use("/api/transactions", transactionRoutes);
app.use("/api/categories", categoryRoutes); 

// Homepage Route
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// Start the server after connecting to the database
const PORT = 8000;
connectToDB().then(() => {
    app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
}).catch(err => {
    console.error("Database connection failed. Server not started.");
});
