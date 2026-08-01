// src/deleteAccountRoute.js
import express from "express";
import pool from "./db.js";
import { requireAuth } from "./authMiddleware.js";

const router = express.Router();

router.delete("/delete", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Delete the user
    await pool.query("DELETE FROM users WHERE id = $1", [userId]);

    // Clear the auth cookie
    res.clearCookie("auth", {
      httpOnly: true,
      secure: false,      // true in production
      sameSite: "lax",
      path: "/"
    });

    return res.json({ message: "Account deleted" });
  } catch (err) {
    console.error("Delete account error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
