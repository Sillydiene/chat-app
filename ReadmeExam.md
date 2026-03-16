# Question 1
## App.js, Chat.js, Message.js, Sidebar.js, Join.js, server.js, SocketContext.js

App.js est la racine du projet. Il gere l'etat principal
comme username, la room, et la connexion, puis affiche soit l'ecran de connexion (Join) ou soit l'interface de chat ( Chat)


Chat.js est le composant de chat. Il gère l’envoi et la réception des messages, la liste des utilisateurs connectés, l’affichage des messages et l’ouverture de la barre latérale des participants.

Message.js composant qui affiche un message

Sidebar.js Composant qui affiche la barre lateral contenant la liste des participants presents dans la room. Il montre aussi leur etat en ligne.

Join.js est composant de connexion. Il permet a l'utilisateur d'entrer son pseudo, de choisir une room ou d'en creer une nouvelle avent de rejoindre le chat

Server.js est le fichier server Node.js. Il gère les connexions des utilisateurs, les rooms, l’envoi des messages, la déconnexion et la diffusion des mises à jour en temps réel.

SocketContext.js est le fichier qui partage le socket dans toute l'application grace a Context React

# Question 2
1. Le socket est créé dans le fichier SocketContext.js en utilisant la bibliothèque socket.io-client. Le socket est ensuite partagé dans toute l’application grâce au React Context : const SocketContext = createContext(null); Le SocketProvider permet de fournir le socket à tous les composants React
2. Quand un utilisateur rejoint une room, le frontend envoie un evenement. Ensuite Cet événement est reçu côté serveur (server.js). Apres le serveur effectue plusieurs actions.
3. Lorsqu’un utilisateur envoie un message, le frontend émet un message. Le serveur reçoit cet événement socket.on("send_message", (data) =>. Puis il diffuse le message a tous les membres de la room. La difference entre emit et broadcast: emit envoie un message a tous utilisateurs cibles. Alors que broadcast envoie un message a tous les utilisateurs sauf celui qui l'a envoye.
4. 
