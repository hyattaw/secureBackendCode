// src/authRoutes.js
import express from "express";
import { hash } from "@node-rs/argon2";
import pool from "./db.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { sendEmail } from "./email.js";

const router = express.Router();

router.post("/signup", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    // Check if email already exists
    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [
      email,
    ]);

    if (existing.rows.length > 0) {
      return res.status(409).json({ error: "Email already registered" });
    }

    // Hash password
    const passwordHash = await hash(password);

    // Generate email verification token
    const verificationToken = crypto.randomBytes(48).toString("hex");

    // Create user
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, email_verification_token)
       VALUES ($1, $2, $3)
       RETURNING id, email`,
      [email, passwordHash, verificationToken],
    );

    const user = result.rows[0];

    // Create access token
    const accessToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || "dev-secret",
      { expiresIn: "1h" },
    );

    // Create refresh token
    const refreshToken = crypto.randomBytes(64).toString("hex");

    await pool.query(
      `INSERT INTO refresh_tokens (token, user_id, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '7 days')`,
      [refreshToken, user.id],
    );

    const isProd = process.env.NODE_ENV === "production";

    // Access token cookie
    res.cookie("auth", accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "strict" : "lax",
      maxAge: 3600 * 1000,
    });

    // Refresh token cookie
    res.cookie("refresh", refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "strict",
      path: "/auth/refresh",
      maxAge: 7 * 24 * 3600 * 1000,
    });

    // TODO: send verification email with link:
    // https://drewhyatt.us/auth/verify?token=verificationToken
    await sendEmail({
      to: email,
      subject: "Verify your email",
      html: `
        <p>Welcome!</p>
        <p>Click below to verify your email:</p>
        <a href="https://drewhyatt.us/auth/verify?token=${verificationToken}">
          Verify Email
        </a>
      `,
    });

    return res.json({
      id: user.id,
      email: user.email,
      message: "Signup successful — please verify your email",
    });
  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
