import express from "express";
import pool from "./db.js";
import crypto from "crypto";
import { sendEmail } from "./email.js";

const router = express.Router();

router.post("/request-reset", async (req, res) => {
  try {
    const { email } = req.body;

    const result = await pool.query("SELECT id FROM users WHERE email = $1", [
      email,
    ]);

    if (result.rows.length === 0) {
      return res.json({
        message: "If that email exists, a reset link was sent",
      });
    }

    const userId = result.rows[0].id;

    const token = crypto.randomBytes(48).toString("hex");

    await pool.query(
      `INSERT INTO password_resets (user_id, token, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '1 hour')`,
      [userId, token],
    );

    // Send email:
    // https://drewhyatt.us/auth/reset-password?token=TOKEN
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

    return res.json({ message: "If that email exists, a reset link was sent" });
  } catch (err) {
    console.error("Request reset error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
