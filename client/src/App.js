// Importation de React et du hook useState
import React, { useState } from "react";

// Importation des composants principaux
import Join from "./components/Join";
import Chat from "./components/Chat";

// Importation du fichier CSS global
import "./App.css";

// Composant racine de l’application
function App() {
    // Nom d’utilisateur saisi
    const [username, setUsername] = useState("");

    // Salle sélectionnée
    const [room, setRoom] = useState("");

    // Indique si l’utilisateur est connecté à une salle ou non
    const [connected, setConnected] = useState(false);

    return (
        <div className="App">
            {/* Si l’utilisateur n’est pas connecté, on affiche Join */}
            {!connected ? (
                <Join
                    username={username}
                    setUsername={setUsername}
                    room={room}
                    setRoom={setRoom}
                    setConnected={setConnected}
                />
            ) : (
                // Sinon on affiche l’interface de chat
                <Chat
                    username={username}
                    room={room}
                    setConnected={setConnected}
                    setUsername={setUsername}
                    setRoom={setRoom}
                />
            )}
        </div>
    );
}

// Export du composant principal
export default App;