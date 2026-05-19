const { verifyToken } = require('./utils/jwt');

module.exports = function (req, res, next) {

  try {
    const authHeader = req.headers.authorization;

    //  Check if header exists
    if (!authHeader) {
      return res.status(401).json({ error: "No token provided" });
    }

    //  Expect format: Bearer <token>
    const parts = authHeader.split(" ");

    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return res.status(401).json({ error: "Invalid token format" });
    }

    const token = parts[1];

    // Verify token
    const decoded = verifyToken(token);

    // Attach user to request
    req.user = decoded;

    next();

  } catch (err) {
    console.error("AUTH MIDDLEWARE ERROR:", err);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};