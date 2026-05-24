// src/controllers/laporan.controller.js
// Hanya ADMIN yang bisa akses laporan

const prisma = require("../utils/prisma");
const { successResponse } = require("../utils/response");

// GET /api/laporan/harian?tanggal=YYYY-MM-DD
const laporanHarian = async (req, res, next) => {
  try {
    const tanggalStr = req.query.tanggal || new Date().toISOString().split("T")[0];
    const start = new Date(tanggalStr);
    const end = new Date(tanggalStr);
    end.setDate(end.getDate() + 1);

    const pesanans = await prisma.pesanan.findMany({
      where: { status: "SELESAI", createdAt: { gte: start, lt: end } },
      include: {
        itemPesanan: { include: { menu: true } },
        kasir: { select: { id: true, nama: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    const totalPendapatan = pesanans.reduce((sum, p) => sum + p.totalHarga, 0);

    const rekapMenu = {};
    pesanans.forEach((pesanan) => {
      pesanan.itemPesanan.forEach((item) => {
        const key = item.menu.nama;
        if (!rekapMenu[key]) rekapMenu[key] = { nama: key, jumlahTerjual: 0, totalPendapatan: 0 };
        rekapMenu[key].jumlahTerjual += item.jumlah;
        rekapMenu[key].totalPendapatan += item.hargaSaat * item.jumlah;
      });
    });

    return successResponse(res, {
      tanggal: tanggalStr,
      totalTransaksi: pesanans.length,
      totalPendapatan,
      rekapMenu: Object.values(rekapMenu).sort((a, b) => b.jumlahTerjual - a.jumlahTerjual),
      daftarPesanan: pesanans,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/laporan/bulanan?tahun=2024&bulan=6
const laporanBulanan = async (req, res, next) => {
  try {
    const now = new Date();
    const tahun = parseInt(req.query.tahun) || now.getFullYear();
    const bulan = parseInt(req.query.bulan) || now.getMonth() + 1;

    const start = new Date(tahun, bulan - 1, 1);
    const end = new Date(tahun, bulan, 1);

    const pesanans = await prisma.pesanan.findMany({
      where: { status: "SELESAI", createdAt: { gte: start, lt: end } },
      include: { itemPesanan: { include: { menu: true } } },
    });

    const totalPendapatan = pesanans.reduce((sum, p) => sum + p.totalHarga, 0);

    const rekapHarian = {};
    pesanans.forEach((p) => {
      const tgl = p.createdAt.toISOString().split("T")[0];
      if (!rekapHarian[tgl]) rekapHarian[tgl] = { tanggal: tgl, totalTransaksi: 0, totalPendapatan: 0 };
      rekapHarian[tgl].totalTransaksi += 1;
      rekapHarian[tgl].totalPendapatan += p.totalHarga;
    });

    return successResponse(res, {
      periode: `${tahun}-${String(bulan).padStart(2, "0")}`,
      totalTransaksi: pesanans.length,
      totalPendapatan,
      rekapHarian: Object.values(rekapHarian).sort((a, b) => a.tanggal.localeCompare(b.tanggal)),
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/laporan/menu-terlaris?limit=5
const menuTerlaris = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 5;

    const hasil = await prisma.itemPesanan.groupBy({
      by: ["menuId"],
      _sum: { jumlah: true },
      orderBy: { _sum: { jumlah: "desc" } },
      take: limit,
    });

    const menuIds = hasil.map((h) => h.menuId);
    const menus = await prisma.menu.findMany({ where: { id: { in: menuIds } } });
    const menuMap = Object.fromEntries(menus.map((m) => [m.id, m]));

    const data = hasil.map((h) => ({
      menu: menuMap[h.menuId],
      totalTerjual: h._sum.jumlah,
    }));

    return successResponse(res, data, `Top ${limit} menu terlaris`);
  } catch (err) {
    next(err);
  }
};

module.exports = { laporanHarian, laporanBulanan, menuTerlaris };
