/**
 * Name : Cully Stearnsn Naeem Lovitt
 * Date  : 1/31/2025
 * File Name : userProfile.js
 * Course : CMSC 495 Capstone in Computer Science
 * Project : Expense Tracker Capstone Project
 * Description : This module manages the user profile page of the Expense Tracker 
 * application. It retrieves and displays the logged-in user's information 
 * via IPC, toggles the settings dropdown, and handles user logout functionality.
 */
document.addEventListener("DOMContentLoaded", async () => {
  const userId = sessionStorage.getItem("userId");
  const token = sessionStorage.getItem("token");

  if (!userId || !token) {
    console.error("No logged-in user found. Redirecting to login page.");
    window.location.href = "login.html";
    return;
  }

    try {
        // Fetch user information from the backend
        const response = await fetch(`/api/users/${userId}`, {
            method: "GET",
        });

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        const user = await response.json();
        // console.log("user:",  user)
        const profileInfo = document.querySelector(".profile-info");

        if (profileInfo) {
            profileInfo.innerHTML = `
                <h2>Personal Information</h2>
                <p><strong>Username:</strong> ${user.userName || "N/A"}</p>
                <p><strong>Email:</strong> ${user.email || "N/A"}</p>
                <p><strong>Join Date:</strong> ${new Date(user.createdAt).toLocaleDateString() || "N/A"}</p>
            `;
        } else {
            // console.warn("Profile info container not found.");
        }
    } catch (err) {
        console.error("Error retrieving user info:", err);
    }
});