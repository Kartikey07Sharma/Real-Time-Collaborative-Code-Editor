import { socket } from './socket.js';

export function initChat(roomIdRef, usernameRef){

  const sendBtn = document.getElementById("sendBtn");
  const chatInput = document.getElementById("chatInput");
  const chatArea = document.getElementById("chatArea");

  sendBtn.addEventListener("click", () => {

    const msg = chatInput.value.trim();
    if(!msg) return;

    socket.emit("chat-message", {
      roomId: roomIdRef(),
      username: usernameRef(),
      message: msg
    });

    chatInput.value = "";
  });

  socket.on("chat-message", ({username,message}) => {

    const msgDiv = document.createElement("div");
    msgDiv.innerHTML = `<strong>${username}:</strong> ${message}`;

    chatArea.appendChild(msgDiv);
  });
}