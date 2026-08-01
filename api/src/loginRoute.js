import express from "express";
import { verify } from "@node-rs/argon2";
import pool from "./db.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    // Look up user
    const result = await pool.query(
      "SELECT id, email, password_hash FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = result.rows[0];

    // Verify password
    const valid = await verify(user.password_hash, password);

    if (!valid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Create access token
    const accessToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || "dev-secret",
      { expiresIn: "1h" }
    );

    // Create refresh token
    const refreshToken = crypto.randomBytes(64).toString("hex");

    await pool.query(
      `INSERT INTO refresh_tokens (token, user_id, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '7 days')`,
      [refreshToken, user.id]
    );

    const isProd = process.env.NODE_ENV === "production";

    // Access token cookie
    res.cookie("auth", accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "strict" : "lax",
      maxAge: 3600 * 1000
    });

    // Refresh token cookie
    res.cookie("refresh", refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "strict",
      path: "/auth/refresh",
      maxAge: 7 * 24 * 3600 * 1000
    });

    return res.json({
      id: user.id,
      email: user.email
    });

  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
