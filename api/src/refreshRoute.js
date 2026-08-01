// src/refreshRoute.js
import express from "express";
import jwt from "jsonwebtoken";
import pool from "./db.js";
import crypto from "crypto";

const router = express.Router();

router.post("/refresh", async (req, res) => {
  try {
    const refreshToken = req.cookies.refresh;

    if (!refreshToken) {
      return res.status(401).json({ error: "Missing refresh token" });
    }

    // Look up refresh token in DB
    const result = await pool.query(
      `SELECT id, user_id, expires_at, revoked
       FROM refresh_tokens
       WHERE token = $1`,
      [refreshToken]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid refresh token" });
    }

    const rt = result.rows[0];

    // Check expiration or revocation
    if (rt.revoked || new Date(rt.expires_at) < new Date()) {
      return res.status(401).json({ error: "Expired or revoked refresh token" });
    }

    // ROTATE refresh token (invalidate old one)
    await pool.query(
      `UPDATE refresh_tokens
       SET revoked = TRUE
       WHERE id = $1`,
      [rt.id]
    );

    const newRefreshToken = crypto.randomBytes(64).toString("hex");

    await pool.query(
      `INSERT INTO refresh_tokens (token, user_id, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '7 days')`,
      [newRefreshToken, rt.user_id]
    );

    // Issue new access token
    const newAccessToken = jwt.sign(
      { id: rt.user_id },
      process.env.JWT_SECRET || "dev-secret",
      { expiresIn: "1h" }
    );

    const isProd = process.env.NODE_ENV === "production";

    // Set new access token cookie
    res.cookie("auth", newAccessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "strict" : "lax",
      maxAge: 3600 * 1000
    });

    // Set new refresh token cookie
    res.cookie("refresh", newRefreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "strict",
      path: "/auth/refresh",
      maxAge: 7 * 24 * 3600 * 1000
    });

    return res.json({ message: "Token refreshed" });

  } catch (err) {
    console.error("Refresh error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;