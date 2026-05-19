# Real-Time Collaborative Code Editor

A full-stack real-time collaborative coding platform that allows multiple developers to edit code together simultaneously from different locations using WebSockets and live synchronization.

Inspired by:
- Google Docs
- Replit
- VS Code Live Share

This project demonstrates:
- Real-time collaboration
- WebSocket communication
- Backend architecture
- Authentication systems
- Multi-user synchronization
- Persistent database storage

---

# 🚀 Features

## ✅ Real-Time Collaborative Editing
- Multiple users can edit code simultaneously
- Instant synchronization using Socket.IO
- Room-based collaboration

---

## ✅ JWT Authentication & Authorization
- Secure login/register system
- JWT-based authentication
- bcrypt password hashing
- Protected APIs
- Role-based authorization

---

## ✅ Multi-File Support
- Create files dynamically
- Delete files
- Switch between multiple files
- Dynamic language detection

---

## ✅ Persistent MySQL Storage
- Files stored permanently
- Rooms stored in database
- Version tracking support
- Code persistence after refresh/restart

---

## ✅ Real-Time Chat System
- Instant communication between collaborators
- Room-based messaging

---

## ✅ Monaco Editor Integration
- VS Code–like coding experience
- Syntax highlighting
- Multi-language support
- Dynamic editor models

---

## ✅ Presence Tracking
- Track connected collaborators
- Real-time room updates

---

## ✅ Browser-Based Code Execution
- Basic JavaScript execution support

---

# 🎯 Project Objective

The objective of this project was to build a real-time collaborative coding platform where multiple developers can work together on the same codebase simultaneously.

Traditional development workflows require developers to manually share code using Git repositories or messaging platforms. This project solves that problem by enabling:
- instant collaboration
- live synchronization
- shared coding environments
- real-time communication

The project was created to deeply understand:
- WebSockets
- distributed systems
- backend architecture
- authentication systems
- synchronization logic
- scalable collaborative application design

---

# 🧠 Why I Built This Project

Platforms like Google Docs, Replit, and VS Code Live Share already provide collaborative editing features. However, the main purpose of building this project was to understand and implement the complete backend architecture and synchronization logic behind such systems from scratch.

I wanted to learn:
- how real-time synchronization works internally
- how WebSockets manage live communication
- how collaborative systems handle multiple users
- how authentication and room management work
- how scalable real-time applications are designed

This project helped me gain strong practical experience in:
- real-time systems
- backend engineering
- distributed collaboration
- database persistence
- event-driven architecture

---

# 👨‍💻 My Role in the Project

In this project, I was responsible for designing and developing the complete backend architecture as well as integrating the frontend with the real-time collaboration system.

My responsibilities included:

- Implementing Socket.IO real-time communication
- Building REST APIs using Express.js
- Developing JWT authentication system
- Implementing role-based authorization
- Designing MySQL storage architecture
- Creating room-based collaboration system
- Integrating Monaco Editor
- Implementing file management system
- Building chat and presence features
- Managing synchronization logic
- Organizing modular backend architecture

---

# 🛠️ Tech Stack

## Frontend
- HTML5
- CSS3
- JavaScript (ES6 Modules)
- Monaco Editor

---

## Backend
- Node.js
- Express.js
- Socket.IO

---

## Database
- MySQL

---

## Authentication
- JWT (JSON Web Token)
- bcrypt.js

---

## Additional Libraries
- nanoid
- dotenv
- cors

---

# 🏗️ System Architecture

```text
                    ┌───────────────────┐
                    │     Frontend      │
                    │ HTML/CSS/JS       │
                    │ Monaco Editor     │
                    └─────────┬─────────┘
                              │
                    Socket.IO / REST APIs
                              │
          ┌───────────────────┴───────────────────┐
          │                                       │
┌─────────▼─────────┐                 ┌──────────▼──────────┐
│   Express Server  │                 │   Socket.IO Server  │
│   REST APIs       │                 │ Real-Time Sync      │
│ Authentication    │                 │ Chat System         │
└─────────┬─────────┘                 └──────────┬──────────┘
          │                                      │
          └──────────────────┬───────────────────┘
                             │
                    ┌────────▼────────┐
                    │     MySQL DB    │
                    │ Users / Rooms   │
                    │ Files / Code    │
                    └─────────────────┘
```

---

# 📂 Project Structure

```text
project-root/
│
├── backend/
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── fileRoutes.js
│   │
│   ├── authController.js
│   ├── authMiddleware.js
│   ├── db.js
│   ├── dbService.js
│   ├── socketHandler.js
│   ├── jwt.js
│   ├── merge.js
│   └── server.js
│
├── frontend/
│   ├── js/
│   │   ├── main.js
│   │   ├── editor.js
│   │   ├── socket.js
│   │   ├── chat.js
│   │   └── fileManager.js
│   │
│   ├── app.html
│   ├── index.html
│   └── styles.css
│
└── README.md
```

---

# 🔐 Authentication Flow

## Step 1 — Register
User sends:
```http
POST /api/auth/register
```

Password is hashed using bcrypt before storing in MySQL.

---

## Step 2 — Login
User sends:
```http
POST /api/auth/login
```

Server:
- validates credentials
- generates JWT token
- returns token to client

---

## Step 3 — Authorization
Protected routes require:
```text
Authorization: Bearer <token>
```

JWT token is verified using middleware.

---

# ⚡ Real-Time Synchronization Flow

## Step 1 — User edits code
Monaco Editor detects content change.

↓

## Step 2 — Frontend emits socket event
```js
socket.emit("code-change")
```

↓

## Step 3 — Server receives update
Socket.IO backend processes update.

↓

## Step 4 — Broadcast to room
```js
socket.to(roomId).emit("code-change")
```

↓

## Step 5 — Other users receive updates
Editor updates instantly on all clients.

---

# 💾 Database Design

## Users Table
Stores:
- user ID
- username
- hashed password
- role

---

## Rooms Table
Stores:
- room ID
- room metadata

---

## Files Table
Stores:
- filename
- room ID
- code
- language
- version

---

# 📡 Socket Events

| Event | Description |
|---|---|
| join | Join collaboration room |
| code-change | Synchronize code |
| create-file | Create file |
| delete-file | Delete file |
| get-files | Fetch files |
| chat-message | Real-time messaging |
| disconnect | Handle disconnect |

---

# 🔄 Complete Data Flow

## 1. Room Joining Flow

```text
Client
   ↓
Send roomId + JWT token
   ↓
Socket.IO verifies token
   ↓
User joins room
   ↓
Server loads files from MySQL
   ↓
File list sent to all clients
```

---

## 2. Code Synchronization Flow

```text
User edits code
      ↓
Monaco detects change
      ↓
Socket emits code-change
      ↓
Server receives update
      ↓
Update stored in MySQL
      ↓
Broadcast update to room
      ↓
Other users update editor
```

---

## 3. File Management Flow

```text
Create/Delete File
        ↓
Socket event emitted
        ↓
Backend updates MySQL
        ↓
Updated file list broadcasted
        ↓
Frontend re-renders tabs
```

---

## 4. Chat System Flow

```text
User sends message
       ↓
Socket emits chat-message
       ↓
Server broadcasts message
       ↓
All room participants receive message
```

---

# 🔥 Key Backend Concepts Used

- WebSockets
- Event-driven architecture
- Real-time synchronization
- Middleware architecture
- JWT authentication
- Room-based communication
- Persistent storage
- Modular backend design

---

# ⚠️ Current Limitations

The project is fully functional but still under development for production-grade scalability.

Planned improvements:
- CRDT/Yjs synchronization
- Docker-based code execution
- Remote cursor tracking
- Redis scaling
- Cloud deployment
- Offline synchronization
- Operational transformation

---

# 🚀 Future Enhancements

- CRDT-based collaborative editing
- Multi-language code execution
- Docker sandboxing
- Remote cursor tracking
- Git integration
- Voice/video collaboration
- Redis Pub/Sub scaling
- Kubernetes deployment

---

# 🧪 Installation Guide

## Clone Repository

```bash
git clone <your-repository-url>
```

---

## Install Backend Dependencies

```bash
cd backend
npm install
```

---

## Create MySQL Database

```sql
CREATE DATABASE code_editor;
```

---

## Configure Environment Variables

Create `.env` file:

```env
PORT=8000
JWT_SECRET=your_secret_key
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=code_editor
```

---

## Start Backend Server

```bash
npm start
```

---

## Open Application

```text
http://localhost:8000
```

---

# 📚 Learning Outcomes

This project helped me understand:
- Real-time distributed systems
- WebSocket communication
- Backend architecture
- Authentication systems
- Database design
- Multi-user synchronization
- State management
- Scalable collaborative application design

---

# 👨‍💻 Author

Kartikey Sharma  
B.Tech Computer Science Engineering  
Full Stack & Real-Time Systems Developer

---

# ⭐ Support

If you like this project, give this repository a star ⭐
