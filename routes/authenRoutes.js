const express = require("express");
const jwt = require("jsonwebtoken");
const { loginUser, addUser, findUser, getUser, updatePassword } = require("../db/userFunctions");
const { compareEntry, hashed } = require("../utils/helper.js");
const router = express.Router();

require("dotenv").config({ path: require("path").resolve(__dirname, "../db/config.env") });

const SECRET_KEY = process.env.DB_PASSWORD || "defaultSecretKey";


if (!SECRET_KEY) {
    console.error("ERROR: SECRET_KEY is missing in config file");
    process.exit(1);
}

// In-memory store for blacklisted tokens.
const blacklistedTokens = new Set();

// Use the login function to get the user data, goals, budgets, and transactions
router.post("/login", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res
            .status(400)
            .json({ success: false, error: "All fields are required." });
    }

    try {
        const userData = await loginUser(username, password);
        if (!userData) {
            return res
                .status(401)
                .json({ success: false, error: "Invalid credentials." });
        }

        const user = userData[0];
        const transactions = userData[1];
        const budgets = userData[2];
        const goals = userData[3];

        const token = jwt.sign({ userId: user._id }, SECRET_KEY, { expiresIn: "1h" });

        res.json({
            success: true,
            token,
            userId: user._id,
            transactions,
            budgets,
            goals,
            totalAmount: user.totalAmount,
        });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ success: false, error: "Server error." });
    }
});

// Signup Route: Registers a new user
router.post("/signup", async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res
            .status(400)
            .json({ success: false, error: "All fields are required." });
    }

    try {
        const newUser = await addUser(username, password, email);

        if (!newUser) {
            return res.status(400).json({
                success: false,
                error: "Invalid user data or duplicate username."
            });
        }

        res.json({ success: true, message: "User registered successfully." });
    } catch (error) {
        console.error("Signup Error:", error);
        res.status(500).json({ success: false, error: "Server error." });
    }
});

//  Logout Route: Invalidates the JWT token
router.post("/logout", (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(400).json({ success: false, error: "No token provided." });
    }

    blacklistedTokens.add(token); // Add token to blacklist
    res.json({ success: true, message: "User logged out successfully." });
});

router.get('/by-email/:email', async (req, res) => {
    const email = req.params.email;
    try {
        const user = await getUser(email);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }
        res.json({ success: true, user });
    } catch (error) {
        console.error('Error fetching user by email:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});


router.post("/updatePassword", async (req, res) => {
    const { userID, oldEntry, newEntry } = req.body;

    if (!userID || !oldEntry || !newEntry) {
        return res.status(400).json({
            success: false,
            error: "Missing required fields: userID, oldEntry, or newEntry.",
        });
    }

    try {

        const updatedUser = await updatePassword(userID, oldEntry, newEntry);

        if (!updatedUser) {
            return res.status(400).json({
                success: false,
                error: "User not found or old password is incorrect.",
            });
        }

        res.json({ success: true, user: updatedUser });
    } catch (error) {
        console.error("Error updating password:", error);
        res.status(500).json({ success: false, error: "Server error" });
    }
});
module.exports = router;

