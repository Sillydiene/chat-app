// Exemple complet de server/index.js après modifications
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';
const PORT = process.env.PORT || 5000;

const io = new Server(server, {
    cors: {
        origin: CLIENT_URL,
        methods: ["GET", "POST"],
        credentials: true
    }
});

// ... vos événements Socket.IO
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    // join, message, sidebar, etc.
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});