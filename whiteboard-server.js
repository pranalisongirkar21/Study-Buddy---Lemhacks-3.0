const WebSocket = require('ws');
const http = require('http');
const express = require('express');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Store active rooms and their participants
const rooms = new Map();

wss.on('connection', (ws) => {
    let currentRoom = null;
    let userId = null;

    ws.on('message', (message) => {
        const data = JSON.parse(message);
        
        switch (data.type) {
            case 'join-room':
                handleJoinRoom(ws, data);
                currentRoom = data.roomId;
                userId = data.userId;
                break;
                
            case 'leave-room':
                handleLeaveRoom(currentRoom, userId);
                break;
                
            case 'whiteboard-draw':
                broadcastToRoom(currentRoom, {
                    type: 'whiteboard-draw',
                    points: data.points,
                    color: data.color,
                    lineWidth: data.lineWidth,
                    userId: userId
                });
                break;
                
            case 'whiteboard-clear':
                broadcastToRoom(currentRoom, {
                    type: 'whiteboard-clear',
                    userId: userId
                });
                break;
        }
    });

    ws.on('close', () => {
        if (currentRoom && userId) {
            handleLeaveRoom(currentRoom, userId);
        }
    });
});

function handleJoinRoom(ws, data) {
    const { roomId, userId } = data;
    
    if (!rooms.has(roomId)) {
        rooms.set(roomId, new Map());
    }
    
    const room = rooms.get(roomId);
    room.set(userId, ws);
    
    // Notify others in the room
    broadcastToRoom(roomId, {
        type: 'user-joined',
        userId: userId
    });
}

function handleLeaveRoom(roomId, userId) {
    if (!rooms.has(roomId)) return;
    
    const room = rooms.get(roomId);
    room.delete(userId);
    
    // Remove room if empty
    if (room.size === 0) {
        rooms.delete(roomId);
    } else {
        // Notify others in the room
        broadcastToRoom(roomId, {
            type: 'user-left',
            userId: userId
        });
    }
}

function broadcastToRoom(roomId, message) {
    if (!rooms.has(roomId)) return;
    
    const room = rooms.get(roomId);
    const messageStr = JSON.stringify(message);
    
    room.forEach((ws, userId) => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(messageStr);
        }
    });
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Whiteboard server running on port ${PORT}`);
}); 