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


const getSummary = async (req, res, next) => {
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    // 1. Summary Stats
    const allFinished = await prisma.pesanan.findMany({
      where: { status: "SELESAI" },
      select: { totalHarga: true, createdAt: true }
    });

    const totalTransaksi = allFinished.length;
    const totalPendapatan = allFinished.reduce((sum, p) => sum + p.totalHarga, 0);

    const todayFinished = allFinished.filter(p => p.createdAt >= startOfToday && p.createdAt < endOfToday);
    const transaksiHariIni = todayFinished.length;
    const pendapatanHariIni = todayFinished.reduce((sum, p) => sum + p.totalHarga, 0);

    const summary = {
      totalTransaksi,
      totalPendapatan,
      transaksiHariIni,
      pendapatanHariIni
    };

    // 2. Daily Revenue (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    const startOfSevenDaysAgo = new Date(sevenDaysAgo.getFullYear(), sevenDaysAgo.getMonth(), sevenDaysAgo.getDate());

    const last7DaysFinished = await prisma.pesanan.findMany({
      where: { status: "SELESAI", createdAt: { gte: startOfSevenDaysAgo } },
      select: { totalHarga: true, createdAt: true }
    });

    const dailyRevenueMap = {};
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      dailyRevenueMap[dateStr] = { date: dateStr, total: 0, count: 0 };
    }

    last7DaysFinished.forEach(p => {
      const dateStr = p.createdAt.toISOString().split("T")[0];
      if (dailyRevenueMap[dateStr]) {
        dailyRevenueMap[dateStr].total += p.totalHarga;
        dailyRevenueMap[dateStr].count += 1;
      }
    });

    const dailyRevenue = Object.values(dailyRevenueMap).reverse();

    // 3. Category Sales
    const itemPesanans = await prisma.itemPesanan.findMany({
      where: { pesanan: { status: "SELESAI" } },
      include: { menu: true }
    });

    const categorySalesMap = {
      MAKANAN: { category: "MAKANAN", total: 0, count: 0 },
      MINUMAN: { category: "MINUMAN", total: 0, count: 0 },
      SNACK: { category: "SNACK", total: 0, count: 0 }
    };

    itemPesanans.forEach(item => {
      const cat = item.menu.kategori;
      if (categorySalesMap[cat]) {
        categorySalesMap[cat].total += item.hargaSaat * item.jumlah;
        categorySalesMap[cat].count += item.jumlah;
      }
    });

    const categorySales = Object.values(categorySalesMap);

    // 4. Top Menu Items
    const topItemsGrouping = await prisma.itemPesanan.groupBy({
      by: ["menuId"],
      _sum: { jumlah: true },
      orderBy: { _sum: { jumlah: "desc" } },
      take: 5
    });

    const menuIds = topItemsGrouping.map(t => t.menuId);
    const menus = await prisma.menu.findMany({ where: { id: { in: menuIds } } });
    const menuMap = Object.fromEntries(menus.map(m => [m.id, m]));

    const topItems = topItemsGrouping.map(t => {
      const menu = menuMap[t.menuId];
      const totalSold = t._sum.jumlah || 0;
      return {
        menuItemId: t.menuId,
        name: menu ? menu.nama : "",
        category: menu ? menu.kategori : "MAKANAN",
        totalSold,
        totalRevenue: (menu ? menu.harga : 0) * totalSold
      };
    });

    return successResponse(res, {
      summary,
      dailyRevenue,
      categorySales,
      topItems
    }, "Berhasil mengambil summary laporan");
  } catch (err) {
    next(err);
  }
};

module.exports = { laporanHarian, laporanBulanan, menuTerlaris, getSummary };

