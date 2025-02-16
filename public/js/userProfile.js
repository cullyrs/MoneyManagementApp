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

    console.log("Retrieved userId:", userId);

    try {
        // Fetch user information from the backend
        const response = await fetch(`/api/users/${userId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        const user = await response.json();
        const profileInfo = document.querySelector(".profile-info");

        if (profileInfo) {
            profileInfo.innerHTML = `
                <h2>Personal Information</h2>
                <p><strong>Username:</strong> ${user.userName || "N/A"}</p>
                <p><strong>Email:</strong> ${user.email || "N/A"}</p>
                <p><strong>Join Date:</strong> ${new Date(user.createdAt).toLocaleDateString() || "N/A"}</p>
            `;
        } else {
            console.error("Profile info container not found.");
        }
    } catch (err) {
        console.error("Error retrieving user info:", err);
        alert("Failed to load user profile. Please try again.");
    }

    // Handle Logout Button Click
    const logoutButton = document.getElementById("logout");
    if (logoutButton) {
        logoutButton.addEventListener("click", async () => {
            try {
                const response = await fetch("/api/auth/logout", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error(`Logout failed: ${response.status}`);
                }

                // Clear client-side session storage
                sessionStorage.removeItem("userId");
                sessionStorage.removeItem("token");

                alert("Logout successful!");
                window.location.href = "./login.html"; // Redirect to login page

            } catch (error) {
                console.error("Logout Error:", error);
                alert("Logout failed. Please try again.");
            }
        });
    } else {
        console.error("Logout button not found in the DOM.");
    }
});
