export const socket = io();

socket.on("connect", () => {
  console.log("Socket connected:", socket.id);
});