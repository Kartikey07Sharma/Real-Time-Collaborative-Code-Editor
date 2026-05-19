const {
  createRoomIfNotExists,
  getFiles,
  updateFile,
  createFile,
  deleteFile
} = require('./dbService');

const { verifyToken } = require('./utils/jwt');

module.exports = (server) => {

  const io = require('socket.io')(server, {
    connectionStateRecovery: {}
  });

  io.on('connection', (socket) => {
    console.log('Client connected');

    // ================= JOIN =================
    socket.on('join', async ({ roomId, token }) => {
      try {
        if (!roomId || !token) {
          socket.emit('error-message', { message: 'Room ID and token required' });
          return;
        }

        let user;
        try {
          user = verifyToken(token);
        } catch {
          socket.emit('error-message', { message: 'Invalid token' });
          return;
        }

        socket.username = user.username;
        socket.role = user.role || "editor"; // 🔥 default role
        socket.roomId = roomId;

        socket.join(roomId);

        await createRoomIfNotExists(roomId);

        const files = await getFiles(roomId);
        socket.emit('file-list', { files });

        updateClientsList(roomId);

      } catch (err) {
        console.error('JOIN ERROR:', err);
      }
    });

    // ================= CREATE FILE =================
    socket.on('create-file', async ({ roomId, filename, language }) => {
      try {

        if (!roomId || !filename) return;

        // 🔥 allow editor also
        if (!['admin', 'editor'].includes(socket.role)) {
          socket.emit('error-message', { message: 'Permission denied' });
          return;
        }

        await createFile(roomId, filename, language);

        const files = await getFiles(roomId);
        io.to(roomId).emit('file-list', { files });

      } catch (err) {
        console.error('CREATE FILE ERROR:', err);
      }
    });

    // ================= CODE CHANGE =================
    socket.on('code-change', async ({ roomId, filename, code, version }) => {
      try {

        if (!roomId || !filename) return;

        if (!['admin', 'editor'].includes(socket.role)) {
          socket.emit('error-message', { message: 'Read-only access' });
          return;
        }

        socket.to(roomId).emit('code-change', {
          filename,
          code,
          version
        });

        await updateFile(roomId, filename, code, version);

      } catch (err) {
        console.error('CODE ERROR:', err);
      }
    });

    // ================= DELETE FILE =================
    socket.on('delete-file', async ({ roomId, filename }) => {
      try {

        if (!roomId || !filename) return;

        // 🔥 allow editor also (or keep admin only if needed)
        await deleteFile(roomId, filename);

        const files = await getFiles(roomId);
        io.to(roomId).emit('file-list', { files });

      } catch (err) {
        console.error('DELETE ERROR:', err);
      }
    });

    // ================= GET FILES =================
    socket.on('get-files', async (roomId) => {
      const files = await getFiles(roomId);
      socket.emit('file-list', { files });
    });

    // ================= CHAT =================
    socket.on('chat-message', ({ roomId, message }) => {
      io.to(roomId).emit('chat-message', {
        username: socket.username,
        message
      });
    });

    // ================= DISCONNECT =================
    socket.on('disconnect', () => {
      if (socket.roomId) {
        socket.leave(socket.roomId);
        updateClientsList(socket.roomId);
      }
    });

    function updateClientsList(roomId) {
      const room = io.sockets.adapter.rooms.get(roomId);
      let clients = [];

      if (room) {
        for (let id of room) {
          const sock = io.sockets.sockets.get(id);
          if (sock && sock.username) {
            clients.push(sock.username);
          }
        }
      }

      io.to(roomId).emit('joined', { clients });
    }

  });
};