const express = require("express");
const router = express.Router();

/**
 * API route to trigger an alert
 */
router.post("/", (req, res) => {
    const { message, type } = req.body;

    if (!message || !type) {
        return res.status(400).json({ success: false, error: "Missing required fields." });
    }

    // Return only the HTML
    const alertHtml = `
        <div class="alert-container alert-${type}">
            <span>${message}</span>
            <button class="alert-close" onclick="this.parentElement.remove();">&times;</button>
        </div>
    `;

    res.send(alertHtml);
});

module.exports = router;

// showAlert("Transaction added successfully!", "success");

// showAlert("Error adding transaction!", "error");

// showAlert("Are you sure you want to delete this transaction?", "confirm", (confirmed) => {
//     if (confirmed) {
//         console.log("User confirmed deletion!");
//     } else {
//         console.log("User canceled deletion!");
//     }
// });
