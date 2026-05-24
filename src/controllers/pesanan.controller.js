// src/controllers/pesanan.controller.js

const prisma = require("../utils/prisma");
const { successResponse, errorResponse } = require("../utils/response");

const pesananInclude = {
  itemPesanan: { include: { menu: true } },
  kasir: { select: { id: true, nama: true, username: true } },
};

// GET /api/pesanan — ADMIN: semua pesanan | KASIR: pesanan miliknya
const getAllPesanan = async (req, res, next) => {
  try {
    const { status, tanggal } = req.query;
    const filter = {};

    // Kasir hanya bisa lihat pesanannya sendiri
    if (req.user.role === "KASIR") {
      filter.kasirId = req.user.id;
    }

    if (status) filter.status = status.toUpperCase();

    if (tanggal) {
      const start = new Date(tanggal);
      const end = new Date(tanggal);
      end.setDate(end.getDate() + 1);
      filter.createdAt = { gte: start, lt: end };
    }

    const pesanans = await prisma.pesanan.findMany({
      where: filter,
      include: pesananInclude,
      orderBy: { createdAt: "desc" },
    });
    return successResponse(res, pesanans, "Berhasil mengambil data pesanan");
  } catch (err) {
    next(err);
  }
};

// GET /api/pesanan/:id
const getPesananById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const pesanan = await prisma.pesanan.findUnique({ where: { id }, include: pesananInclude });
    if (!pesanan) return errorResponse(res, "Pesanan tidak ditemukan", 404);

    // Kasir hanya bisa lihat pesanannya sendiri
    if (req.user.role === "KASIR" && pesanan.kasirId !== req.user.id) {
      return errorResponse(res, "Akses ditolak.", 403);
    }

    return successResponse(res, pesanan);
  } catch (err) {
    next(err);
  }
};

// POST /api/pesanan — ADMIN & KASIR
const createPesanan = async (req, res, next) => {
  try {
    const { nomorMeja, namaPelanggan, metodeBayar, items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return errorResponse(res, "Items pesanan tidak boleh kosong", 400);
    }

    const menuIds = items.map((item) => item.menuId);
    const menus = await prisma.menu.findMany({
      where: { id: { in: menuIds }, tersedia: true },
    });

    if (menus.length !== menuIds.length) {
      return errorResponse(res, "Beberapa menu tidak ditemukan atau tidak tersedia", 400);
    }

    const menuMap = Object.fromEntries(menus.map((m) => [m.id, m]));
    let totalHarga = 0;

    const itemData = items.map((item) => {
      const menu = menuMap[item.menuId];
      const jumlah = parseInt(item.jumlah);

      if (!jumlah || jumlah <= 0) {
        throw Object.assign(new Error(`Jumlah untuk menu '${menu.nama}' tidak valid`), {
          statusCode: 400,
        });
      }

      totalHarga += menu.harga * jumlah;
      return { menuId: menu.id, jumlah, hargaSaat: menu.harga };
    });

    if (metodeBayar) {
      const validMetode = ["TUNAI", "QRIS", "TRANSFER", "KARTU"];
      if (!validMetode.includes(metodeBayar.toUpperCase())) {
        return errorResponse(res, `Metode bayar tidak valid. Pilih: ${validMetode.join(", ")}`, 400);
      }
    }

    const pesanan = await prisma.pesanan.create({
      data: {
        nomorMeja: nomorMeja ? parseInt(nomorMeja) : null,
        namaPelanggan: namaPelanggan || null,
        totalHarga,
        status: "PENDING",
        metodeBayar: metodeBayar ? metodeBayar.toUpperCase() : null,
        kasirId: req.user.id, // catat siapa yang buat pesanan
        itemPesanan: { create: itemData },
      },
      include: pesananInclude,
    });

    return successResponse(res, pesanan, "Pesanan berhasil dibuat", 201);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/pesanan/:id/status — ADMIN & KASIR
const updateStatusPesanan = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { status } = req.body;

    const validStatus = ["PENDING", "DIPROSES", "SELESAI", "DIBATALKAN"];
    if (!status || !validStatus.includes(status.toUpperCase())) {
      return errorResponse(res, `Status tidak valid. Pilih: ${validStatus.join(", ")}`, 400);
    }

    const existing = await prisma.pesanan.findUnique({ where: { id } });
    if (!existing) return errorResponse(res, "Pesanan tidak ditemukan", 404);

    // Kasir hanya bisa update pesanannya sendiri
    if (req.user.role === "KASIR" && existing.kasirId !== req.user.id) {
      return errorResponse(res, "Akses ditolak.", 403);
    }

    const pesanan = await prisma.pesanan.update({
      where: { id },
      data: { status: status.toUpperCase() },
      include: pesananInclude,
    });
    return successResponse(res, pesanan, "Status pesanan berhasil diperbarui");
  } catch (err) {
    next(err);
  }
};

// DELETE /api/pesanan/:id — hanya ADMIN
const deletePesanan = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const existing = await prisma.pesanan.findUnique({ where: { id } });
    if (!existing) return errorResponse(res, "Pesanan tidak ditemukan", 404);

    if (existing.status !== "PENDING") {
      return errorResponse(res, "Hanya pesanan PENDING yang bisa dihapus", 400);
    }

    await prisma.pesanan.delete({ where: { id } });
    return successResponse(res, null, "Pesanan berhasil dihapus");
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllPesanan, getPesananById, createPesanan, updateStatusPesanan, deletePesanan };
