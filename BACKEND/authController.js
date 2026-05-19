const db = require('./db');
const bcrypt = require('bcryptjs');
const { generateToken } = require('./utils/jwt');

// ================= REGISTER =================
exports.register = (req, res) => {
  try {
    const { username, password, role } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
    }

    // Default role = editor
    const userRole = role || "editor";

    const hashed = bcrypt.hashSync(password, 10);

    db.query(
      "INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
      [username, hashed, userRole],
      (err) => {
        if (err) {
          console.error("REGISTER ERROR:", err);
          return res.status(400).json({ error: "User already exists" });
        }

        res.json({
          message: "User registered successfully",
          role: userRole
        });
      }
    );

  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ error: "Registration failed" });
  }
};

// ================= LOGIN =================
exports.login = (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
    }

    db.query(
      "SELECT * FROM users WHERE username = ?",
      [username],
      (err, result) => {

        if (err) {
          console.error("LOGIN DB ERROR:", err);
          return res.status(500).json({ error: "Database error" });
        }

        if (!result || result.length === 0) {
          return res.status(400).json({ error: "User not found" });
        }

        const user = result[0];

        const isMatch = bcrypt.compareSync(password, user.password);

        if (!isMatch) {
          return res.status(400).json({ error: "Invalid password" });
        }

        // 🔥 Generate token with role
        const token = generateToken(user);

        res.json({
          message: "Login successful",
          token,
          user: {
            id: user.id,
            username: user.username,
            role: user.role
          }
        });
      }
    );

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ error: "Login failed" });
  }
};