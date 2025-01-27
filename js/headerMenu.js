document.addEventListener("DOMContentLoaded", () => {
    const dropdown = document.querySelector(".dropdown");
    const dropdownMenu = document.querySelector(".settings-dropdown");

    dropdown.addEventListener("mouseenter", () => {
        // Reset position to defaults
        dropdownMenu.style.left = "0";
        dropdownMenu.style.right = "auto";

        // Make the dropdown visible
        dropdownMenu.style.display = "block";

        // Adjust position if it overflows the viewport
        const dropdownRect = dropdownMenu.getBoundingClientRect();
        if (dropdownRect.right > window.innerWidth) {
            dropdownMenu.style.left = "auto";
            dropdownMenu.style.right = "0";
        }
    });

    dropdown.addEventListener("mouseleave", () => {
        // Hide the dropdown
        dropdownMenu.style.display = "none";
    });
});
