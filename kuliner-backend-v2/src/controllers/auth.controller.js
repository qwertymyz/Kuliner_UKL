// src/controllers/auth.controller.js

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../utils/prisma");
const { successResponse, errorResponse } = require("../utils/response");

// ─── POST /api/auth/login ──────────────────────────────────
const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // Cari user by username
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      return errorResponse(res, "Username atau password salah.", 401);
    }

    // Cek apakah akun aktif
    if (!user.aktif) {
      return errorResponse(res, "Akun Anda telah dinonaktifkan. Hubungi admin.", 403);
    }

    // Verifikasi password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return errorResponse(res, "Username atau password salah.", 401);
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "8h" }
    );

    // Hapus password dari response
    const { password: _, ...userSafe } = user;

    return successResponse(res, { user: userSafe, token }, "Login berhasil");
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/auth/register (hanya ADMIN) ────────────────
const register = async (req, res, next) => {
  try {
    const { nama, username, password, role } = req.body;

    // Validasi role
    const validRoles = ["ADMIN", "KASIR"];
    const roleUpper = role ? role.toUpperCase() : "KASIR";
    if (!validRoles.includes(roleUpper)) {
      return errorResponse(res, `Role tidak valid. Pilih: ${validRoles.join(", ")}`, 400);
    }

    // Cek username sudah ada
    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) {
      return errorResponse(res, "Username sudah digunakan.", 409);
    }

    // Validasi panjang password
    if (password.length < 6) {
      return errorResponse(res, "Password minimal 6 karakter.", 400);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { nama, username, password: hashedPassword, role: roleUpper },
      select: { id: true, nama: true, username: true, role: true, aktif: true, createdAt: true },
    });

    return successResponse(res, user, "User berhasil dibuat", 201);
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/auth/me ──────────────────────────────────────
// Ambil data user yang sedang login
const getMe = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, nama: true, username: true, role: true, aktif: true, createdAt: true },
    });

    if (!user) return errorResponse(res, "User tidak ditemukan.", 404);

    return successResponse(res, user);
  } catch (err) {
    next(err);
  }
};

// ─── PUT /api/auth/change-password ────────────────────────
const changePassword = async (req, res, next) => {
  try {
    const { passwordLama, passwordBaru } = req.body;

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return errorResponse(res, "User tidak ditemukan.", 404);

    // Verifikasi password lama
    const isValid = await bcrypt.compare(passwordLama, user.password);
    if (!isValid) {
      return errorResponse(res, "Password lama tidak sesuai.", 400);
    }

    if (passwordBaru.length < 6) {
      return errorResponse(res, "Password baru minimal 6 karakter.", 400);
    }

    const hashed = await bcrypt.hash(passwordBaru, 10);
    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashed },
    });

    return successResponse(res, null, "Password berhasil diubah");
  } catch (err) {
    next(err);
  }
};

module.exports = { login, register, getMe, changePassword };
