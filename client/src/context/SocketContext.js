// SocketContext.js
import React, { createContext, useContext } from "react";
import io from "socket.io-client";

const SocketContext = createContext(null);

// 🔹 URLs possibles (DEV)
const LOCAL_SOCKET_URLS = [
    "http://localhost:5000",      // PC
    "http://192.168.56.1:5000",   // téléphone sur le même Wi-Fi
];

// 🔹 URL FINALE (PROD > DEV)
const SOCKET_URL =
    process.env.REACT_APP_SERVER_URL || LOCAL_SOCKET_URLS[0];

// 🔑 Socket créé AU NIVEAU DU MODULE (bonne pratique ✔)
const socket = io(SOCKET_URL, {
    autoConnect: false,
});

// ────────────────
// PROVIDER
// ────────────────
export function SocketProvider({ children }) {
    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
}

// ────────────────
// HOOK
// ────────────────
export function useSocket() {
    return useContext(SocketContext);
}