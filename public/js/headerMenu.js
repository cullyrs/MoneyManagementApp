/**
 * Name : Naeem
 * Date : 1/31/2025
 * File Name : headerMenu.js
 * Course  : CMSC 495 Capstone in Computer Science
 * Project : Expense Tracker Capstone Project
 * Description : This module handles the functionality for the settings dropdown
 * menu in the header. It ensures that the dropdown appears on mouse
 * hover and adjusts its position if it overflows the viewport.
 */

/**
 * Initializes the settings dropdown behavior for the Expense Tracker application.
 * When the DOM is fully loaded, event listeners are added to the dropdown element to control
 * the display and positioning of the associated settings dropdown menu:
 * 
 * - On mouseenter: The dropdown menu is shown. Its position is adjusted if it overflows the viewport.
 * - On mouseleave: The dropdown menu is hidden.
 */
document.addEventListener("DOMContentLoaded", () => {
    const dropdown = document.querySelector(".dropdown");
    const dropdownMenu = document.querySelector(".settings-dropdown");

    dropdown.addEventListener("mouseenter", () => {
        dropdownMenu.style.right = "auto";
        dropdownMenu.style.display = "block";

        const dropdownRect = dropdownMenu.getBoundingClientRect();
        if (dropdownRect.right > window.innerWidth) {
            dropdownMenu.style.left = "auto";
            dropdownMenu.style.right = "0";
        }
    });

    dropdown.addEventListener("mouseleave", () => { 
        dropdownMenu.style.display = "none";
    });
});
