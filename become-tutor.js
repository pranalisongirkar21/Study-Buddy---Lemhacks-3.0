// DOM Elements
const tutorProfileForm = document.getElementById('tutorProfileForm');
const availabilityToggle = document.getElementById('availabilityToggle');
const avatarUpload = document.getElementById('avatarUpload');
const profileAvatar = document.getElementById('profileAvatar');
const calendarGrid = document.getElementById('calendarGrid');
const sessionsList = document.getElementById('sessionsList');
const availabilityModal = document.getElementById('availabilityModal');
const availabilityForm = document.getElementById('availabilityForm');

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    initializeCalendar();
    loadSessions();
    initializeCharts();
    setupEventListeners();
});

// Profile Management
function setupEventListeners() {
    // Avatar upload
    document.querySelector('.change-avatar-btn').addEventListener('click', () => {
        avatarUpload.click();
    });

    avatarUpload.addEventListener('change', handleAvatarUpload);

    // Certificate upload
    document.querySelector('.upload-btn').addEventListener('click', () => {
        document.getElementById('certificates').click();
    });

    document.getElementById('certificates').addEventListener('change', handleCertificateUpload);

    // Availability toggle
    availabilityToggle.addEventListener('change', handleAvailabilityToggle);

    // Profile form submission
    tutorProfileForm.addEventListener('submit', handleProfileSubmit);

    // Modal close buttons
    document.querySelectorAll('.close').forEach(button => {
        button.addEventListener('click', () => {
            button.closest('.modal').style.display = 'none';
        });
    });

    // Add time slot button
    document.querySelector('.add-slot-btn').addEventListener('click', addTimeSlot);

    // Availability form submission
    availabilityForm.addEventListener('submit', handleAvailabilitySubmit);
}

function handleAvatarUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        showNotification('Please upload an image file', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        profileAvatar.src = e.target.result;
        showNotification('Profile picture updated successfully', 'success');
    };
    reader.readAsDataURL(file);
}

function handleCertificateUpload(e) {
    const files = Array.from(e.target.files);
    const certificatesList = document.getElementById('certificatesList');

    files.forEach(file => {
        const certificateItem = document.createElement('div');
        certificateItem.className = 'certificate-item';
        certificateItem.innerHTML = `
            <i class="fas fa-file-pdf"></i>
            <span>${file.name}</span>
            <button type="button" class="remove-certificate">
                <i class="fas fa-times"></i>
            </button>
        `;
        certificatesList.appendChild(certificateItem);
    });

    showNotification('Certificates uploaded successfully', 'success');
}

function handleAvailabilityToggle(e) {
    const status = e.target.checked ? 'available' : 'unavailable';
    // Update availability status in backend
    showNotification(`You are now ${status} for tutoring sessions`, 'info');
}

function handleProfileSubmit(e) {
    e.preventDefault();
    
    // Collect form data
    const formData = {
        fullName: document.getElementById('fullName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        education: document.getElementById('education').value,
        subjects: Array.from(document.getElementById('subjects').selectedOptions).map(opt => opt.value),
        experience: document.getElementById('experience').value,
        rate: document.getElementById('rate').value,
        bio: document.getElementById('bio').value
    };

    // In production, send this data to backend
    console.log('Profile data:', formData);
    showNotification('Profile updated successfully', 'success');
}

// Calendar Management
function initializeCalendar() {
    const today = new Date();
    updateCalendarHeader(today);
    generateCalendarDays(today);
}

function updateCalendarHeader(date) {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
    document.getElementById('currentMonth').textContent = 
        `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
}

function generateCalendarDays(date) {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const startingDay = firstDay.getDay();
    const totalDays = lastDay.getDate();

    calendarGrid.innerHTML = '';

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDay; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day empty';
        calendarGrid.appendChild(emptyDay);
    }

    // Add days of the month
    for (let day = 1; day <= totalDays; day++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        dayElement.textContent = day;

        // Add indicator for days with sessions
        if (hasSessionsOnDay(new Date(date.getFullYear(), date.getMonth(), day))) {
            dayElement.classList.add('has-sessions');
        }

        dayElement.addEventListener('click', () => selectDay(day));
        calendarGrid.appendChild(dayElement);
    }
}

function hasSessionsOnDay(date) {
    // In production, check against actual session data
    return Math.random() > 0.7; // Randomly show some days as having sessions
}

function selectDay(day) {
    const selectedDate = document.getElementById('availabilityDate');
    const currentMonth = document.getElementById('currentMonth').textContent;
    selectedDate.value = new Date(currentMonth + ' ' + day).toISOString().split('T')[0];
    openAvailabilityModal();
}

// Session Management
function loadSessions() {
    // In production, fetch actual session data from backend
    const sampleSessions = [
        {
            studentName: 'John Doe',
            subject: 'Mathematics',
            date: '2024-03-20',
            time: '14:00',
            duration: 60
        },
        {
            studentName: 'Jane Smith',
            subject: 'Physics',
            date: '2024-03-21',
            time: '15:30',
            duration: 90
        }
    ];

    sessionsList.innerHTML = '';
    sampleSessions.forEach(session => {
        const sessionElement = document.createElement('div');
        sessionElement.className = 'session-item';
        sessionElement.innerHTML = `
            <div class="session-header">
                <h4>${session.subject} with ${session.studentName}</h4>
                <span class="session-date">${formatDate(session.date)} at ${session.time}</span>
            </div>
            <div class="session-duration">
                <i class="fas fa-clock"></i> ${session.duration} minutes
            </div>
            <div class="session-actions">
                <button onclick="startSession('${session.studentName}')" class="start-session-btn">
                    <i class="fas fa-play"></i> Start
                </button>
                <button onclick="rescheduleSession('${session.studentName}')" class="reschedule-btn">
                    <i class="fas fa-calendar-alt"></i> Reschedule
                </button>
            </div>
        `;
        sessionsList.appendChild(sessionElement);
    });
}

// Analytics Charts
function initializeCharts() {
    const sessionsCtx = document.getElementById('sessionsChart').getContext('2d');
    const earningsCtx = document.getElementById('earningsChart').getContext('2d');

    // Sessions Chart
    new Chart(sessionsCtx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Number of Sessions',
                data: [5, 8, 12, 15, 20, 25],
                borderColor: '#3498DB',
                tension: 0.4,
                fill: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Sessions Over Time'
                }
            }
        }
    });

    // Earnings Chart
    new Chart(earningsCtx, {
        type: 'bar',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Earnings ($)',
                data: [150, 250, 300, 400, 450, 500],
                backgroundColor: '#27AE60'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Monthly Earnings'
                }
            }
        }
    });
}

// Availability Modal
function openAvailabilityModal() {
    availabilityModal.style.display = 'block';
}

function addTimeSlot() {
    const timeSlots = document.querySelector('.time-slots');
    const newSlot = document.createElement('div');
    newSlot.className = 'time-slot';
    newSlot.innerHTML = `
        <input type="time" class="start-time" required>
        <span>to</span>
        <input type="time" class="end-time" required>
        <button type="button" class="remove-slot" onclick="removeTimeSlot(this)">
            <i class="fas fa-times"></i>
        </button>
    `;
    timeSlots.appendChild(newSlot);
}

function removeTimeSlot(button) {
    button.closest('.time-slot').remove();
}

function handleAvailabilitySubmit(e) {
    e.preventDefault();

    const date = document.getElementById('availabilityDate').value;
    const timeSlots = Array.from(document.querySelectorAll('.time-slot')).map(slot => ({
        start: slot.querySelector('.start-time').value,
        end: slot.querySelector('.end-time').value
    }));
    const repeatOption = document.getElementById('repeatOption').value;

    // In production, send this data to backend
    console.log('Availability data:', { date, timeSlots, repeatOption });
    
    availabilityModal.style.display = 'none';
    showNotification('Availability updated successfully', 'success');
    
    // Refresh calendar to show new availability
    initializeCalendar();
}

// Utility Functions
function formatDate(dateString) {
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Session Actions
function startSession(studentName) {
    // In production, implement actual session start logic
    showNotification(`Starting session with ${studentName}`, 'success');
}

function rescheduleSession(studentName) {
    // In production, implement rescheduling logic
    showNotification(`Rescheduling session with ${studentName}`, 'info');
}

// Navigation between months
document.getElementById('prevMonth').addEventListener('click', () => {
    const currentMonth = document.getElementById('currentMonth').textContent;
    const date = new Date(currentMonth);
    date.setMonth(date.getMonth() - 1);
    updateCalendarHeader(date);
    generateCalendarDays(date);
});

document.getElementById('nextMonth').addEventListener('click', () => {
    const currentMonth = document.getElementById('currentMonth').textContent;
    const date = new Date(currentMonth);
    date.setMonth(date.getMonth() + 1);
    updateCalendarHeader(date);
    generateCalendarDays(date);
}); 