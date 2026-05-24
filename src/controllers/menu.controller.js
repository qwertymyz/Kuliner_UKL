// src/controllers/menu.controller.js

const prisma = require("../utils/prisma");
const { successResponse, errorResponse } = require("../utils/response");

// GET /api/menus — semua role bisa akses
const getAllMenus = async (req, res, next) => {
  try {
    const { kategori, tersedia } = req.query;
    const filter = {};
    if (kategori) filter.kategori = kategori.toUpperCase();
    if (tersedia !== undefined) filter.tersedia = tersedia === "true";

    const menus = await prisma.menu.findMany({
      where: filter,
      orderBy: { kategori: "asc" },
    });
    return successResponse(res, menus, "Berhasil mengambil data menu");
  } catch (err) {
    next(err);
  }
};

// GET /api/menus/:id
const getMenuById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const menu = await prisma.menu.findUnique({ where: { id } });
    if (!menu) return errorResponse(res, "Menu tidak ditemukan", 404);
    return successResponse(res, menu);
  } catch (err) {
    next(err);
  }
};

// POST /api/menus — hanya ADMIN
const createMenu = async (req, res, next) => {
  try {
    const { nama, kategori, harga, tersedia, gambarUrl } = req.body;

    const validKategori = ["MAKANAN", "MINUMAN", "SNACK"];
    if (!validKategori.includes(kategori?.toUpperCase())) {
      return errorResponse(res, `Kategori tidak valid. Pilih: ${validKategori.join(", ")}`, 400);
    }
    if (isNaN(harga) || parseInt(harga) <= 0) {
      return errorResponse(res, "Harga harus berupa angka positif", 400);
    }

    const menu = await prisma.menu.create({
      data: {
        nama,
        kategori: kategori.toUpperCase(),
        harga: parseInt(harga),
        tersedia: tersedia !== undefined ? Boolean(tersedia) : true,
        gambarUrl: gambarUrl || null,
      },
    });
    return successResponse(res, menu, "Menu berhasil ditambahkan", 201);
  } catch (err) {
    next(err);
  }
};

// PUT /api/menus/:id — hanya ADMIN
const updateMenu = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { nama, kategori, harga, tersedia, gambarUrl } = req.body;

    const existing = await prisma.menu.findUnique({ where: { id } });
    if (!existing) return errorResponse(res, "Menu tidak ditemukan", 404);

    if (kategori) {
      const validKategori = ["MAKANAN", "MINUMAN", "SNACK"];
      if (!validKategori.includes(kategori.toUpperCase())) {
        return errorResponse(res, `Kategori tidak valid. Pilih: ${validKategori.join(", ")}`, 400);
      }
    }

    const menu = await prisma.menu.update({
      where: { id },
      data: {
        ...(nama && { nama }),
        ...(kategori && { kategori: kategori.toUpperCase() }),
        ...(harga !== undefined && { harga: parseInt(harga) }),
        ...(tersedia !== undefined && { tersedia: Boolean(tersedia) }),
        ...(gambarUrl !== undefined && { gambarUrl }),
      },
    });
    return successResponse(res, menu, "Menu berhasil diperbarui");
  } catch (err) {
    next(err);
  }
};

// DELETE /api/menus/:id — hanya ADMIN
const deleteMenu = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const existing = await prisma.menu.findUnique({ where: { id } });
    if (!existing) return errorResponse(res, "Menu tidak ditemukan", 404);

    await prisma.menu.delete({ where: { id } });
    return successResponse(res, null, "Menu berhasil dihapus");
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllMenus, getMenuById, createMenu, updateMenu, deleteMenu };
