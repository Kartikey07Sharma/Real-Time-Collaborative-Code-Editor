const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const socketHandler = require('./socketHandler');
const authRoutes = require('./routes/authRoutes');
const fileRoutes = require('./routes/fileRoutes');
const authMiddleware = require('./authMiddleware');

const app = express();
const server = http.createServer(app);

// ================= MIDDLEWARE =================

// 🔥 Better CORS config
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());

// 🔥 Debug middleware (VERY USEFUL)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// ================= STATIC FRONTEND =================
app.use(express.static(path.join(__dirname, '../frontend')));

// ================= ROUTES =================

// Auth routes
app.use('/api/auth', authRoutes);

// File API (protected)
app.use('/api/files', authMiddleware, fileRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'Server is running' });
});

// ================= 404 =================
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ================= GLOBAL ERROR =================
app.use((err, req, res, next) => {
  console.error('GLOBAL ERROR:', err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// ================= SOCKET =================
try {
  socketHandler(server);
} catch (err) {
  console.error('Socket initialization failed:', err);
}

// ================= START =================
const PORT = process.env.PORT || 8000;

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

// ================= PROCESS ERRORS =================
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION:', err);
});

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err);
});