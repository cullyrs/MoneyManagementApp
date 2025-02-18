const express = require("express");
const { findUser } = require("../db/userFunctions");

const router = express.Router();

// Get User Profile
// http://localhost:8000/api/users/<ENTER USERID HERE>
router.get("/:id", async (req, res) => {
    const userId = req.params.id;
    try {
        const user = await findUser(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }
        res.json(user);
    } catch (error) {
        console.error("Error retrieving user:", error);
        res.status(500).json({ error: "Server error." });
    }
});



module.exports = router;
