/**
 * Name : Naeem
 * Date : 1/31/2025
 * File Name : dateScript.js
 * Course  : CMSC 495 Capstone in Computer Science
 * Project : Expense Tracker Capstone Project
 * Description : This module handles the date selection functionality within
 * the Expense Tracker application. It updates the month selector,
 * and manages navigation between months using previous and next buttons.
 */
document.addEventListener("DOMContentLoaded", () => {
    const monthSelector = document.getElementById("month-selector");
    const prevMonthButton = document.getElementById("prev-month");
    const nextMonthButton = document.getElementById("next-month");

    let currentDate = new Date();

/**
 * Updates the month selector input element with the current date.
 * This function formats the current date as "YYYY-MM", ensuring that the month
 * is zero-padded if needed, and then assigns this value to the monthSelector element.
 */
    const updateMonthSelector = () => {
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, "0"); 
        monthSelector.value = `${year}-${month}`;
    };
    
    updateMonthSelector();

/**
 * Adds a click event listener to the monthSelector input element.
 * If the browser supports the 'showPicker' method, it will open the native date picker.
 * Otherwise, it will simply focus the input.
 */
    monthSelector.addEventListener("click", () => {
        if ('showPicker' in monthSelector) {
            monthSelector.showPicker();
        } else {
            monthSelector.focus();
        }
    });
    
/**
 * Adds a change event listener to the monthSelector input element.
 * When the user selects a new month, this listener parses the input value (formatted as "YYYY-MM")
 * and updates the currentDate variable to the first day of the chosen month.
 */
    monthSelector.addEventListener("change", (event) => {
        const [year, month] = event.target.value.split("-");
        currentDate = new Date(year, month - 1, 1);
    });
    
/**
 * Adds a click event listener to the previous month button.
 * When clicked, it decrements the currentDate's month by one and updates the month selector display.
 */
    prevMonthButton.addEventListener("click", () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        updateMonthSelector();
    });

/**
 * Adds a click event listener to the next month button.
 * When clicked, it increments the currentDate's month by one and updates the month selector display.
 */
    nextMonthButton.addEventListener("click", () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        updateMonthSelector();
    });

});
