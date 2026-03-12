const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const cors = require('cors');
const path = require('path');
require('dotenv').config();

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// In-memory file store
const roomFiles = {};

io.on('connection', (socket) => {
  console.log('🟢 New client connected');

  socket.on('join', ({ roomId, username }) => {
    const room = io.sockets.adapter.rooms.get(roomId);
    const count = room ? room.size : 0;

    if (count >= 20) {
      socket.emit('room-full', { message: 'Room is full (20 users max)' });
      return;
    }

    socket.join(roomId);
    socket.username = username;
    socket.roomId = roomId;

    if (!roomFiles[roomId]) {
      roomFiles[roomId] = {
        'index.html': {
          language: 'html',
          code: '<h1>Hello world</h1>'
        },
        'style.css': {
          language: 'css',
          code: 'body{font-family:sans-serif;}'
        },
        'script.js': {
          language: 'javascript',
          code: 'console.log("hello");'
        }
      };
    }

    updateClientsList(roomId);
    socket.emit('file-list', { files: roomFiles[roomId] });
  });

  socket.on('create-file', ({ roomId, filename, language }) => {
    if (!roomFiles[roomId]) roomFiles[roomId] = {};
    roomFiles[roomId][filename] = { language, code: '' };
    io.to(roomId).emit('file-list', { files: roomFiles[roomId] });
  });

  socket.on('get-files', (roomId) => {
    socket.emit('file-list', { files: roomFiles[roomId] || {} });
  });

  socket.on('code-change', ({ roomId, filename, code }) => {
    if (roomFiles[roomId] && roomFiles[roomId][filename]) {
      roomFiles[roomId][filename].code = code;
    }
    socket.to(roomId).emit('code-change', { filename, code });
  });

  socket.on('delete-file', ({ roomId, filename }) => {
    if (roomFiles[roomId] && roomFiles[roomId][filename]) {
      delete roomFiles[roomId][filename];
      io.to(roomId).emit('file-list', { files: roomFiles[roomId] });
    }
  });

  socket.on('chat-message', ({ roomId, username, message }) => {
    io.to(roomId).emit('chat-message', { username, message });
  });

  socket.on('disconnect', () => {
    if (socket.roomId) {
      socket.leave(socket.roomId);
      updateClientsList(socket.roomId);
    }
  });

  function updateClientsList(roomId) {
    const room = io.sockets.adapter.rooms.get(roomId);
    const clients = room
      ? Array.from(room).map(id => io.sockets.sockets.get(id)?.username)
      : [];
    io.to(roomId).emit('joined', { clients });
  }
});

const PORT = process.env.PORT || 8000;

http.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});