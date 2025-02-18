const express = require("express");
const router = express.Router();
const sgMail = require("@sendgrid/mail");
const { SENDGRID_API_KEY, SENDER_EMAIL } = require("../db/api.json");

sgMail.setApiKey(SENDGRID_API_KEY);

router.post("/", async (req, res) => {
    const { name, email, category, message } = req.body;

    if (!name || !email || !category || !message) {
        return res.status(400).json({ success: false, error: "All fields are required." });
    }

    const msg = {
        to: ["nlovitt@student.umgc.edu", "smounie@student.umgc.edu"], 
        from: SENDER_EMAIL,  
        subject: `New Contact Form Submission - ${category}`,
        text: `Name: ${name}\nEmail: ${email}\nCategory: ${category}\nMessage: ${message}`,
    };

    try {
        await sgMail.send(msg);
        res.json({ success: true, message: "Form submitted successfully!" });
    } catch (error) {
        res.status(500).json({ success: false, error: "Server error. Try again later." });
    }
});

module.exports = router;
