// src/routes/laporan.routes.js

const express = require("express");
const router = express.Router();
const laporanController = require("../controllers/laporan.controller");
const { verifyToken, authorizeRole } = require("../middlewares/auth");

// Semua laporan hanya ADMIN
router.use(verifyToken, authorizeRole("ADMIN"));

router.get("/harian",        laporanController.laporanHarian);
router.get("/bulanan",       laporanController.laporanBulanan);
router.get("/menu-terlaris", laporanController.menuTerlaris);

module.exports = router;
