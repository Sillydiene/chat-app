// Importation de React et des hooks
import React, { useState, useEffect } from "react";

// Importation du socket partagé
import { useSocket } from "../context/SocketContext";

// Sidebar qui affiche les participants et l’activité récente
function Sidebar({ users, room, show, onClose }) {
    // Récupère le socket
    const socket = useSocket();

    // Historique local des 5 dernières activités
    const [activityLog, setActivityLog] = useState([]);

    // useEffect pour écouter les événements d’activité envoyés par le serveur
    useEffect(() => {
        const handleActivityLog = (data) => {
            // Construit une phrase lisible pour l’activité
            const message = `${data.username} ${data.action} #${data.room} à ${data.time}`;

            // Garde seulement les 5 derniers événements
            setActivityLog((prev) => [message, ...prev].slice(0, 5));
        };

        // Abonnement à l’événement
        socket.on("activity_log", handleActivityLog);

        // Nettoyage à la fermeture du composant
        return () => {
            socket.off("activity_log", handleActivityLog);
        };
    }, [socket]);

    return (
        <>
            {/* Fond sombre derrière la sidebar sur mobile */}
            {show && <div className="sidebarOverlay" onClick={onClose} />}

            {/* Sidebar ouverte ou fermée selon l’état */}
            <div className={`sidebar ${show ? "open" : ""}`}>
                <div className="sidebarHeader">
                    {/* Nom de la room actuelle */}
                    <h4>#{room}</h4>

                    {/* Bouton fermeture sidebar */}
                    <button className="closeSidebar" onClick={onClose}>
                        ✕
                    </button>
                </div>

                {/* Section participants */}
                <div className="sidebarSection">
                    <p className="sidebarLabel">
                        PARTICIPANTS ({users.length})
                    </p>

                    {users.length > 0 ? (
                        users.map((u) => (
                            <div className="userItem" key={u.socketId}>
                                {/* Avatar = première lettre du pseudo */}
                                <div className="userAvatar">
                                    {u.username.charAt(0).toUpperCase()}
                                </div>

                                {/* Nom de l’utilisateur */}
                                <span>{u.username}</span>

                                {/* Petit point vert = en ligne */}
                                <span className="onlineDot" />
                            </div>
                        ))
                    ) : (
                        <p className="noUsers">Aucun utilisateur</p>
                    )}
                </div>

                {/* Section activité récente */}
                <div className="sidebarSection">
                    <p className="sidebarLabel">ACTIVITÉ RÉCENTE</p>

                    {activityLog.length > 0 ? (
                        activityLog.map((log, index) => (
                            <div className="activityItem" key={index}>
                                {log}
                            </div>
                        ))
                    ) : (
                        <p className="noUsers">Aucune activité</p>
                    )}
                </div>
            </div>
        </>
    );
}

// Export du composant
export default Sidebar;