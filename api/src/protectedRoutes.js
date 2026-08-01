// src/protectedRoutes.js
import express from "express";
import { requireAuth } from "./authMiddleware.js";

const router = express.Router();

router.get("/me", requireAuth, (req, res) => {
  res.json({
    id: req.user.id,
    email: req.user.email,
    message: "You are authenticated"
  });
});

export default router;
