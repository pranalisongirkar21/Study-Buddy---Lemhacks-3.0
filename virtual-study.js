// Sample room data for demonstration
let rooms = [
    {
        id: 1,
        name: "Math Study Group",
        subject: "mathematics",
        participants: 3,
        maxCapacity: 6,
        privacy: "public",
        createdBy: "John Doe"
    },
    {
        id: 2,
        name: "Physics Discussion",
        subject: "physics",
        participants: 2,
        maxCapacity: 4,
        privacy: "public",
        createdBy: "Jane Smith"
    }
];

// DOM Elements
const roomsGrid = document.getElementById('roomsGrid');
const createRoomModal = document.getElementById('createRoomModal');
const createRoomForm = document.getElementById('createRoomForm');
const activeRoom = document.getElementById('activeRoom');

// Audio elements for ambient sounds
const audioElements = {
    cafe: new Audio('sounds/cafe-ambience.mp3'),
    rain: new Audio('sounds/rain.mp3'),
    nature: new Audio('sounds/nature.mp3'),
    whitenoise: new Audio('sounds/white-noise.mp3')
};

// WebRTC Configuration
const configuration = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
    ]
};

let localStream;
let peerConnections = {};
let roomParticipants = new Set();

// Add these variables at the top of the file
let currentRoom = null;
let currentUser = {
    id: 'user_' + Math.random().toString(36).substr(2, 9) // Generate a random user ID
};

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const roomId = urlParams.get('roomId');
    
    if (roomId) {
        joinRoom(parseInt(roomId));
    }
    
    displayRooms();
    initializeWhiteboard();
    setupAudioControls();
});

// Display available rooms
function displayRooms() {
    roomsGrid.innerHTML = '';
    rooms.forEach(room => {
        const roomCard = document.createElement('div');
        roomCard.className = 'room-card';
        roomCard.innerHTML = `
            <h3>${room.name}</h3>
            <div class="room-info">
                <span><i class="fas fa-book"></i> ${room.subject}</span>
                <span><i class="fas fa-users"></i> ${room.participants}/${room.maxCapacity} participants</span>
                <span><i class="fas fa-lock${room.privacy === 'public' ? '-open' : ''}"></i> ${room.privacy}</span>
                <span><i class="fas fa-user"></i> Created by ${room.createdBy}</span>
            </div>
            <button class="join-room-btn" onclick="joinRoom(${room.id})">
                Join Room
            </button>
        `;
        roomsGrid.appendChild(roomCard);
    });
}

// Modal functions
function openCreateRoomModal() {
    createRoomModal.style.display = 'block';
}

function closeCreateRoomModal() {
    createRoomModal.style.display = 'none';
}

// Handle room creation
createRoomForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const newRoom = {
        id: rooms.length + 1,
        name: document.getElementById('roomName').value,
        subject: document.getElementById('roomSubject').value,
        participants: 0,
        maxCapacity: parseInt(document.getElementById('roomCapacity').value),
        privacy: document.querySelector('input[name="privacy"]:checked').value,
        createdBy: "Current User" // Replace with actual user name
    };
    
    rooms.push(newRoom);
    displayRooms();
    closeCreateRoomModal();
    createRoomForm.reset();
});

// Join room
function joinRoom(roomId) {
    const room = rooms.find(r => r.id === roomId);
    if (!room) return;

    currentRoom = room; // Set the current room

    // Update room display
    document.getElementById('roomTitle').textContent = room.name;
    activeRoom.style.display = 'block';
    document.querySelector('.rooms-section').style.display = 'none';

    // Initialize video call
    initializeVideoCall();
    
    // Reinitialize whiteboard with the new room
    initializeWhiteboard();

    // Update URL with room ID
    const roomUrl = generateRoomUrl(roomId);
    history.pushState({}, '', roomUrl);
}

// Generate shareable room URL
function generateRoomUrl(roomId) {
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}?roomId=${roomId}`;
}

// Copy room link to clipboard
function copyRoomLink() {
    if (!currentRoom) return;
    
    const roomUrl = generateRoomUrl(currentRoom.id);
    navigator.clipboard.writeText(roomUrl)
        .then(() => showSuccess('Room link copied to clipboard!'))
        .catch(() => showError('Failed to copy room link'));
}

// Leave room
function leaveRoom() {
    activeRoom.style.display = 'none';
    document.querySelector('.rooms-section').style.display = 'block';
    stopAllAudio();
}

// Video controls
function toggleAudio() {
    if (localStream) {
        const audioTrack = localStream.getAudioTracks()[0];
        audioTrack.enabled = !audioTrack.enabled;
        
        const btn = document.querySelector('button[onclick="toggleAudio()"]');
        const icon = btn.querySelector('i');
        icon.className = audioTrack.enabled ? 'fas fa-microphone' : 'fas fa-microphone-slash';
    }
}

function toggleVideo() {
    if (localStream) {
        const videoTrack = localStream.getVideoTracks()[0];
        videoTrack.enabled = !videoTrack.enabled;
        
        const btn = document.querySelector('button[onclick="toggleVideo()"]');
        const icon = btn.querySelector('i');
        icon.className = videoTrack.enabled ? 'fas fa-video' : 'fas fa-video-slash';
    }
}

async function toggleScreen() {
    try {
        if (localStream.getVideoTracks()[0].label.includes('screen')) {
            // Stop screen sharing
            const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
            const videoTrack = videoStream.getVideoTracks()[0];
            replaceTrack(videoTrack);
        } else {
            // Start screen sharing
            const screenStream = await navigator.mediaDevices.getDisplayMedia();
            const screenTrack = screenStream.getVideoTracks()[0];
            replaceTrack(screenTrack);
        }
        
        const btn = document.querySelector('button[onclick="toggleScreen()"]');
        const icon = btn.querySelector('i');
        icon.className = localStream.getVideoTracks()[0].label.includes('screen') ? 
            'fas fa-stop' : 'fas fa-desktop';
    } catch (error) {
        console.error('Error toggling screen share:', error);
    }
}

// Replace video track in all peer connections
function replaceTrack(newTrack) {
    const oldTrack = localStream.getVideoTracks()[0];
    localStream.removeTrack(oldTrack);
    localStream.addTrack(newTrack);
    
    Object.values(peerConnections).forEach(pc => {
        const sender = pc.getSenders().find(s => s.track && s.track.kind === 'video');
        if (sender) {
            sender.replaceTrack(newTrack);
        }
    });
    
    // Update local video
    const localVideo = document.getElementById('localVideo');
    if (localVideo) {
        localVideo.srcObject = localStream;
    }
}

// Pomodoro Timer
let timerInterval;
let timeLeft;
let isTimerRunning = false;

function startTimer() {
    if (isTimerRunning) return;
    
    const selectedTime = document.querySelector('input[name="timerMode"]:checked').value;
    timeLeft = selectedTime * 60;
    
    document.getElementById('startTimer').disabled = true;
    document.getElementById('pauseTimer').disabled = false;
    
    isTimerRunning = true;
    
    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            isTimerRunning = false;
            playTimerEndSound();
            document.getElementById('startTimer').disabled = false;
            document.getElementById('pauseTimer').disabled = true;
        }
    }, 1000);
}

function pauseTimer() {
    clearInterval(timerInterval);
    isTimerRunning = false;
    document.getElementById('startTimer').disabled = false;
    document.getElementById('pauseTimer').disabled = true;
}

function resetTimer() {
    clearInterval(timerInterval);
    isTimerRunning = false;
    const selectedTime = document.querySelector('input[name="timerMode"]:checked').value;
    timeLeft = selectedTime * 60;
    updateTimerDisplay();
    document.getElementById('startTimer').disabled = false;
    document.getElementById('pauseTimer').disabled = true;
}

function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    document.getElementById('timerMinutes').textContent = String(minutes).padStart(2, '0');
    document.getElementById('timerSeconds').textContent = String(seconds).padStart(2, '0');
}

function playTimerEndSound() {
    const audio = new Audio('sounds/timer-end.mp3');
    audio.play();
}

// Whiteboard WebSocket connection
let whiteboardWs;
let isDrawing = false;
let context;
let currentPath = [];

function initializeWhiteboard() {
    const canvas = document.getElementById('whiteboard');
    if (!canvas) {
        console.error('Whiteboard canvas element not found');
        return;
    }

    context = canvas.getContext('2d');
    
    // Set canvas size
    function resizeCanvas() {
        const container = canvas.parentElement;
        canvas.width = container.offsetWidth;
        canvas.height = container.offsetHeight;
    }
    
    // Initial resize
    resizeCanvas();
    
    // Resize canvas when window is resized
    window.addEventListener('resize', resizeCanvas);
    
    // Connect to WebSocket server
    try {
        whiteboardWs = new WebSocket('ws://localhost:3000');
        
        whiteboardWs.onopen = () => {
            console.log('Connected to whiteboard server');
            // Join room only if we're in a room
            if (currentRoom) {
                whiteboardWs.send(JSON.stringify({
                    type: 'join-room',
                    roomId: currentRoom.id,
                    userId: currentUser.id
                }));
            }
        };
        
        whiteboardWs.onerror = (error) => {
            console.error('WebSocket connection error:', error);
        };
        
        whiteboardWs.onclose = () => {
            console.log('WebSocket connection closed');
            // Try to reconnect after 3 seconds
            setTimeout(() => {
                console.log('Attempting to reconnect...');
                initializeWhiteboard();
            }, 3000);
        };
        
        whiteboardWs.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                
                switch (data.type) {
                    case 'whiteboard-draw':
                        if (data.userId !== currentUser.id) {
                            drawPath(data.points, data.color, data.lineWidth);
                        }
                        break;
                    case 'whiteboard-clear':
                        if (data.userId !== currentUser.id) {
                            clearWhiteboard();
                        }
                        break;
                }
            } catch (error) {
                console.error('Error processing WebSocket message:', error);
            }
        };
    } catch (error) {
        console.error('Error initializing WebSocket:', error);
    }
    
    // Drawing event listeners
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);
    
    // Touch support
    canvas.addEventListener('touchstart', handleTouch);
    canvas.addEventListener('touchmove', handleTouch);
    canvas.addEventListener('touchend', stopDrawing);
}

function startDrawing(e) {
    isDrawing = true;
    const point = getPoint(e);
    currentPath = [point];
    draw(e);
}

function draw(e) {
    if (!isDrawing) return;
    
    const point = getPoint(e);
    currentPath.push(point);
    
    // Draw locally
    context.beginPath();
    context.moveTo(currentPath[currentPath.length - 2].x, currentPath[currentPath.length - 2].y);
    context.lineTo(point.x, point.y);
    context.lineWidth = document.getElementById('brushSize').value;
    context.strokeStyle = document.getElementById('colorPicker').value;
    context.lineCap = 'round';
    context.stroke();
    
    // Send to server
    whiteboardWs.send(JSON.stringify({
        type: 'whiteboard-draw',
        points: currentPath,
        color: context.strokeStyle,
        lineWidth: context.lineWidth
    }));
}

function stopDrawing() {
    isDrawing = false;
    currentPath = [];
}

function getPoint(e) {
    const rect = e.target.getBoundingClientRect();
    return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
}

function handleTouch(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousemove', {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    
    if (e.type === 'touchstart') {
        startDrawing(mouseEvent);
    } else if (e.type === 'touchmove') {
        draw(mouseEvent);
    }
}

function drawPath(points, color, lineWidth) {
    context.beginPath();
    context.moveTo(points[0].x, points[0].y);
    
    for (let i = 1; i < points.length; i++) {
        context.lineTo(points[i].x, points[i].y);
    }
    
    context.strokeStyle = color;
    context.lineWidth = lineWidth;
    context.lineCap = 'round';
    context.stroke();
}

function clearWhiteboard() {
    const canvas = document.getElementById('whiteboard');
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    // Notify others
    whiteboardWs.send(JSON.stringify({
        type: 'whiteboard-clear'
    }));
}

// Ambient Sounds
function setupAudioControls() {
    const volumeControl = document.getElementById('volumeControl');
    
    // Set initial volume
    Object.values(audioElements).forEach(audio => {
        audio.loop = true;
        audio.volume = volumeControl.value / 100;
    });
    
    // Volume change handler
    volumeControl.addEventListener('input', (e) => {
        const volume = e.target.value / 100;
        Object.values(audioElements).forEach(audio => {
            audio.volume = volume;
        });
    });
}

function toggleSound(soundType) {
    const audio = audioElements[soundType];
    const button = document.querySelector(`button[onclick="toggleSound('${soundType}')"]`);
    
    if (audio.paused) {
        // Stop other sounds
        Object.values(audioElements).forEach(a => a.pause());
        document.querySelectorAll('.sound-btn').forEach(btn => btn.classList.remove('active'));
        
        // Play selected sound
        audio.play();
        button.classList.add('active');
    } else {
        audio.pause();
        button.classList.remove('active');
    }
}

function stopAllAudio() {
    Object.values(audioElements).forEach(audio => audio.pause());
    document.querySelectorAll('.sound-btn').forEach(btn => btn.classList.remove('active'));
}

// Video call initialization (placeholder)
async function initializeVideoCall() {
    try {
        // Get user media
        localStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        });

        // Display local video
        const videoGrid = document.getElementById('videoGrid');
        const localVideo = document.createElement('video');
        localVideo.id = 'localVideo';
        localVideo.autoplay = true;
        localVideo.muted = true;
        localVideo.srcObject = localStream;
        
        const localVideoContainer = document.createElement('div');
        localVideoContainer.className = 'video-container';
        localVideoContainer.appendChild(localVideo);
        videoGrid.appendChild(localVideoContainer);

        // Initialize WebSocket connection for signaling
        initializeSignaling();

    } catch (error) {
        console.error('Error accessing media devices:', error);
        alert('Failed to access camera and microphone. Please check your permissions.');
    }
}

// Signaling server connection (replace with your WebSocket server URL)
function initializeSignaling() {
    const ws = new WebSocket('wss://your-signaling-server.com');

    ws.onopen = () => {
        console.log('Connected to signaling server');
    };

    ws.onmessage = async (event) => {
        const message = JSON.parse(event.data);
        
        switch (message.type) {
            case 'user-joined':
                handleUserJoined(message.userId);
                break;
            case 'user-left':
                handleUserLeft(message.userId);
                break;
            case 'offer':
                handleOffer(message);
                break;
            case 'answer':
                handleAnswer(message);
                break;
            case 'ice-candidate':
                handleIceCandidate(message);
                break;
        }
    };

    ws.onerror = (error) => {
        console.error('WebSocket error:', error);
    };

    return ws;
}

// Handle new user joining
async function handleUserJoined(userId) {
    if (roomParticipants.has(userId)) return;
    roomParticipants.add(userId);

    // Create peer connection
    const peerConnection = new RTCPeerConnection(configuration);
    peerConnections[userId] = peerConnection;

    // Add local stream
    localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream);
    });

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            sendToPeer(userId, {
                type: 'ice-candidate',
                candidate: event.candidate
            });
        }
    };

    // Handle remote stream
    peerConnection.ontrack = (event) => {
        if (!document.getElementById(`video-${userId}`)) {
            const remoteVideo = document.createElement('video');
            remoteVideo.id = `video-${userId}`;
            remoteVideo.autoplay = true;
            remoteVideo.srcObject = event.streams[0];

            const remoteVideoContainer = document.createElement('div');
            remoteVideoContainer.className = 'video-container';
            remoteVideoContainer.appendChild(remoteVideo);
            document.getElementById('videoGrid').appendChild(remoteVideoContainer);
        }
    };

    // Create and send offer
    try {
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        sendToPeer(userId, {
            type: 'offer',
            offer: offer
        });
    } catch (error) {
        console.error('Error creating offer:', error);
    }
}

// Handle user leaving
function handleUserLeft(userId) {
    if (peerConnections[userId]) {
        peerConnections[userId].close();
        delete peerConnections[userId];
    }
    
    const remoteVideo = document.getElementById(`video-${userId}`);
    if (remoteVideo) {
        remoteVideo.parentElement.remove();
    }
    
    roomParticipants.delete(userId);
}

// Handle received offer
async function handleOffer(message) {
    const peerConnection = new RTCPeerConnection(configuration);
    peerConnections[message.userId] = peerConnection;

    // Add local stream
    localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream);
    });

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            sendToPeer(message.userId, {
                type: 'ice-candidate',
                candidate: event.candidate
            });
        }
    };

    // Handle remote stream
    peerConnection.ontrack = (event) => {
        if (!document.getElementById(`video-${message.userId}`)) {
            const remoteVideo = document.createElement('video');
            remoteVideo.id = `video-${message.userId}`;
            remoteVideo.autoplay = true;
            remoteVideo.srcObject = event.streams[0];

            const remoteVideoContainer = document.createElement('div');
            remoteVideoContainer.className = 'video-container';
            remoteVideoContainer.appendChild(remoteVideo);
            document.getElementById('videoGrid').appendChild(remoteVideoContainer);
        }
    };

    // Set remote description and create answer
    try {
        await peerConnection.setRemoteDescription(message.offer);
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        sendToPeer(message.userId, {
            type: 'answer',
            answer: answer
        });
    } catch (error) {
        console.error('Error handling offer:', error);
    }
}

// Handle received answer
async function handleAnswer(message) {
    try {
        const peerConnection = peerConnections[message.userId];
        await peerConnection.setRemoteDescription(message.answer);
    } catch (error) {
        console.error('Error handling answer:', error);
    }
}

// Handle received ICE candidate
async function handleIceCandidate(message) {
    try {
        const peerConnection = peerConnections[message.userId];
        await peerConnection.addIceCandidate(message.candidate);
    } catch (error) {
        console.error('Error handling ICE candidate:', error);
    }
}

// Send message to peer through signaling server
function sendToPeer(userId, data) {
    // Implement your signaling server send logic here
    console.log('Sending to peer:', userId, data);
}

// Close modal when clicking outside
window.onclick = (event) => {
    if (event.target === createRoomModal) {
        closeCreateRoomModal();
    }
};

// Show success message
function showSuccess(message) {
    const toast = document.createElement('div');
    toast.className = 'toast success';
    toast.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// Show error message
function showError(message) {
    const toast = document.createElement('div');
    toast.className = 'toast error';
    toast.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        <span>${message}</span>
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
} 