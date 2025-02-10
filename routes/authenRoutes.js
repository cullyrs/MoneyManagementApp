const express = require("express");
const jwt = require("jsonwebtoken");
const { loginUser, addUser } = require("../db/userFunctions");
require("dotenv").config();

const router = express.Router();
const { password } = require("../api.json");

const SECRET_KEY = password || "defaultSecretKey"; // Secret from api.json

if (!SECRET_KEY) {
    console.error("ERROR: SECRET_KEY is missing in api.json file");
    process.exit(1); // End the server if no secret key is found
}

// Store blacklisted tokens
const blacklistedTokens = new Set();

//  Login Route: Authenticates user credentials
router.post("/login", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ success: false, error: "All fields are required." });
    }

    try {
        const userData = await loginUser(username, password);

        if (!userData) {
            return res.status(401).json({ success: false, error: "Invalid credentials." });
        }

        const user = userData[0]; // Extract user object
        const token = jwt.sign({ userId: user._id }, SECRET_KEY, { expiresIn: "1h" });

        res.json({ success: true, token, userId: user._id });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ success: false, error: "Server error." });
    }
});

// Signup Route: Registers a new user
router.post("/signup", async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ success: false, error: "All fields are required." });
    }

    try {
        const newUser = await addUser(username, password, email);

        if (!newUser) {
            return res.status(400).json({ success: false, error: "Invalid user data or duplicate username." });
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

/**
 * debug check if a token is blacklisted.
 */
router.get("/validate-token", (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(400).json({ error: "No token provided." });
    }

    if (blacklistedTokens.has(token)) {
        return res.status(401).json({ error: "Token is blacklisted." });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        res.json({ success: true, message: "Token is valid", userId: decoded.userId });
    } catch (error) {
        res.status(401).json({ error: "Invalid token." });
    }
});

module.exports = router;
