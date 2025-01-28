// this script is used to handle the month selector and the previous and next month buttons.
document.addEventListener("DOMContentLoaded", () => {
    const monthSelector = document.getElementById("month-selector");
    const prevMonthButton = document.getElementById("prev-month");
    const nextMonthButton = document.getElementById("next-month");

    let currentDate = new Date(); // Current date

    // Update the value of the month selector to the current date
    const updateMonthSelector = () => {
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, "0"); // Month is zero-based, so add 1, pad with 0 if needed
        monthSelector.value = `${year}-${month}`;
    };
    updateMonthSelector();

    // Show the picker programmatically when the month button is clicked
    monthSelector.addEventListener("click", () => {
        if ('showPicker' in monthSelector) {
            monthSelector.showPicker();
        } else {
            monthSelector.focus();
        }
    });

    // Handle changes in the month selector
    monthSelector.addEventListener("change", (event) => {
        const [year, month] = event.target.value.split("-");
        currentDate = new Date(year, month - 1, 1);
    });

    // Handle previous month button
    prevMonthButton.addEventListener("click", () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        updateMonthSelector();
    });

    // Handle next month button
    nextMonthButton.addEventListener("click", () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        updateMonthSelector();
    });

    
});
