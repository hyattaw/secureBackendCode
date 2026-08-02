// src/logoutRoute.js
import express from "express";

const router = express.Router();

router.post("/logout", (req, res) => {
  // Clear the cookie by setting it to empty and expiring immediately
  const isProd = process.env.NODE_ENV === "production";
  res.clearCookie("auth", {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "strict" : "lax",
    path: "/",
  });

  return res.json({ message: "Logged out" });
});

export default router;
