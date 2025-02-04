/**
 * Name : Arewa (Morountudun) Ojelade
 * Date : 2/4/2025
 * File Name: headerMenu.js
 * Contributors: Cully Stearns Naeem Levitt
 * Course : CMSC 495 Capstone in Computer Science
 * Project : Expense Tracker Capstone Project
 * Description : Correctly position shte settings in the dropdown menu
 */

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
