// Importation de React et des outils de contexte
import React, { createContext, useContext } from "react";

// Importation du client Socket.io
import io from "socket.io-client";

// Création du contexte global pour partager le socket
const SocketContext = createContext(null);

// URL locale utilisée en développement sur la machine
const LOCAL_SOCKET_URL = "http://localhost:5000";

// URL de secours utilisée en production si aucune variable d’environnement n’est fournie
const RENDER_FALLBACK_URL = "https://chat-app-wirv.onrender.com";

// Lit l’URL définie dans les variables d’environnement React
const envUrl = (process.env.REACT_APP_SERVER_URL || "").trim();

// Vérifie si l’URL est encore une valeur exemple non remplacée
const isPlaceholderUrl = envUrl.includes("votre-app.railway.app");

// Vérifie si l’application tourne en local
const isLocalHost =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1");

// Choisit automatiquement l’URL du serveur socket
const DEFAULT_SOCKET_URL =
    !envUrl || isPlaceholderUrl
        ? isLocalHost
            ? LOCAL_SOCKET_URL
            : RENDER_FALLBACK_URL
        : envUrl;

// Création du socket partagé pour toute l’application
// autoConnect: false = la connexion se fait manuellement
const socket = io(DEFAULT_SOCKET_URL, { autoConnect: false });

// Provider qui rend le socket accessible à tous les composants enfants
export function SocketProvider({ children }) {
    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
}

// Hook personnalisé pour récupérer facilement le socket
export function useSocket() {
    return useContext(SocketContext);
}