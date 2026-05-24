// src/controllers/user.controller.js
// Manajemen user — hanya bisa diakses ADMIN

const bcrypt = require("bcryptjs");
const prisma = require("../utils/prisma");
const { successResponse, errorResponse } = require("../utils/response");

const selectedFields = {
  id: true, nama: true, username: true,
  role: true, aktif: true, createdAt: true, updatedAt: true,
};

// GET /api/users
const getAllUsers = async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: selectedFields,
      orderBy: { createdAt: "desc" },
    });
    return successResponse(res, users, "Berhasil mengambil data user");
  } catch (err) {
    next(err);
  }
};

// GET /api/users/:id
const getUserById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const user = await prisma.user.findUnique({ where: { id }, select: selectedFields });
    if (!user) return errorResponse(res, "User tidak ditemukan", 404);
    return successResponse(res, user);
  } catch (err) {
    next(err);
  }
};

// PUT /api/users/:id — update nama, role, atau aktif
const updateUser = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { nama, role, aktif } = req.body;

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) return errorResponse(res, "User tidak ditemukan", 404);

    // Admin tidak bisa menonaktifkan dirinya sendiri
    if (id === req.user.id && aktif === false) {
      return errorResponse(res, "Tidak bisa menonaktifkan akun sendiri.", 400);
    }

    if (role) {
      const validRoles = ["ADMIN", "KASIR"];
      if (!validRoles.includes(role.toUpperCase())) {
        return errorResponse(res, `Role tidak valid. Pilih: ${validRoles.join(", ")}`, 400);
      }
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(nama && { nama }),
        ...(role && { role: role.toUpperCase() }),
        ...(aktif !== undefined && { aktif: Boolean(aktif) }),
      },
      select: selectedFields,
    });

    return successResponse(res, user, "User berhasil diperbarui");
  } catch (err) {
    next(err);
  }
};

// DELETE /api/users/:id
const deleteUser = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);

    if (id === req.user.id) {
      return errorResponse(res, "Tidak bisa menghapus akun sendiri.", 400);
    }

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) return errorResponse(res, "User tidak ditemukan", 404);

    await prisma.user.delete({ where: { id } });
    return successResponse(res, null, "User berhasil dihapus");
  } catch (err) {
    next(err);
  }
};

// PUT /api/users/:id/reset-password — admin reset password user lain
const resetPassword = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { passwordBaru } = req.body;

    if (!passwordBaru || passwordBaru.length < 6) {
      return errorResponse(res, "Password baru minimal 6 karakter.", 400);
    }

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) return errorResponse(res, "User tidak ditemukan", 404);

    const hashed = await bcrypt.hash(passwordBaru, 10);
    await prisma.user.update({ where: { id }, data: { password: hashed } });

    return successResponse(res, null, `Password user '${existing.username}' berhasil direset`);
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllUsers, getUserById, updateUser, deleteUser, resetPassword };
