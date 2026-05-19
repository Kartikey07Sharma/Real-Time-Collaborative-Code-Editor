const db = require('./db');

// ================= CREATE ROOM =================
function createRoomIfNotExists(roomId) {
  return new Promise((resolve, reject) => {

    db.query("SELECT * FROM rooms WHERE room_id = ?", [roomId], (err, res) => {
      if (err) return reject(err);

      if (res.length === 0) {

        db.query("INSERT INTO rooms (room_id) VALUES (?)", [roomId], (err) => {
          if (err) return reject(err);

          const defaultFiles = [
            ['index.html', '<h1>Hello world</h1>', 'html'],
            ['style.css', 'body{font-family:sans-serif;}', 'css'],
            ['script.js', 'console.log("hello");', 'javascript']
          ];

          defaultFiles.forEach(file => {
            db.query(
              "INSERT INTO files (room_id, filename, code, language, version) VALUES (?, ?, ?, ?, 0)",
              [roomId, file[0], file[1], file[2]]
            );
          });

          resolve();
        });

      } else {
        resolve();
      }
    });

  });
}

// ================= GET FILES =================
function getFiles(roomId) {
  return new Promise((resolve, reject) => {

    db.query("SELECT * FROM files WHERE room_id = ?", [roomId], (err, res) => {
      if (err) return reject(err);

      const files = {};

      res.forEach(f => {
        files[f.filename] = {
          code: f.code,
          language: f.language,
          version: f.version || 0
        };
      });

      resolve(files);
    });

  });
}

// ================= UPDATE FILE =================
function updateFile(roomId, filename, code, version) {
  return new Promise((resolve, reject) => {

    const newVersion = (version || 0) + 1;

    db.query(
      "UPDATE files SET code = ?, version = ? WHERE room_id = ? AND filename = ?",
      [code, newVersion, roomId, filename],
      (err) => {
        if (err) return reject(err);
        resolve(newVersion);
      }
    );

  });
}

// ================= CREATE FILE =================
function createFile(roomId, filename, language) {
  return new Promise((resolve, reject) => {

    db.query(
      "INSERT INTO files (room_id, filename, code, language, version) VALUES (?, ?, '', ?, 0)",
      [roomId, filename, language],
      (err) => {
        if (err) {
          // 🔥 Prevent crash on duplicate
          if (err.code === 'ER_DUP_ENTRY') {
            return resolve();
          }
          return reject(err);
        }
        resolve();
      }
    );

  });
}

// ================= DELETE FILE =================
function deleteFile(roomId, filename) {
  return new Promise((resolve, reject) => {

    db.query(
      "DELETE FROM files WHERE room_id = ? AND filename = ?",
      [roomId, filename],
      (err) => {
        if (err) return reject(err);
        resolve();
      }
    );

  });
}

module.exports = {
  createRoomIfNotExists,
  getFiles,
  updateFile,
  createFile,
  deleteFile
};