const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const os = require("os");

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: (origin, callback) => {
            const allowed = [
                "http://localhost:3005",
                "https://chat-app-ten-olive.vercel.app",
                "https://chat-app-wirv.onrender.com",
            ];

            if (!origin || allowed.includes(origin)) {
                return callback(null, true);
            }

            callback(new Error(`Origin not allowed: ${origin}`));
        },
        methods: ["GET", "POST"],
    },
});

const rooms = {
    Generale: { users: [] },
    Codding: { users: [] },
    Support: { users: [] },
    Entraide: { users: [] },
};

app.get("/rooms", (req, res) => {
    const list = Object.entries(rooms).map(([name, data]) => ({
        name,
        count: data.users.length,
    }));
    res.json(list);
});

io.on("connection", (socket) => {
    console.log(`✅ Connecté : ${socket.id}`);

    socket.emit("rooms_list", getRoomsList());

    socket.on("join_room", ({ username, room }) => {
        if (!rooms[room]) {
            rooms[room] = { users: [] };
        }

        socket.join(room);
        socket.currentRoom = room;
        socket.currentUsername = username;

        const alreadyInRoom = rooms[room].users.find(
            (u) => u.socketId === socket.id
        );

        if (!alreadyInRoom) {
            rooms[room].users.push({
                socketId: socket.id,
                username,
            });
        }

        console.log(
            `👤 ${username} → room "${room}" (${rooms[room].users.length} participants)`
        );

        io.to(room).emit("receive_message", {
            author: "Système",
            message: `${username} a rejoint la room 💬`,
            time: now(),
            system: true,
        });

        io.to(room).emit("room_users", rooms[room].users);
        io.emit("rooms_list", getRoomsList());
    });

    socket.on("create_room", ({ roomName }) => {
        const name = roomName.trim();

        if (!name || rooms[name]) return;

        rooms[name] = { users: [] };
        console.log(`🆕 Room créée : "${name}"`);
        io.emit("rooms_list", getRoomsList());
    });

    socket.on("send_message", (data) => {
        console.log(`💬 "${data.author}" → "${data.room}": ${data.message}`);
        io.to(data.room).emit("receive_message", data);
    });

    socket.on("leave_room", ({ username, room }) => {
        if (!room || !rooms[room]) return;

        socket.leave(room);

        rooms[room].users = rooms[room].users.filter(
            (u) => u.socketId !== socket.id
        );

        console.log(`🚪 ${username} a quitté "${room}"`);

        io.to(room).emit("receive_message", {
            author: "Système",
            message: `${username} a quitté la salle 👋`,
            time: now(),
            system: true,
        });

        io.to(room).emit("room_users", rooms[room].users);
        io.emit("rooms_list", getRoomsList());

        socket.currentRoom = null;
        socket.currentUsername = null;
    });

    socket.on("disconnect", () => {
        const room = socket.currentRoom;
        const username = socket.currentUsername;

        if (!room || !rooms[room]) return;

        rooms[room].users = rooms[room].users.filter(
            (u) => u.socketId !== socket.id
        );

        console.log(`❌ ${username} a quitté "${room}"`);

        io.to(room).emit("receive_message", {
            author: "Système",
            message: `${username} a quitté la room 👋`,
            time: now(),
            system: true,
        });

        io.to(room).emit("room_users", rooms[room].users);
        io.emit("rooms_list", getRoomsList());
    });
});

function now() {
    return new Date().toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
    });
}

function getRoomsList() {
    return Object.entries(rooms).map(([name, data]) => ({
        name,
        count: data.users.length,
    }));
}

function getLocalIP() {
    const interfaces = os.networkInterfaces();

    for (const iface of Object.values(interfaces)) {
        for (const alias of iface) {
            if (alias.family === "IPv4" && !alias.internal) {
                return alias.address;
            }
        }
    }

    return "localhost";
}

const PORT = process.env.PORT || 5000;
const localIP = getLocalIP();

server.listen(PORT, () => {
    console.log(`🚀 Serveur sur http://${localIP}:${PORT}`);
});