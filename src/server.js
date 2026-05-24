// src/server.js

require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes    = require("./routes/auth.routes");
const userRoutes    = require("./routes/user.routes");
const menuRoutes    = require("./routes/menu.routes");
const pesananRoutes = require("./routes/pesanan.routes");
const laporanRoutes = require("./routes/laporan.routes");
const errorHandler  = require("./middlewares/errorHandler");

const app  = express();
const PORT = process.env.PORT || 3000;

// ─── Middleware Global ─────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Health Check ──────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "🍽️  Kuliner Backend API v2 is running!",
    version: "2.0.0",
  });
});

// ─── Routes ───────────────────────────────────────────────
app.use("/api/auth",    authRoutes);
app.use("/api/users",   userRoutes);
app.use("/api/menus",   menuRoutes);
app.use("/api/pesanan", pesananRoutes);
app.use("/api/laporan", laporanRoutes);

// ─── 404 Handler ──────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.url} tidak ditemukan`,
    data: null,
  });
});

// ─── Global Error Handler ─────────────────────────────────
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅  Server berjalan di http://localhost:${PORT}`);
  console.log(`🔐  JWT aktif — expires in: ${process.env.JWT_EXPIRES_IN || "8h"}`);
  console.log(`📦  Environment: ${process.env.NODE_ENV || "development"}`);
});
