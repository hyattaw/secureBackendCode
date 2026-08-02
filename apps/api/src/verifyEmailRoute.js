import express from "express";
import pool from "./db.js";

const router = express.Router();

router.get("/verify", async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ error: "Missing token" });
    }

    const result = await pool.query(
      `UPDATE users
       SET email_verified = TRUE, email_verification_token = NULL
       WHERE email_verification_token = $1
       RETURNING id, email`,
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    return res.json({ message: "Email verified" });

  } catch (err) {
    console.error("Verify error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
