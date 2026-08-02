import express from "express";
import pool from "./db.js";
import { hash } from "@node-rs/argon2";

const router = express.Router();

/**
 * POST /reset-password
 * Implements:
 * - Invalid token detection
 * - Expired token detection
 * - Used token detection (reuse prevention)
 * - Cleanup of expired tokens
 * - Secure password update
 */
router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: "Missing token or newPassword" });
    }

    // Fetch token record WITHOUT deleting anything yet
    const result = await pool.query(
      `SELECT id, user_id, email, expires_at, used
       FROM password_resets
       WHERE token = $1`,
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: "Invalid reset token" });
    }

    const pr = result.rows[0];

    // Expired?
    if (new Date(pr.expires_at) < new Date()) {
      // Delete AFTER validation
      await pool.query("DELETE FROM password_resets WHERE id = $1", [pr.id]);
      return res.status(400).json({ error: "Reset token expired" });
    }

    // Used?
    if (pr.used) {
      return res.status(400).json({ error: "Reset token already used" });
    }

    // Hash new password
    const newHash = await hash(newPassword);

    // Update user password
    await pool.query(
      "UPDATE users SET password_hash = $1 WHERE id = $2",
      [newHash, pr.user_id]
    );

    // Mark token as used
    await pool.query(
      "UPDATE password_resets SET used = TRUE WHERE id = $1",
      [pr.id]
    );

    return res.json({ message: "Password updated" });

  } catch (err) {
    console.error("Reset password error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
