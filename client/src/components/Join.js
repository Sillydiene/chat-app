// Importation de React et des hooks
import React, { useState, useEffect } from "react";

// Importation du socket depuis le contexte
import { useSocket } from "../context/SocketContext";

// Composant d’entrée dans l’application
function Join({ username, setUsername, room, setRoom, setConnected }) {
    // Récupère le socket partagé
    const socket = useSocket();

    // Liste des salles disponibles
    const [roomsList, setRoomsList] = useState([]);

    // Nom de la nouvelle salle à créer
    const [newRoomName, setNewRoomName] = useState("");

    // Mot de passe optionnel pour la nouvelle salle
    const [newRoomPassword, setNewRoomPassword] = useState("");

    // Mot de passe saisi pour rejoindre une salle protégée
    const [roomPassword, setRoomPassword] = useState("");

    // Affiche ou cache le formulaire de création de salle
    const [showCreate, setShowCreate] = useState(false);

    // Message d’erreur si le mot de passe est incorrect ou autre
    const [joinError, setJoinError] = useState("");

    // useEffect pour recevoir la liste des rooms et les erreurs de connexion
    useEffect(() => {
        // Met à jour la liste des salles reçue du serveur
        const handleRoomsList = (list) => {
            setRoomsList(list);
        };

        // Met à jour le message d’erreur reçu du serveur
        const handleJoinError = (data) => {
            setJoinError(data.message);
        };

        // Si le socket n’est pas encore connecté, on le connecte
        if (!socket.connected) {
            socket.connect();
        }

        // Écoute des événements envoyés par le serveur
        socket.on("rooms_list", handleRoomsList);
        socket.on("join_error", handleJoinError);

        // Nettoyage des événements lors du démontage
        return () => {
            socket.off("rooms_list", handleRoomsList);
            socket.off("join_error", handleJoinError);
        };
    }, [socket]);

    // Recherche les infos de la salle actuellement sélectionnée
    const selectedRoomData = roomsList.find((r) => r.name === room);

    // Fonction pour rejoindre une salle
    const joinRoom = (selectedRoom) => {
        // Utilise la salle sélectionnée ou celle déjà stockée
        const roomToJoin = selectedRoom || room;

        // Empêche de rejoindre si le pseudo ou la salle sont vides
        if (!username.trim() || !roomToJoin.trim()) return;

        // Réinitialise l’erreur avant nouvelle tentative
        setJoinError("");

        // Fonction interne qui envoie la demande de connexion au serveur
        const doJoin = () => {
            socket.emit("join_room", {
                username: username.trim(),
                room: roomToJoin.trim(),
                password: roomPassword.trim(),
            });
        };

        // Si déjà connecté, envoie immédiatement
        if (socket.connected) {
            doJoin();
        } else {
            // Sinon, attend la connexion puis envoie
            socket.once("connect", doJoin);
            socket.connect();
        }
    };

    // useEffect pour gérer la réussite de connexion à une salle
    useEffect(() => {
        const handleJoinSuccess = ({ room }) => {
            // Met à jour la salle active
            setRoom(room);

            // Vide le champ du mot de passe après succès
            setRoomPassword("");

            // Passe à l’écran Chat
            setTimeout(() => setConnected(true), 80);
        };

        socket.on("join_success", handleJoinSuccess);

        return () => {
            socket.off("join_success", handleJoinSuccess);
        };
    }, [socket, setConnected, setRoom]);

    // Fonction pour créer une nouvelle salle
    const createRoom = () => {
        // Empêche création si le nom est vide
        if (!newRoomName.trim()) return;

        // Envoie au serveur le nom et le mot de passe éventuel
        socket.emit("create_room", {
            roomName: newRoomName.trim(),
            password: newRoomPassword.trim(),
        });

        // Réinitialise les champs du formulaire
        setNewRoomName("");
        setNewRoomPassword("");
        setShowCreate(false);
    };

    return (
        <div className="joinWrapper">
            <div className="joinContainer">
                {/* Logo de l’application */}
                <div className="joinLogo">
                    <svg
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        width="44"
                        height="44"
                    >
                        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.553 4.118 1.522 5.851L0 24l6.293-1.499A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm6.145 16.747c-.264.742-1.305 1.358-2.14 1.538-.57.122-1.315.22-3.822-.821-3.21-1.319-5.278-4.578-5.44-4.788-.155-.21-1.3-1.729-1.3-3.298 0-1.569.817-2.34 1.107-2.662.264-.289.578-.362.77-.362.19 0 .383.002.55.01.177.009.414-.067.648.494.243.578.824 2.008.895 2.153.072.145.12.314.024.504-.09.186-.135.3-.264.465-.13.165-.274.368-.39.494-.13.14-.266.291-.114.57.15.278.67 1.105 1.44 1.79 1 .895 1.838 1.174 2.115 1.304.278.13.44.108.603-.065.165-.173.695-.812.88-1.09.186-.278.37-.232.624-.14.254.093 1.614.761 1.89.9.278.138.463.208.531.324.067.116.067.672-.196 1.42z" />
                    </svg>
                </div>

                {/* Titre */}
                <h2>ChatApp</h2>
                <p className="joinSubtitle">
                    Entrez votre pseudo puis choisissez une room
                </p>

                {/* Champ pseudo */}
                <div className="inputGroup">
                    <label>Pseudo</label>
                    <input
                        type="text"
                        placeholder="Votre nom..."
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        maxLength={20}
                        autoFocus
                    />
                </div>

                {/* Section des salles */}
                <div className="roomsSection">
                    <div className="roomsSectionHeader">
                        <label>Choisir une room</label>

                        {/* Bouton pour afficher/cacher le formulaire de création */}
                        <button
                            className="createRoomToggle"
                            onClick={() => setShowCreate(!showCreate)}
                            title="Créer une nouvelle room"
                        >
                            {showCreate ? "✕ Annuler" : "+ Nouvelle room"}
                        </button>
                    </div>

                    {/* Formulaire de création de salle */}
                    {showCreate && (
                        <div className="createRoomBox">
                            <div className="createRoomForm">
                                <input
                                    type="text"
                                    placeholder="Nom de la nouvelle room..."
                                    value={newRoomName}
                                    onChange={(e) =>
                                        setNewRoomName(e.target.value)
                                    }
                                    maxLength={30}
                                />
                            </div>

                            <div className="createRoomForm">
                                <input
                                    type="password"
                                    placeholder="Mot de passe (optionnel)"
                                    value={newRoomPassword}
                                    onChange={(e) =>
                                        setNewRoomPassword(e.target.value)
                                    }
                                    maxLength={30}
                                    onKeyDown={(e) =>
                                        e.key === "Enter" && createRoom()
                                    }
                                />
                                <button
                                    onClick={createRoom}
                                    disabled={!newRoomName.trim()}
                                >
                                    Créer
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Liste des rooms */}
                    <div className="roomsGrid">
                        {roomsList.length === 0 ? (
                            <p className="loadingRooms">
                                Chargement des rooms...
                            </p>
                        ) : (
                            roomsList.map((r) => (
                                <button
                                    key={r.name}
                                    className={`roomCard ${
                                        room === r.name ? "selected" : ""
                                    }`}
                                    onClick={() => {
                                        // Sélectionne la salle
                                        setRoom(r.name);

                                        // Réinitialise les erreurs
                                        setJoinError("");

                                        // Si la salle n’a pas de mot de passe
                                        // et que le pseudo est rempli, on rejoint directement
                                        if (!r.hasPassword && username.trim()) {
                                            joinRoom(r.name);
                                        }
                                    }}
                                >
                                    {/* Avatar de la room */}
                                    <span className="roomCardAvatar">
                                        {r.name.charAt(0).toUpperCase()}
                                    </span>

                                    {/* Nom de la room */}
                                    <span className="roomCardName">
                                        #{r.name}
                                    </span>

                                    {/* Nombre de personnes dans la room */}
                                    <span className="roomCardCount">
                                        {r.count > 0 ? `${r.count} 🟢` : "vide"}
                                    </span>

                                    {/* Cadenas si room protégée */}
                                    {r.hasPassword && (
                                        <span className="lockBadge">🔒</span>
                                    )}
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Champ mot de passe si la salle choisie est protégée */}
                {selectedRoomData?.hasPassword && room && (
                    <div className="inputGroup">
                        <label>Mot de passe de la salle</label>
                        <input
                            type="password"
                            placeholder="Entrez le mot de passe..."
                            value={roomPassword}
                            onChange={(e) => setRoomPassword(e.target.value)}
                            maxLength={30}
                        />
                    </div>
                )}

                {/* Message d’erreur affiché si problème de connexion */}
                {joinError && <p className="joinError">{joinError}</p>}

                {/* Bouton rejoindre */}
                {room && username && (
                    <button className="joinBtn" onClick={() => joinRoom(room)}>
                        Rejoindre #{room} →
                    </button>
                )}
            </div>
        </div>
    );
}

// Export du composant
export default Join;