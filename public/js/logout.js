document.addEventListener("DOMContentLoaded", async () => {
    const logoutLink = document.getElementById("logout-link");
    const userId = sessionStorage.getItem("userId");
    const token = sessionStorage.getItem("token");

    try {
        if (!userId || !token) {
            logoutLink.textContent = "Login";
            logoutLink.href = "/login.html";
        } else {
            logoutLink.textContent = "Logout";
            logoutLink.href = "/logout.html";
        }
    } catch (error) {
        console.error("Error checking login status:", error);
    }
});