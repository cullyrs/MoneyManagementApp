/**
 * Name : Arewa (Morountudun) Ojelade
 * Date  : 1/31/2025
 * File Name : userProfile.js
 * Course : CMSC 495 Capstone in Computer Science
 * Project : Expense Tracker Capstone Project
 * Description : This module manages the user profile page of the Expense Tracker 
 * application. It retrieves and displays the logged-in user's information 
 * via IPC, toggles the settings dropdown, and handles user logout functionality.
 */

document.addEventListener("DOMContentLoaded", async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
        console.error("No logged in user found. Redirecting to login page.");
        window.location.href = "login.html";
        return;
    }
    console.log("Retrieved userId:", userId);

    /**
     * Retrieves the user's information from the backend using the "findUser" IPC handler,
     * then populates the .profile-info element with the retrieved details.
     *
     * @async
     * @function loadUserInfo
     * @returns {Promise<void>} Resolves when the user information has been successfully displayed.
     */
    try {
        const result = await window.electronAPI.invoke("findUser", userId);
        if (result.success && result.user) {
            const user = result.user;
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
        } else {
            console.error("Failed to retrieve user information:", result.error);
        }
    } catch (err) {
        console.error("Error retrieving user info:", err);
    }

    /**NEED TO DETERMINE BEST APPROACH FOR LOGOUT 
     * Attaches a click event listener to the logout button that handles the user logout process.
     * When the logout button is clicked, this function invokes the "logout" IPC handler.
     * On successful logout, it clears the user's session data from localStorage, alerts the user,
     * and redirects to the login page.
     *
     * @async
     * @function handleLogout
     * @returns {Promise<void>} Resolves when the logout process is complete.
     */
    const logoutButton = document.getElementById("logout");
    if (logoutButton) {
        logoutButton.addEventListener("click", async () => {
            try {
                // Optionally, invoke the logout IPC handler if implemented.
                const result = await window.electronAPI.invoke("logout");
                if (result.success) {
                    // Clear stored session information.
                    localStorage.removeItem("userId");
                    // Optionally remove additional user data.
                    alert("Logout successful!");
                    window.location.href = "./login.html"; // Redirect to login page.
                } else {
                    alert("Logout failed: " + result.error);
                }
            } catch (err) {
                console.error("Error during logout:", err);
                alert("Logout failed: " + err.message);
            }
        });
    } else {
        console.error("Logout button not found in the DOM.");
    }
});