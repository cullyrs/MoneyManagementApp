document.addEventListener("DOMContentLoaded", async () => {
  const userId = sessionStorage.getItem("userId");
  const token = sessionStorage.getItem("token");

  if (!userId || !token) {
    console.error("No logged-in user found. Redirecting to login page.");
    window.location.href = "login.html";
    return;
  }

  console.log("Retrieved userId:", userId);
  
   const form = document.getElementById("updatePassword");
  if (form) {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      
      const oldEntry = document.getElementById("oldEntry").value;
      const newEntry = document.getElementById("newEntry").value;
      
      const changeData = { userID: userId, oldEntry, newEntry };

      try {
        const response = await fetch("/api/auth/updatePassword", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(changeData)
        });
        const result = await response.json();
        const messageDiv = document.getElementById("message");
        if (result.success) {
          messageDiv.innerHTML =
            '<div class="alert alert-success">Password updated successfully.</div>';
        } else {
          messageDiv.innerHTML =
            '<div class="alert alert-danger">Error: ' + result.error + "</div>";
        }
      } catch (error) {
        console.error("Error updating password:", error);
        document.getElementById("message").innerHTML =
          '<div class="alert alert-danger">An error occurred while updating the password.</div>';
      }
    });
  } else {
    console.error("Form with ID 'updatePassword' not found.");
  }
});


