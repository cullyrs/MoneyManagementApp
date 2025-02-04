/**
 * Name : Arewa (Morountudun) Ojelade
 * Date : 2/4/2025
 * File Name: initializeUser.js
 * Contributors: Cully Stearns Naeem Levitt
 * Course : CMSC 495 Capstone in Computer Science
 * Project : Expense Tracker Capstone Project
 * Description : The initializeUser.js authenticates user login and sign up 
 * information. 
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
            // Store the logged-in user ID in localStorage
            localStorage.setItem('userId', result.userId);
            alert('Login success!');
            window.location.href = "dashboard.html"; // Redirect to dashboard

        } else {
            alert('Login failed: ' + result.error);
        }
    });

    // Client-side validation for sign up
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


