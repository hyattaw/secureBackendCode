import express from "express";
import pool from "./db.js";
import { hash } from "@node-rs/argon2";

const router = express.Router();

router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const result = await pool.query(
      `SELECT id, user_id, expires_at, used
       FROM password_resets
       WHERE token = $1`,
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: "Invalid token" });
    }

    const pr = result.rows[0];

    if (pr.used || new Date(pr.expires_at) < new Date()) {
      return res.status(400).json({ error: "Expired or used token" });
    }

    const newHash = await hash(newPassword);

    await pool.query(
      "UPDATE users SET password_hash = $1 WHERE id = $2",
      [newHash, pr.user_id]
    );

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