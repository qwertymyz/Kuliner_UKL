// src/routes/pesanan.routes.js

const express = require("express");
const router = express.Router();
const pesananController = require("../controllers/pesanan.controller");
const { verifyToken, authorizeRole } = require("../middlewares/auth");
const { validateRequired } = require("../middlewares/validate");

// Semua route pesanan butuh login
router.use(verifyToken);

// GET — ADMIN lihat semua, KASIR hanya miliknya (logic ada di controller)
router.get("/",    pesananController.getAllPesanan);
router.get("/:id", pesananController.getPesananById);

// POST — ADMIN & KASIR boleh buat pesanan
router.post("/", validateRequired(["items"]), pesananController.createPesanan);

// PATCH status — ADMIN & KASIR (kasir hanya pesanan miliknya)
router.patch("/:id/status", validateRequired(["status"]), pesananController.updateStatusPesanan);

// DELETE — hanya ADMIN
router.delete("/:id", authorizeRole("ADMIN"), pesananController.deletePesanan);

module.exports = router;
