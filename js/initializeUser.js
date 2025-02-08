/**
 * Name : Cully Stearns
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
document.addEventListener('DOMContentLoaded', () => {
    const login = document.getElementById('login');
    const signup = document.getElementById('signup');

    login.addEventListener('click', async () => {
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();

        if (!username) {
            alert("Please enter a valid username.");
            return;
        }
        if (!password) {
            alert("Please enter a valid password.");
            return;
        }

        const result = await window.electronAPI.invoke('login', {username, password});
        if (result.success) {
            localStorage.setItem('userId', result.userId);
            alert('Login success!');
            window.location.href = "./dashboard.html"; 

        } else {
            alert('Login failed: ' + result.error);
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
    signup.addEventListener('click', async () => {
        const username = document.getElementById('signupUsername').value.trim();
        const password = document.getElementById('signupPassword').value.trim();
        const email = document.getElementById('signupEmail').value.trim();

        if (!username) {
            alert('Please enter a valid username.');
            return;
        }

        if (!password) {
            alert('Please enter a valid password.');
            return;
        }
        if (password.length < 6 || !(/[A-Za-z]/.test(password) && /\d/.test(password))) {
            alert('Password must be at least 6 characters and contain both letters and numbers.');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            alert('Please enter a valid email address.');
            return;
        }

        const result = await window.electronAPI.invoke('signup', {
            username,
            password,
            email
        });

        if (result.success) {
            alert(`Sign Up success! Welcome, ${username}`);
        } else {
            alert(`Sign Up failed: ${result.error}`);
        }
    });
});


