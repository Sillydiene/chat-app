// Importation de React et des hooks nécessaires
import React, { useState, useEffect, useRef } from "react";

// Importation du socket partagé via le contexte
import { useSocket } from "../context/SocketContext";

// Importation des composants enfants
import Message from "./Message";
import Sidebar from "./Sidebar";

// Composant principal de la salle de chat
function Chat({ username, room, setConnected, setUsername, setRoom }) {
    // Récupère l'instance socket depuis le contexte
    const socket = useSocket();

    // Liste des messages affichés dans le chat
    const [messages, setMessages] = useState([]);

    // Contenu actuel du champ de saisie
    const [currentMessage, setCurrentMessage] = useState("");

    // Liste des utilisateurs connectés dans la salle
    const [users, setUsers] = useState([]);

    // État d’ouverture/fermeture de la sidebar
    const [showSidebar, setShowSidebar] = useState(false);

    // Référence vers le bas de la liste des messages pour faire l’auto-scroll
    const messagesEndRef = useRef(null);

    // useEffect pour écouter les événements Socket.io liés au chat
    useEffect(() => {
        // Quand un message est reçu, on l’ajoute à la liste
        const handleReceiveMessage = (messageData) => {
            setMessages((prev) => [...prev, messageData]);
        };

        // Quand la liste des utilisateurs change, on met à jour l’état
        const handleRoomUsers = (updatedUsers) => {
            setUsers(updatedUsers);
        };

        // Abonnement aux événements socket
        socket.on("receive_message", handleReceiveMessage);
        socket.on("room_users", handleRoomUsers);

        // Nettoyage lors du démontage du composant
        return () => {
            socket.off("receive_message", handleReceiveMessage);
            socket.off("room_users", handleRoomUsers);
        };
    }, [socket]);

    // useEffect pour scroller automatiquement vers le dernier message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Fonction pour envoyer un message
    const sendMessage = () => {
        // Empêche l’envoi d’un message vide
        if (!currentMessage.trim()) return;

        // Création de l’objet message à envoyer au serveur
        const messageData = {
            room, // salle de destination
            author: username, // auteur du message
            message: currentMessage.trim(), // texte du message
            time: new Date().toLocaleTimeString("fr-FR", {
                hour: "2-digit",
                minute: "2-digit",
            }), // heure d’envoi formatée
        };

        // Envoi du message au serveur via socket
        socket.emit("send_message", messageData);

        // Réinitialisation du champ de saisie
        setCurrentMessage("");
    };

    // Permet d’envoyer le message avec la touche Entrée
    const handleKeyDown = (e) => {
        // Si la touche Entrée est pressée sans Shift, on envoie
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    // Fonction pour quitter la salle
    const leaveRoom = () => {
        // Informe le serveur que l’utilisateur quitte la room
        socket.emit("leave_room", {
            username,
            room,
        });

        // Réinitialise l’application pour revenir à l’écran Join
        setConnected(false);
        setUsername("");
        setRoom("");
        setMessages([]);
        setUsers([]);
        setCurrentMessage("");
    };

    return (
        <div className="chatWrapper">
            {/* Sidebar avec liste des utilisateurs et activité récente */}
            <Sidebar
                users={users}
                room={room}
                show={showSidebar}
                onClose={() => setShowSidebar(false)}
            />

            <div className="chatMain">
                {/* En-tête du chat */}
                <div className="chatHeader">
                    {/* Bouton pour ouvrir/fermer la sidebar */}
                    <button
                        className="sidebarToggle"
                        onClick={() => setShowSidebar(!showSidebar)}
                        title="Voir les participants"
                    >
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>

                    {/* Informations sur la room */}
                    <div className="chatHeaderInfo">
                        {/* Avatar de la room = première lettre */}
                        <div className="chatHeaderAvatar">
                            {room.charAt(0).toUpperCase()}
                        </div>

                        <div>
                            {/* Nom de la room */}
                            <h3>#{room}</h3>

                            {/* Nombre de participants */}
                            <p>
                                {users.length} participant
                                {users.length > 1 ? "s" : ""}
                            </p>
                        </div>
                    </div>

                    {/* Bouton pour quitter la salle */}
                    <button
                        className="leaveBtn"
                        onClick={leaveRoom}
                        title="Quitter la salle"
                    >
                        Quitter la salle
                    </button>
                </div>

                {/* Zone d’affichage des messages */}
                <div className="messagesArea">
                    {/* Message affiché s’il n’y a encore aucun message */}
                    {messages.length === 0 && (
                        <div className="emptyChat">
                            <p>
                                Aucun message pour l'instant.
                                <br />
                                Soyez le premier à écrire ! 👋
                            </p>
                        </div>
                    )}

                    {/* Affichage de chaque message */}
                    {messages.map((msg, index) => (
                        <Message key={index} msg={msg} username={username} />
                    ))}

                    {/* Élément invisible utilisé pour l’auto-scroll */}
                    <div ref={messagesEndRef} />
                </div>

                {/* Zone de saisie du message */}
                <div className="inputArea">
                    <input
                        type="text"
                        placeholder="Écrire un message..."
                        value={currentMessage}
                        onChange={(e) => setCurrentMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        maxLength={500}
                    />
                    <button
                        className="sendBtn"
                        onClick={sendMessage}
                        disabled={!currentMessage.trim()}
                        title="Envoyer"
                    >
                        {/* Icône d’envoi */}
                        <svg
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            width="20"
                            height="20"
                        >
                            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}

// Export du composant
export default Chat;