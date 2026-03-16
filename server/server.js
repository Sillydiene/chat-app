// Importation d’Express pour créer le serveur HTTP
const express = require("express");

// Module HTTP natif de Node.js
const http = require("http");

// Middleware CORS pour autoriser le frontend à communiquer avec le backend
const cors = require("cors");

// Importation du serveur Socket.io
const { Server } = require("socket.io");

// Module os pour récupérer l’adresse IP locale
const os = require("os");

// Création de l’application Express
const app = express();

// Autorise les requêtes cross-origin
app.use(cors());

// Permet de lire les données JSON
app.use(express.json());

// Création du serveur HTTP à partir de l’application Express
const server = http.createServer(app);

// Création du serveur Socket.io avec configuration CORS
const io = new Server(server, {
    cors: {
        origin: (origin, callback) => {
            // Liste des origines autorisées
            const allowed = [
                "http://localhost:3005",
                "https://chat-app-ten-olive.vercel.app",
                "https://chat-app-wirv.onrender.com",
            ];

            // Si aucune origin ou si elle est autorisée, on accepte
            if (!origin || allowed.includes(origin)) {
                return callback(null, true);
            }

            // Sinon on refuse
            callback(new Error(`Origin not allowed: ${origin}`));
        },
        methods: ["GET", "POST"],
    },
});

// Définition des salles par défaut
// Chaque salle contient une liste d’utilisateurs et un mot de passe éventuel
const rooms = {
    Generale: { users: [], password: "" },
    Codding: { users: [], password: "" },
    Support: { users: [], password: "" },
    Entraide: { users: [], password: "" },
};

// Route REST simple pour récupérer la liste des salles
app.get("/rooms", (req, res) => {
    res.json(getRoomsList());
});

// Gestion des connexions Socket.io
io.on("connection", (socket) => {
    console.log(`✅ Connecté : ${socket.id}`);

    // Envoie immédiatement la liste des salles au client connecté
    socket.emit("rooms_list", getRoomsList());

    // Événement : rejoindre une salle
    socket.on("join_room", ({ username, room, password }) => {
        // Vérifie que la salle existe
        if (!rooms[room]) {
            socket.emit("join_error", {
                message: "Cette salle n'existe pas.",
            });
            return;
        }

        // Récupère le mot de passe de la salle
        const roomPassword = rooms[room].password || "";

        // Si la salle est protégée et que le mot de passe est mauvais
        if (roomPassword && roomPassword !== (password || "")) {
            socket.emit("join_error", {
                message: "Mot de passe incorrect.",
            });
            return;
        }

        // Fait rejoindre le socket à la salle
        socket.join(room);

        // Stocke les infos sur le socket courant
        socket.currentRoom = room;
        socket.currentUsername = username;

        // Vérifie si l’utilisateur n’est pas déjà dans la liste
        const alreadyInRoom = rooms[room].users.find(
            (u) => u.socketId === socket.id
        );

        // Ajoute l’utilisateur à la salle si nécessaire
        if (!alreadyInRoom) {
            rooms[room].users.push({
                socketId: socket.id,
                username,
            });
        }

        console.log(
            `👤 ${username} → room "${room}" (${rooms[room].users.length} participants)`
        );

        // Message système dans la salle
        io.to(room).emit("receive_message", {
            author: "Système",
            message: `${username} a rejoint la room 💬`,
            time: now(),
            system: true,
        });

        // Envoie la liste des utilisateurs de la salle
        io.to(room).emit("room_users", rooms[room].users);

        // Met à jour la liste globale des salles
        io.emit("rooms_list", getRoomsList());

        // Enregistre une activité récente pour tous les clients
        io.emit("activity_log", {
            username,
            action: "a rejoint",
            room,
            time: now(),
        });

        // Informe le client que la connexion a réussi
        socket.emit("join_success", { room });
    });

    // Événement : création d’une nouvelle salle
    socket.on("create_room", ({ roomName, password }) => {
        const name = roomName.trim();
        const safePassword = (password || "").trim();

        // Empêche création si nom vide ou déjà existant
        if (!name || rooms[name]) return;

        // Crée la nouvelle salle
        rooms[name] = {
            users: [],
            password: safePassword,
        };

        console.log(
            `🆕 Room créée : "${name}" ${
                safePassword ? "(protégée)" : "(publique)"
            }`
        );

        // Met à jour tous les clients
        io.emit("rooms_list", getRoomsList());
    });

    // Événement : envoi d’un message
    socket.on("send_message", (data) => {
        console.log(`💬 "${data.author}" → "${data.room}": ${data.message}`);

        // Diffuse le message à toute la room
        io.to(data.room).emit("receive_message", data);
    });

    // Événement : quitter volontairement la salle
    socket.on("leave_room", ({ username, room }) => {
        if (!room || !rooms[room]) return;

        // Retire le socket de la room Socket.io
        socket.leave(room);

        // Retire l’utilisateur de la liste locale des utilisateurs
        rooms[room].users = rooms[room].users.filter(
            (u) => u.socketId !== socket.id
        );

        console.log(`🚪 ${username} a quitté "${room}"`);

        // Envoie un message système dans la salle
        io.to(room).emit("receive_message", {
            author: "Système",
            message: `${username} a quitté la salle 👋`,
            time: now(),
            system: true,
        });

        // Met à jour la liste des utilisateurs
        io.to(room).emit("room_users", rooms[room].users);

        // Met à jour la liste des salles
        io.emit("rooms_list", getRoomsList());

        // Ajoute l’action à l’historique global
        io.emit("activity_log", {
            username,
            action: "a quitté",
            room,
            time: now(),
        });

        // Nettoie les infos du socket
        socket.currentRoom = null;
        socket.currentUsername = null;
    });

    // Événement : déconnexion brutale de l’utilisateur
    socket.on("disconnect", () => {
        const room = socket.currentRoom;
        const username = socket.currentUsername;

        // Si l’utilisateur n’était dans aucune salle, on arrête
        if (!room || !rooms[room]) return;

        // Le retire de la liste locale
        rooms[room].users = rooms[room].users.filter(
            (u) => u.socketId !== socket.id
        );

        console.log(`❌ ${username} a quitté "${room}"`);

        // Envoie un message système aux membres restants
        io.to(room).emit("receive_message", {
            author: "Système",
            message: `${username} a quitté la room 👋`,
            time: now(),
            system: true,
        });

        // Met à jour la liste des utilisateurs et des salles
        io.to(room).emit("room_users", rooms[room].users);
        io.emit("rooms_list", getRoomsList());

        // Ajoute l’événement dans l’activité récente
        io.emit("activity_log", {
            username,
            action: "a quitté",
            room,
            time: now(),
        });
    });
});

// Fonction utilitaire pour obtenir l’heure au format français
function now() {
    return new Date().toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
    });
}

// Retourne la liste des salles avec leur nombre d’utilisateurs
// et si elles sont protégées ou non
function getRoomsList() {
    return Object.entries(rooms).map(([name, data]) => ({
        name,
        count: data.users.length,
        hasPassword: !!data.password,
    }));
}

// Récupère l’adresse IP locale de la machine
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

// Port d’écoute du serveur
const PORT = process.env.PORT || 5000;

// Adresse IP locale affichée au démarrage
const localIP = getLocalIP();

// Lancement du serveur
server.listen(PORT, () => {
    console.log(`🚀 Serveur sur http://${localIP}:${PORT}`);
});