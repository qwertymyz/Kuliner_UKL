// src/middlewares/auth.js
// Middleware untuk verifikasi JWT dan otorisasi role

const jwt = require("jsonwebtoken");
const { errorResponse } = require("../utils/response");

// ─── Verifikasi token JWT ──────────────────────────────────
// Taruh di semua route yang butuh login
const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return errorResponse(res, "Token tidak ditemukan. Silakan login terlebih dahulu.", 401);
  }

  // Format header: "Bearer <token>"
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : authHeader;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, username, role }
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return errorResponse(res, "Token sudah kadaluarsa. Silakan login ulang.", 401);
    }
    return errorResponse(res, "Token tidak valid.", 401);
  }
};

// ─── Otorisasi berdasarkan role ────────────────────────────
// Contoh: authorizeRole("ADMIN") atau authorizeRole("ADMIN", "KASIR")
const authorizeRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, "Tidak terautentikasi.", 401);
    }
    if (!roles.includes(req.user.role)) {
      return errorResponse(
        res,
        `Akses ditolak. Hanya ${roles.join(" / ")} yang diizinkan.`,
        403
      );
    }
    next();
  };
};

module.exports = { verifyToken, authorizeRole };
