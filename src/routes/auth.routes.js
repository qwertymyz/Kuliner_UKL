// src/routes/auth.routes.js

const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const { verifyToken, authorizeRole } = require("../middlewares/auth");
const { validateRequired } = require("../middlewares/validate");

// POST /api/auth/login — publik
router.post("/login", validateRequired(["username", "password"]), authController.login);

// POST /api/auth/register — hanya ADMIN
router.post(
  "/register",
  verifyToken,
  authorizeRole("ADMIN"),
  validateRequired(["nama", "username", "password"]),
  authController.register
);

// GET /api/auth/me — semua role yang sudah login
router.get("/me", verifyToken, authController.getMe);

// PUT /api/auth/change-password — semua role yang sudah login
router.put(
  "/change-password",
  verifyToken,
  validateRequired(["passwordLama", "passwordBaru"]),
  authController.changePassword
);

module.exports = router;
