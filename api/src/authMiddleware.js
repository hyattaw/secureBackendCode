// src/authMiddleware.js
import jwt from "jsonwebtoken";

export function requireAuth(req, res, next) {
  try {
    const token = req.cookies.auth;

    if (!token) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "dev-secret"
    );

    // Attach user info to request for downstream handlers
    req.user = decoded;

    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
