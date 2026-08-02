// src/authMiddleware.js
import jwt from "jsonwebtoken";
import pool from "./db.js";

export async function requireAuth(req, res, next) {
  try {
    const token = req.cookies.auth;

    if (!token) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "dev-secret"
    );

    // Load user from DB (critical!)
    const userResult = await pool.query(
      "SELECT id, email FROM users WHERE id = $1",
      [decoded.id]
    );

    if (userResult.rows.length === 0) {
      // User no longer exists (deleted)
      return res.status(401).json({ error: "Not authenticated" });
    }

    // Attach full user record
    req.user = userResult.rows[0];

    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
