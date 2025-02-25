
async function showAlert(message, type) {
  // Function to hide alert smoothly
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

      // Show alert
      setTimeout(() => {
        alertBox.classList.add("show");
      }, 100);

      // Auto-hide alert after 5 seconds
      setTimeout(() => closeAlert(alertBox), 5000);

    })
    .catch(error => {
      console.error("Error triggering alert:", error);
    });
}
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
          showAlert("Password updated successfully!", "success");
          form.reset();
        } else {
          showAlert("Error updating password: " + result.error, "error");
        }
      } catch (error) {
        console.error("Error updating password:", error);
        showAlert("An error occurred while updating the password.", error);
      }
    });
  } else {
    console.error("Form with ID 'updatePassword' not found.");
  }
});


