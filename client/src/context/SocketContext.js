import React, { createContext, useContext } from "react";
import io from "socket.io-client";

const SocketContext = createContext(null);

const LOCAL_SOCKET_URL = "http://localhost:5000";
const RENDER_FALLBACK_URL = "https://chat-app-wirv.onrender.com";

const envUrl = (process.env.REACT_APP_SERVER_URL || "").trim();
const isPlaceholderUrl = envUrl.includes("votre-app.railway.app");

const isLocalHost =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1");

const DEFAULT_SOCKET_URL =
    !envUrl || isPlaceholderUrl
        ? isLocalHost
            ? LOCAL_SOCKET_URL
            : RENDER_FALLBACK_URL
        : envUrl;

const socket = io(DEFAULT_SOCKET_URL, { autoConnect: false });

export function SocketProvider({ children }) {
    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
}

export function useSocket() {
    return useContext(SocketContext);
}