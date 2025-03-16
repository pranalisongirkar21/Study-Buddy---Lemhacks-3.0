// Get tutor ID from URL parameters
const urlParams = new URLSearchParams(window.location.search);
const tutorId = urlParams.get('tutorId');
const action = urlParams.get('action');

// DOM Elements
const tutorAvatar = document.getElementById('tutorAvatar');
const tutorName = document.getElementById('tutorName');
const tutorRating = document.getElementById('tutorRating');
const tutorSubjects = document.getElementById('tutorSubjects');
const chatMessages = document.getElementById('chatMessages');
const messageInput = document.getElementById('messageInput');
const resourcesList = document.getElementById('resourcesList');
const scheduleModal = document.getElementById('scheduleModal');
const scheduleForm = document.getElementById('scheduleForm');
const fileUpload = document.getElementById('fileUpload');

// Sample tutor data (replace with API call)
const tutorData = {
    id: 1,
    name: "Sarah Johnson",
    avatar: "https://randomuser.me/api/portraits/women/1.jpg",
    rating: 4.8,
    subjects: ["Mathematics", "Physics"],
    topics: ["Calculus", "Mechanics"],
    level: "advanced",
    availability: "both",
    experience: "3 years",
    hourlyRate: "$25",
    languages: ["English", "Spanish"]
};

// Enhanced Zoom Meeting Controls
let zoomClient;
let meetingNumber;
let meetingPassword;
let userName;
let userEmail;
let signature;
let isHost = false;

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    loadTutorInfo();
    loadChatHistory();
    loadResources();
    initializeZoomSDK();
    initializeParticipantPanel();
    initializeSecurityPanel();
    
    // Close emoji picker when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.emoji-picker') && !e.target.closest('.emoji-btn')) {
            document.getElementById('emojiPicker').style.display = 'none';
        }
    });
});

// Load tutor information
function loadTutorInfo() {
    tutorAvatar.src = tutorData.avatar;
    tutorName.textContent = tutorData.name;
    tutorRating.innerHTML = generateStars(tutorData.rating);
    tutorSubjects.textContent = tutorData.subjects.join(', ');
}

// Generate star rating
function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    let stars = '';

    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star"></i>';
    }
    if (hasHalfStar) {
        stars += '<i class="fas fa-star-half-alt"></i>';
    }
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="far fa-star"></i>';
    }

    return stars + ` <span>(${rating})</span>`;
}

// Chat functionality
function sendMessage() {
    const message = messageInput.value.trim();
    if (!message) return;

    // Add message to chat
    addMessageToChat(message, 'sent');
    messageInput.value = '';

    // Simulate received message (replace with actual API call)
    setTimeout(() => {
        addMessageToChat("Thank you for your message! I'll get back to you shortly.", 'received');
    }, 1000);
}

function addMessageToChat(message, type) {
    const messageElement = document.createElement('div');
    messageElement.className = `message ${type}`;
    messageElement.textContent = message;
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Load chat history (replace with API call)
function loadChatHistory() {
    const sampleMessages = [
        { text: "Hi, I'm interested in scheduling a tutoring session", type: 'sent' },
        { text: "Hello! I'd be happy to help you. What subject would you like to focus on?", type: 'received' }
    ];

    sampleMessages.forEach(msg => addMessageToChat(msg.text, msg.type));
}

// Enter key to send message
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// Initialize Zoom client
const initializeZoomSDK = async () => {
    try {
        zoomClient = ZoomMtg.createClient();
        
        await zoomClient.init({
            debug: false,
            zoomAppRoot: document.getElementById('zmmtg-root'),
            language: 'en-US',
            customize: {
                meetingInfo: ['topic', 'host', 'mn', 'pwd', 'telPwd', 'invite', 'participant', 'dc', 'enctype'],
                toolbar: {
                    buttons: [
                        { key: 'audio', text: 'Audio' },
                        { key: 'video', text: 'Video' },
                        { key: 'share', text: 'Share' },
                        { key: 'participants', text: 'Participants' },
                        { key: 'security', text: 'Security' }
                    ]
                }
            }
        });
        
        console.log("Zoom SDK initialized successfully");
    } catch (error) {
        console.error("Failed to initialize Zoom SDK:", error);
        showError("Failed to initialize Zoom meeting. Please try again.");
    }
};

// Start Zoom meeting
const startZoomMeeting = () => {
    try {
        // In production, these would come from your backend
        const meetingConfig = {
            meetingNumber: '123456789',  // Replace with actual meeting number
            password: 'study123',        // Replace with actual password
            userName: tutorData.name,
            role: 1                      // 1 for host, 0 for attendee
        };

        // Generate Zoom meeting URL
        const zoomUrl = `https://zoom.us/j/${meetingConfig.meetingNumber}?pwd=${meetingConfig.password}`;
        
        // Open Zoom meeting in a new tab
        window.open(zoomUrl, '_blank');
        
        // Show success message
        showSuccess("Joining Zoom meeting...");
        
        // Update UI to show meeting is in progress
        document.querySelector('.start-zoom-btn').innerHTML = '<i class="fas fa-video"></i> Meeting in Progress';
        document.querySelector('.start-zoom-btn').classList.add('active');
        
        // Start session timer
        startSessionTimer();
        
    } catch (error) {
        console.error("Failed to start Zoom meeting:", error);
        showError("Failed to start the meeting. Please try again.");
    }
};

// Session timer
let sessionTimer;
const startSessionTimer = () => {
    let seconds = 0;
    const timerDisplay = document.getElementById('sessionTime');
    
    sessionTimer = setInterval(() => {
        seconds++;
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        timerDisplay.textContent = 
            `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }, 1000);
};

// End meeting
const endMeeting = () => {
    if (sessionTimer) {
        clearInterval(sessionTimer);
        document.getElementById('sessionTime').textContent = '00:00:00';
    }
    
    document.querySelector('.start-zoom-btn').innerHTML = '<i class="fas fa-video"></i> Start Zoom Session';
    document.querySelector('.start-zoom-btn').classList.remove('active');
    
    showSuccess("Meeting ended");
};

// Session Controls
const initializeSessionControls = () => {
    // Audio Control
    document.getElementById('audioBtn').addEventListener('click', () => {
        const isAudioMuted = zoomClient.isAudioMuted();
        zoomClient.muteAudio(!isAudioMuted);
        toggleControlButton('audioBtn', !isAudioMuted);
    });

    // Video Control
    document.getElementById('videoBtn').addEventListener('click', () => {
        const isVideoOff = zoomClient.isVideoOff();
        zoomClient.muteVideo(!isVideoOff);
        toggleControlButton('videoBtn', !isVideoOff);
    });

    // Screen Share
    document.getElementById('shareBtn').addEventListener('click', async () => {
        try {
            if (!zoomClient.isShareScreening()) {
                await zoomClient.startShareScreen();
                toggleControlButton('shareBtn', true);
            } else {
                await zoomClient.stopShareScreen();
                toggleControlButton('shareBtn', false);
            }
        } catch (error) {
            console.error("Screen sharing error:", error);
            showError("Failed to share screen. Please check your permissions.");
        }
    });

    // Recording Control
    if (isHost) {
        document.getElementById('recordBtn').addEventListener('click', async () => {
            try {
                const isRecording = zoomClient.isRecording();
                if (!isRecording) {
                    await zoomClient.startRecording();
                    toggleControlButton('recordBtn', true);
                } else {
                    await zoomClient.stopRecording();
                    toggleControlButton('recordBtn', false);
                }
            } catch (error) {
                console.error("Recording error:", error);
                showError("Failed to control recording. Please try again.");
            }
        });
    }
};

// Participant Management
const initializeParticipantPanel = () => {
    const participantsList = document.getElementById('participantsList');
    
    zoomClient.on('user-added', (payload) => {
        updateParticipantsList();
        updateParticipantCount();
    });

    zoomClient.on('user-removed', (payload) => {
        updateParticipantsList();
        updateParticipantCount();
    });
};

const updateParticipantsList = async () => {
    const participants = await zoomClient.getAttendeeslist();
    const participantsList = document.getElementById('participantsList');
    participantsList.innerHTML = '';

    participants.forEach(participant => {
        const participantElement = createParticipantElement(participant);
        participantsList.appendChild(participantElement);
    });
};

const createParticipantElement = (participant) => {
    const div = document.createElement('div');
    div.className = 'participant-item';
    div.innerHTML = `
        <img src="${participant.avatar || 'default-avatar.png'}" class="participant-avatar" alt="${participant.userName}">
        <div class="participant-info">
            <div class="participant-name">${participant.userName}</div>
            <div class="participant-role">${participant.isHost ? 'Host' : 'Participant'}</div>
        </div>
        <div class="participant-controls">
            <button onclick="toggleParticipantAudio('${participant.userId}')" title="Toggle Audio">
                <i class="fas fa-microphone${participant.isAudioMuted ? '-slash' : ''}"></i>
            </button>
            <button onclick="toggleParticipantVideo('${participant.userId}')" title="Toggle Video">
                <i class="fas fa-video${participant.isVideoOff ? '-slash' : ''}"></i>
            </button>
        </div>
    `;
    return div;
};

// Security Controls
const initializeSecurityPanel = () => {
    if (!isHost) return;

    document.getElementById('lockMeeting').addEventListener('change', async (e) => {
        try {
            await zoomClient.lockMeeting(e.target.checked);
        } catch (error) {
            console.error("Failed to lock meeting:", error);
            showError("Failed to update meeting security settings.");
        }
    });

    document.getElementById('enableWaitingRoom').addEventListener('change', async (e) => {
        try {
            await zoomClient.setWaitingRoomStatus(e.target.checked);
        } catch (error) {
            console.error("Failed to update waiting room:", error);
            showError("Failed to update waiting room settings.");
        }
    });
};

// Utility Functions
const toggleControlButton = (buttonId, isActive) => {
    const button = document.getElementById(buttonId);
    if (isActive) {
        button.classList.add('active');
    } else {
        button.classList.remove('active');
    }
};

const updateParticipantCount = async () => {
    const participants = await zoomClient.getAttendeeslist();
    const count = participants.length;
    document.querySelector('.participant-count').textContent = count;
};

const updateMeetingInfo = () => {
    document.getElementById('meetingId').textContent = meetingNumber;
};

const copyMeetingInfo = () => {
    const meetingInfo = `Meeting ID: ${meetingNumber}\nPassword: ${meetingPassword}`;
    navigator.clipboard.writeText(meetingInfo)
        .then(() => showSuccess("Meeting info copied to clipboard"))
        .catch(() => showError("Failed to copy meeting info"));
};

const showError = (message) => {
    // Implementation of error toast notification
    const toast = document.createElement('div');
    toast.className = 'toast error';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
};

const showSuccess = (message) => {
    // Implementation of success toast notification
    const toast = document.createElement('div');
    toast.className = 'toast success';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
};

// Panel Toggle Functions
const togglePanel = (panelId) => {
    const panel = document.getElementById(panelId);
    const isActive = panel.classList.contains('active');
    
    // Close all panels first
    document.querySelectorAll('.side-panel').forEach(p => p.classList.remove('active'));
    
    // Toggle the selected panel
    if (!isActive) {
        panel.classList.add('active');
    }
};

// Enhanced chat functionality
const emojis = ['😊', '👍', '👋', '🎓', '📚', '💡', '⭐', '❤️', '🔥', '👏', '🤔', '✨', '💪', '🙌', '📝', '🎯'];

function toggleEmojiPicker() {
    const emojiPicker = document.getElementById('emojiPicker');
    if (emojiPicker.style.display === 'none') {
        // Populate emoji picker if empty
        if (!emojiPicker.children.length) {
            emojis.forEach(emoji => {
                const emojiElement = document.createElement('div');
                emojiElement.className = 'emoji-item';
                emojiElement.textContent = emoji;
                emojiElement.onclick = () => addEmojiToMessage(emoji);
                emojiPicker.appendChild(emojiElement);
            });
        }
        emojiPicker.style.display = 'grid';
    } else {
        emojiPicker.style.display = 'none';
    }
}

function addEmojiToMessage(emoji) {
    const messageInput = document.getElementById('messageInput');
    messageInput.value += emoji;
    messageInput.focus();
    document.getElementById('emojiPicker').style.display = 'none';
}

// Enhanced file handling
function filterResources() {
    const fileType = document.getElementById('fileTypeFilter').value;
    const searchTerm = document.getElementById('searchResources').value.toLowerCase();
    const resources = document.querySelectorAll('.resource-item');

    resources.forEach(resource => {
        const fileName = resource.querySelector('span').textContent.toLowerCase();
        const fileExtension = fileName.split('.').pop();
        
        const matchesType = fileType === 'all' || fileExtension.includes(fileType);
        const matchesSearch = fileName.includes(searchTerm);
        
        resource.style.display = matchesType && matchesSearch ? 'flex' : 'none';
    });
}

function toggleResourceFilter() {
    const filters = document.querySelector('.resource-filters');
    filters.style.display = filters.style.display === 'none' ? 'flex' : 'none';
}

function previewResource(fileName) {
    const previewModal = document.getElementById('previewModal');
    const previewContent = document.getElementById('previewContent');
    
    // In production, this would fetch and display the actual file content
    previewContent.innerHTML = `
        <div style="text-align: center;">
            <i class="fas fa-file-alt" style="font-size: 48px; margin-bottom: 1rem;"></i>
            <p>Previewing: ${fileName}</p>
        </div>
    `;
    
    previewModal.style.display = 'block';
}

function closePreviewModal() {
    document.getElementById('previewModal').style.display = 'none';
}

// Schedule modal
function openScheduleModal() {
    scheduleModal.style.display = 'block';
}

function closeScheduleModal() {
    scheduleModal.style.display = 'none';
}

// Close modal when clicking outside
window.onclick = (event) => {
    if (event.target === scheduleModal) {
        closeScheduleModal();
    }
}

// Handle schedule form submission
scheduleForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const formData = {
        date: document.getElementById('sessionDate').value,
        time: document.getElementById('sessionTime').value,
        duration: document.getElementById('sessionDuration').value,
        topic: document.getElementById('sessionTopic').value
    };

    // Replace with actual API call
    console.log('Scheduling session:', formData);
    
    // Show confirmation
    alert('Session scheduled successfully!');
    closeScheduleModal();
});

// File upload functionality
function openFileUpload() {
    fileUpload.click();
}

fileUpload.addEventListener('change', handleFileUpload);

function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['.pdf', '.doc', '.docx', '.ppt', '.pptx'];
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    
    if (!allowedTypes.includes(fileExtension)) {
        alert('Please upload a valid document file (PDF, DOC, DOCX, PPT, PPTX)');
        return;
    }

    // Add file to resources list (replace with actual upload logic)
    addResourceToList(file);
}

function addResourceToList(file) {
    const resourceItem = document.createElement('div');
    resourceItem.className = 'resource-item';
    
    const icon = document.createElement('i');
    icon.className = getFileIcon(file.name);
    
    const fileName = document.createElement('span');
    fileName.textContent = file.name;
    
    resourceItem.appendChild(icon);
    resourceItem.appendChild(fileName);
    resourcesList.appendChild(resourceItem);
}

function getFileIcon(fileName) {
    const extension = fileName.split('.').pop().toLowerCase();
    switch (extension) {
        case 'pdf':
            return 'fas fa-file-pdf';
        case 'doc':
        case 'docx':
            return 'fas fa-file-word';
        case 'ppt':
        case 'pptx':
            return 'fas fa-file-powerpoint';
        default:
            return 'fas fa-file';
    }
}

// Load existing resources (replace with API call)
function loadResources() {
    const sampleResources = [
        { name: 'Lecture Notes.pdf', type: 'pdf' },
        { name: 'Assignment 1.docx', type: 'docx' }
    ];

    sampleResources.forEach(resource => {
        const resourceItem = document.createElement('div');
        resourceItem.className = 'resource-item';
        resourceItem.innerHTML = `
            <i class="fas fa-file-${resource.type}"></i>
            <span>${resource.name}</span>
        `;
        resourcesList.appendChild(resourceItem);
    });
} 