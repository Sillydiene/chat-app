// Importation de React
import React from "react";

// Composant qui affiche un seul message
function Message({ msg, username }) {
    // Vérifie si le message appartient à l’utilisateur courant
    const isOwn = msg.author === username;

    // Si c’est un message système (connexion, déconnexion, etc.)
    if (msg.system) {
        return (
            <div className="systemMessage">
                <span>{msg.message}</span>
            </div>
        );
    }

    return (
        // Classe différente selon si le message est à moi ou non
        <div className={`message ${isOwn ? "own" : "other"}`}>
            {/* Affiche l’auteur uniquement pour les messages des autres */}
            {!isOwn && <p className="author">{msg.author}</p>}

            {/* Texte du message */}
            <p className="messageText">{msg.message}</p>

            {/* Zone du bas : heure + indicateur lu */}
            <div className="messageMeta">
                <span className="messageTime">{msg.time}</span>

                {/* L’indicateur “Lu” est affiché seulement pour mes messages */}
                {isOwn && <span className="readIndicator">✓✓ Lu</span>}
            </div>
        </div>
    );
}

// Export du composant
export default Message;