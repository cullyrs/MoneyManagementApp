//  notes: may need to change to return variables to be placed in the html file??? maybe.
// currently edits the html file directly

document.addEventListener("DOMContentLoaded", () => {
    const currentMonthButton = document.getElementById("current-month");
    const monthSelector = document.getElementById("month-selector");
    const prevMonthButton = document.getElementById("prev-month");
    const nextMonthButton = document.getElementById("next-month");

    let currentDate = new Date(); // current date

    // update the displayed month and year
    const updateDisplayedMonth = () => {
        const month = currentDate.toLocaleString("default", { month: "long" });
        const year = currentDate.getFullYear();

        currentMonthButton.textContent = `${month} ${year}`;
        monthSelector.value = `${year}-${String(currentDate.getMonth() + 1).padStart(2, "0")}`;
    };
    updateDisplayedMonth();

    // dropdown the month selector
    currentMonthButton.addEventListener("click", () => {
        monthSelector.classList.toggle("visible");
    });

    // Update the displayed month when a new month is selected
    monthSelector.addEventListener("change", (event) => {
        const [year, month] = event.target.value.split("-");
        currentDate = new Date(year, month - 1, 1); 
        updateDisplayedMonth();
        monthSelector.classList.remove("visible");
    });

    // previous month button
    prevMonthButton.addEventListener("click", () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        updateDisplayedMonth();
    });

    // next month button
    nextMonthButton.addEventListener("click", () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        updateDisplayedMonth();
    });
});
