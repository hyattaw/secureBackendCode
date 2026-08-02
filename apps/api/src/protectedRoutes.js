// src/protectedRoutes.js
import express from "express";
import { requireAuth } from "./authMiddleware.js";

const router = express.Router();

router.get("/me", requireAuth, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    return res.json({
      id: req.user.id,
      email: req.user.email
    });

  } catch (err) {
    console.error("Me route error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
