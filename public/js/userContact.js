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

document.addEventListener("DOMContentLoaded", async () => {
    const userId = sessionStorage.getItem("userId");
    const token = sessionStorage.getItem("token");
    const form = document.getElementById("contact-form");
    // const formStatus = document.createElement("p");
    // form.appendChild(formStatus);

    let email = "";

    if (!userId || !token) {
        console.error("No logged-in user found.");
        return;
    }

    // Auto-fill user's email
    try {
        const response = await fetch(`/api/users/${userId}`);

        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

        const user = await response.json();
        email = user.email;
        document.getElementById("email").value = email;
    } catch (err) {
        console.error("Error retrieving user info:", err);
    }

    // Handle Form Submission
    window.submitContactForm = async (event) => {
        event.preventDefault();

        const formData = {
            name: document.getElementById("name").value.trim(),
            email: document.getElementById("email").value.trim(),
            category: document.getElementById("category").value,
            message: document.getElementById("message").value.trim(),
        };

        try {
            const response = await fetch("api/submitContactForm", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            if (response.ok && result.success) {
                showAlert("Message sent successfully!", "success");
                form.reset();
                document.getElementById("email").value = email;
            } else {
                showAlert("Failed to send message.", "error");
            }
        } catch (error) {
            console.error("Error submitting contact form:", error);
            showAlert("Error sending message. Try again later.", "error");
        }
    };
});
