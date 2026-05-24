// src/routes/user.routes.js

const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const { verifyToken, authorizeRole } = require("../middlewares/auth");
const { validateRequired } = require("../middlewares/validate");

// Semua route user hanya bisa diakses ADMIN
router.use(verifyToken, authorizeRole("ADMIN"));

router.get("/",      userController.getAllUsers);
router.get("/:id",   userController.getUserById);
router.put("/:id",   userController.updateUser);
router.delete("/:id", userController.deleteUser);
router.put("/:id/reset-password", validateRequired(["passwordBaru"]), userController.resetPassword);

module.exports = router;
