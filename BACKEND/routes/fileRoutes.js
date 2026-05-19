const express = require('express');
const router = express.Router();

const {
  getFiles,
  createFile,
  updateFile,
  deleteFile
} = require('../dbService');

// ================= GET FILES =================
router.get('/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;

    const files = await getFiles(roomId);

    res.json({ files });

  } catch (err) {
    console.error('GET FILES API ERROR:', err);
    res.status(500).json({ error: 'Failed to fetch files' });
  }
});

// ================= CREATE FILE =================
router.post('/', async (req, res) => {
  try {
    const { roomId, filename, language } = req.body;

    if (!roomId || !filename) {
      return res.status(400).json({ error: 'Invalid data' });
    }

    await createFile(roomId, filename, language);

    res.json({ message: 'File created' });

  } catch (err) {
    console.error('CREATE FILE API ERROR:', err);
    res.status(500).json({ error: 'Failed to create file' });
  }
});

// ================= UPDATE FILE =================
router.put('/', async (req, res) => {
  try {
    const { roomId, filename, code, version } = req.body;

    if (!roomId || !filename) {
      return res.status(400).json({ error: 'Invalid data' });
    }

    await updateFile(roomId, filename, code, version);

    res.json({ message: 'File updated' });

  } catch (err) {
    console.error('UPDATE FILE API ERROR:', err);
    res.status(500).json({ error: 'Failed to update file' });
  }
});

// ================= DELETE FILE =================
router.delete('/', async (req, res) => {
  try {
    const { roomId, filename } = req.body;

    if (!roomId || !filename) {
      return res.status(400).json({ error: 'Invalid data' });
    }

    await deleteFile(roomId, filename);

    res.json({ message: 'File deleted' });

  } catch (err) {
    console.error('DELETE FILE API ERROR:', err);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

module.exports = router;