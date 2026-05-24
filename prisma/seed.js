// prisma/seed.js
// Jalankan dengan: node prisma/seed.js

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Hapus data lama
  await prisma.itemPesanan.deleteMany();
  await prisma.pesanan.deleteMany();
  await prisma.menu.deleteMany();
  await prisma.user.deleteMany();

  // ─── Seed Users ─────────────────────────────────────────
  const hashedPassword = await bcrypt.hash("password123", 10);

  await prisma.user.createMany({
    data: [
      {
        nama: "Administrator",
        username: "admin",
        password: hashedPassword,
        role: "ADMIN",
      },
      {
        nama: "Kasir Satu",
        username: "kasir1",
        password: hashedPassword,
        role: "KASIR",
      },
    ],
  });

  console.log("✅ Users seeded:");
  console.log("   Admin  → username: admin    | password: password123");
  console.log("   Kasir  → username: kasir1   | password: password123");

  // ─── Seed Menu ──────────────────────────────────────────
  await prisma.menu.createMany({
    data: [
      { nama: "Nasi Goreng Spesial", kategori: "MAKANAN", harga: 25000 },
      { nama: "Mie Ayam Bakso",      kategori: "MAKANAN", harga: 18000 },
      { nama: "Ayam Bakar",          kategori: "MAKANAN", harga: 30000 },
      { nama: "Soto Ayam",           kategori: "MAKANAN", harga: 20000 },
      { nama: "Es Teh Manis",        kategori: "MINUMAN", harga: 5000  },
      { nama: "Es Jeruk",            kategori: "MINUMAN", harga: 7000  },
      { nama: "Jus Alpukat",         kategori: "MINUMAN", harga: 15000 },
      { nama: "Kentang Goreng",      kategori: "SNACK",   harga: 12000 },
      { nama: "Pisang Goreng",       kategori: "SNACK",   harga: 8000  },
    ],
  });

  console.log("✅ Menu seeded: 9 item");
  console.log("\n🎉 Seeding selesai!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
