// src/routes/menu.routes.js

const express = require("express");
const router = express.Router();
const menuController = require("../controllers/menu.controller");
const { verifyToken, authorizeRole } = require("../middlewares/auth");
const { validateRequired } = require("../middlewares/validate");

// Semua route menu butuh login
router.use(verifyToken);

// GET — boleh semua role
router.get("/",    menuController.getAllMenus);
router.get("/:id", menuController.getMenuById);

// POST, PUT, DELETE — hanya ADMIN
router.post("/",   authorizeRole("ADMIN"), validateRequired(["nama", "kategori", "harga"]), menuController.createMenu);
router.put("/:id", authorizeRole("ADMIN"), menuController.updateMenu);
router.delete("/:id", authorizeRole("ADMIN"), menuController.deleteMenu);

module.exports = router;
