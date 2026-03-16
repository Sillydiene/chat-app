import React, { useState } from "react";
import Join from "./components/Join";
import Chat from "./components/Chat";
import "./App.css";

function App() {
    const [username, setUsername] = useState("");
    const [room, setRoom] = useState("");
    const [connected, setConnected] = useState(false);

    return (
        <div className="App">
            {!connected ? (
                <Join
                    username={username}
                    setUsername={setUsername}
                    room={room}
                    setRoom={setRoom}
                    setConnected={setConnected}
                />
            ) : (
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

export default App;