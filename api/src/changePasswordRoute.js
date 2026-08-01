import express from "express";
import pool from "./db.js";
import { verify, hash } from "@node-rs/argon2";
import { requireAuth } from "./authMiddleware.js";
import { sendEmail } from "./email.js";

const router = express.Router();

router.post("/change-password", requireAuth, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const result = await pool.query(
      "SELECT email, password_hash FROM users WHERE id = $1",
      [req.user.id],
    );

    const user = result.rows[0];

    const valid = await verify(user.password_hash, oldPassword);

    if (!valid) {
      return res.status(401).json({ error: "Old password incorrect" });
    }

    const newHash = await hash(newPassword);

    await pool.query("UPDATE users SET password_hash = $1 WHERE id = $2", [
      newHash,
      req.user.id,
    ]);

    await sendEmail({
      to: user.email,
      subject: "Your password was changed",
      html: `<p>Your password has been updated.</p>`,
    });

    return res.json({ message: "Password changed" });
  } catch (err) {
    console.error("Change password error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
