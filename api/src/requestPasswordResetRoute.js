import express from "express";
import pool from "./db.js";
import crypto from "crypto";
import { sendEmail } from "./email.js";

const router = express.Router();

/**
 * POST /request-reset
 * Implements:
 * - Silent success (no email enumeration)
 * - Rate limiting (5 requests per hour per email)
 * - Expiration (15 minutes)
 * - Cleanup of old rate-limit entries
 * - Secure token generation
 * - Stores BOTH user_id and email in password_resets
 * - Compatible with your test-auth.ps1
 */
router.post("/request-reset", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email required" });
    }

    // ---------------------------------------------------------------------
    // Rate limiting: 5 requests per hour per email
    // ---------------------------------------------------------------------

    // Cleanup old entries
    await pool.query(
      "DELETE FROM reset_rate_limits WHERE request_time < NOW() - INTERVAL '1 hour'"
    );

    // Count recent requests
    const rl = await pool.query(
      "SELECT COUNT(*) FROM reset_rate_limits WHERE email = $1",
      [email]
    );

    if (Number(rl.rows[0].count) >= 5) {
      return res.status(429).json({ error: "Too many reset requests" });
    }

    // Record this request
    await pool.query(
      "INSERT INTO reset_rate_limits (email) VALUES ($1)",
      [email]
    );

    // ---------------------------------------------------------------------
    // Look up user (but do not reveal existence)
    // ---------------------------------------------------------------------

    const userResult = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    const silentResponse = {
      message: "If that email exists, a reset link was sent"
    };

    if (userResult.rows.length === 0) {
      return res.json(silentResponse);
    }

    const userId = userResult.rows[0].id;

    // ---------------------------------------------------------------------
    // Create reset token
    // ---------------------------------------------------------------------

    const token = crypto.randomBytes(48).toString("hex");

    await pool.query(
      `INSERT INTO password_resets (user_id, email, token, expires_at, used)
       VALUES ($1, $2, $3, NOW() + INTERVAL '15 minutes', FALSE)`,
      [userId, email, token]
    );

    // ---------------------------------------------------------------------
    // Send reset email
    // ---------------------------------------------------------------------

    await sendEmail({
      to: email,
      subject: "Reset your password",
      html: `
        <p>You requested a password reset.</p>
        <a href="https://drewhyatt.us/auth/reset-password?token=${token}">
          Reset Password
        </a>
      `,
    });

    return res.json(silentResponse);

  } catch (err) {
    console.error("Request reset error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
