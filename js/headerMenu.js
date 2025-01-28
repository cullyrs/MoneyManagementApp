// this script is used to correctly position the settings dropdown menu.
// Why? The settings dropdown menu kept overflowing to the right side of the viewport.
// If the dropdown menu overflows the viewport, it is repositioned to the left or right side of the dropdown button.
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
