// DOM Elements
const calendarGrid = document.getElementById('calendarGrid');
const currentMonthElement = document.getElementById('currentMonth');
const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');
const sessionsList = document.getElementById('sessionsList');
const scheduleModal = document.getElementById('scheduleModal');
const scheduleForm = document.getElementById('scheduleForm');

// Current date
let currentDate = new Date();
let selectedDate = null;

// Sample sessions data (replace with API calls in production)
let sessions = [
    {
        id: 1,
        type: 'one-on-one',
        subject: 'Mathematics',
        date: '2024-03-15',
        time: '14:00',
        duration: 60,
        notes: 'Calculus review'
    },
    {
        id: 2,
        type: 'group',
        subject: 'Physics',
        date: '2024-03-20',
        time: '15:30',
        duration: 90,
        notes: 'Mechanics problem solving'
    }
];

// Initialize calendar
document.addEventListener('DOMContentLoaded', () => {
    renderCalendar();
    renderSessions();
    
    // Event listeners for month navigation
    prevMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });
    
    nextMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });
    
    // Form submission
    scheduleForm.addEventListener('submit', handleScheduleSubmit);
});

// Render calendar
function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Update month display
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];
    currentMonthElement.textContent = `${monthNames[month]} ${year}`;
    
    // Clear grid
    calendarGrid.innerHTML = '';
    
    // Get first day of month and total days
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const totalDays = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    // Add empty cells for days before first of month
    for (let i = 0; i < startingDay; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'calendar-date empty';
        calendarGrid.appendChild(emptyCell);
    }
    
    // Add days of month
    for (let day = 1; day <= totalDays; day++) {
        const dateCell = document.createElement('div');
        dateCell.className = 'calendar-date';
        dateCell.textContent = day;
        
        // Check if date has sessions
        const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        if (hasSessionsOnDate(dateString)) {
            dateCell.classList.add('has-session');
        }
        
        // Add click handler
        dateCell.addEventListener('click', () => selectDate(dateString));
        
        calendarGrid.appendChild(dateCell);
    }
}

// Check if date has sessions
function hasSessionsOnDate(dateString) {
    return sessions.some(session => session.date === dateString);
}

// Select date
function selectDate(dateString) {
    // Remove active class from all dates
    document.querySelectorAll('.calendar-date').forEach(date => {
        date.classList.remove('active');
    });
    
    // Add active class to selected date
    const selectedCell = Array.from(document.querySelectorAll('.calendar-date')).find(
        cell => !cell.classList.contains('empty') && 
        cell.textContent === dateString.split('-')[2].replace(/^0/, '')
    );
    if (selectedCell) {
        selectedCell.classList.add('active');
    }
    
    selectedDate = dateString;
    
    // Filter and display sessions for selected date
    renderSessions(dateString);
}

// Render sessions list
function renderSessions(dateString = null) {
    sessionsList.innerHTML = '';
    
    const filteredSessions = dateString
        ? sessions.filter(session => session.date === dateString)
        : sessions.sort((a, b) => new Date(a.date + ' ' + a.time) - new Date(b.date + ' ' + b.time));
    
    if (filteredSessions.length === 0) {
        sessionsList.innerHTML = '<p class="no-sessions">No sessions scheduled</p>';
        return;
    }
    
    filteredSessions.forEach(session => {
        const sessionCard = document.createElement('div');
        sessionCard.className = 'session-card';
        sessionCard.innerHTML = `
            <div class="session-header">
                <span class="session-title">${session.subject}</span>
                <span class="session-time">${formatTime(session.time)}</span>
            </div>
            <div class="session-details">
                <p>${session.type} • ${session.duration} minutes</p>
                <p>${session.notes}</p>
            </div>
        `;
        sessionsList.appendChild(sessionCard);
    });
}

// Format time for display
function formatTime(timeString) {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours));
    date.setMinutes(parseInt(minutes));
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

// Modal functions
function openScheduleModal() {
    scheduleModal.style.display = 'block';
    if (selectedDate) {
        document.getElementById('sessionDate').value = selectedDate;
    }
}

function closeScheduleModal() {
    scheduleModal.style.display = 'none';
    scheduleForm.reset();
}

// Close modal when clicking outside
window.onclick = (event) => {
    if (event.target === scheduleModal) {
        closeScheduleModal();
    }
};

// Handle form submission
function handleScheduleSubmit(e) {
    e.preventDefault();
    
    const formData = {
        id: sessions.length + 1,
        type: document.getElementById('sessionType').value,
        subject: document.getElementById('subject').value,
        date: document.getElementById('sessionDate').value,
        time: document.getElementById('sessionTime').value,
        duration: parseInt(document.getElementById('duration').value),
        notes: document.getElementById('notes').value
    };
    
    // Add new session
    sessions.push(formData);
    
    // Update UI
    renderCalendar();
    renderSessions();
    
    // Close modal and show success message
    closeScheduleModal();
    showNotification('Session scheduled successfully!');
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
} 