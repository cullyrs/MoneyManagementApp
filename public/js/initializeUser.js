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

//Updated to store dashboard data in session storage for initialization. All data
//comes from the login function.
login.addEventListener("click", async () => {
        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value.trim();

        if (!username || !password) {
            alert("Please enter a valid username and password.");
            return;
        }

        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            const result = await response.json();
            if (result.success) {
                // Save the returned data in sessionStorage
                sessionStorage.setItem("token", result.token);
                sessionStorage.setItem("userId", result.userId);
                sessionStorage.setItem("transactions", JSON.stringify(result.transactions));
                sessionStorage.setItem("budgets", JSON.stringify(result.budgets));
                sessionStorage.setItem("goals", JSON.stringify(result.goals));

                alert("Login successful!");
                window.location.href = "./dashboard.html";
            } else {
                alert("Login failed: " + result.error);
            }
        } catch (error) {
            console.error("Login Error:", error);
            alert("Something went wrong. Please try again.");
        }
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
            alert("All fields are required.");
            return;
        }

        if (password.length < 6 || !(/[A-Za-z]/.test(password) && /\d/.test(password))) {
            alert("Password must be at least 6 characters and contain both letters and numbers.");
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
                alert(`Sign Up successful! Welcome, ${username}`);
            } else {
                alert(`Sign Up failed: ${result.error}`);
            }
        } catch (error) {
            console.error("Signup Error:", error);
            alert("Something went wrong. Please try again.");
        }
    });


