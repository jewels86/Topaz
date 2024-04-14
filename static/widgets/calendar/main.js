var calendarContainer = document.getElementById('calendar');
var calendar = new FullCalendar.Calendar(calendarContainer, {
    initialView: 'dayGridMonth'
});
calendar.render();