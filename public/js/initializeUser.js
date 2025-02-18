/**
 * Name : Cully Stearns, Naeem Lovitt
 * Date  : 1/31/2025
 * File Name : initializeUser.js
 * Course : CMSC 495 Capstone in Computer Science
 * Project : Expense Tracker Capstone Project
 * Description : This module handles the initialization of user-related functionality,
 * including client-side validation and event handling for login and signup
 * processes within the Expense Tracker application.
 */

/**
 * Function to authenticate the user in the Expense Tracker Accounts database.
 * Triggered when the "Log In" button is clicked, this function retrieves the entered
 * username and password, validates them, and invokes the 'login' IPC handler.
 * On successful authentication, the user's unique identifier is stored in localStorage,
 * and the user is redirected to the dashboard.
 * Returns an error message if authentication fails.
 *
 * @param {String} username - The username entered by the user.
 * @param {String} password - The password entered by the user.
 * @returns {Object} An object containing:
 *      success {Boolean} - True if login is successful, false otherwise.
 *      userId {String} - The unique identifier of the authenticated user (if successful).
 *      error {String} - An error message if login fails.
 */


// TODO: remove alerts later, instead have a div that displays the error message, change to block if error, none if no error

async function showAlert(message, type) {
    // **Function to hide alert smoothly**
    function closeAlert(alertBox) {
        alertBox.classList.remove("show");
        setTimeout(() => alertBox.remove(), 500);
    }

    fetch("/api/alert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, type }),
    })
        .then(response => response.text())
        .then(alertHtml => {
            document.body.insertAdjacentHTML("beforeend", alertHtml);

            const alertBox = document.querySelector(".alert-container:last-of-type");
            if (!alertBox) return;


            setTimeout(() => {
                alertBox.classList.add("show");
            }, 100);

            // Auto-hide alert after 5 seconds
            setTimeout(() => closeAlert(alertBox), 5000);

            // Close button functionality
            alertBox.querySelector("#alert-close").addEventListener("click", () => closeAlert(alertBox));
        })
        .catch(error => {
            console.error("Error triggering alert:", error);
        });
}

document.addEventListener("DOMContentLoaded", () => {
    const login = document.getElementById("login");
    const signup = document.getElementById("signup");

    async function loggingIn(username, password) {
        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            const result = await response.json();
            if (result.success) {
                sessionStorage.setItem("token", result.token);
                sessionStorage.setItem("userId", result.userId);
                sessionStorage.setItem("netbalance", result.totalAmount);
                sessionStorage.setItem("transactions", JSON.stringify(result.transactions));
                sessionStorage.setItem("budgets", JSON.stringify(result.budgets));
                sessionStorage.setItem("goals", JSON.stringify(result.goals));
                showAlert("Login successful!", "success");
                window.location.href = "./dashboard.html";
            } else {
                showAlert("Login failed: " + result.error, "error");
            }
        } catch (error) {
            console.error("Login Error:", error);
        }
    };

    login.addEventListener("click", async () => {
        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value.trim();

        loggingIn(username, password);
    });

    /**
 * Function to register a new user in the Expense Tracker Accounts database.
 * Triggered when the "Sign Up" button is clicked, this function retrieves the entered
 * username, password, and email, validates them (including password complexity and email format),
 * and invokes the 'signup' IPC handler. On successful registration, a welcome message is displayed.
 * Returns an error message if signup fails.
 *
 * @param {String} username - The desired username for the new user.
 * @param {String} password - The desired password for the new user.
 * @param {String} email - The email address for the new user.
 * @returns {Object} An object containing:
 *      success {Boolean} - True if signup is successful, false otherwise.
 *      userId {String} - The unique identifier of the newly created user (if successful).
 *      error {String} - An error message if signup fails.
 */
    signup.addEventListener("click", async () => {
        const username = document.getElementById("signupUsername").value.trim();
        const email = document.getElementById("signupEmail").value.trim();
        const password = document.getElementById("signupPassword").value.trim();

        if (!username || !email || !password) {
            showAlert("All fields are required.", "error");
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            showAlert("Invalid email address.", "error");
            return;
        }

        if (password.length < 6 || !(/[A-Za-z]/.test(password) && /\d/.test(password))) {
            showAlert("Password must be at least 6 characters and contain both letters and numbers.", "error");
            return;
        }

        try {
            const response = await fetch("/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, email, password }),
            });

            const result = await response.json();
            if (result.success) {
                showAlert(`Sign Up successful! Welcome, ${username}`, "success");
                loggingIn(username, password);
            } else {
                showAlert(`Sign Up failed: ${result.error}`, "error");
            }
        } catch (error) {
            console.error("Signup Error:", error);
            showAlert("Something went wrong. Please try again.", "error");
        }
    });
});