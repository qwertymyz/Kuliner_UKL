# Kuliner Frontend v2

Frontend aplikasi Sistem Kasir Kuliner menggunakan **Next.js 14** + **Tailwind CSS**.

## Prasyarat
- Node.js 18+
- Backend kuliner-backend-v2 sudah berjalan

## Cara Menjalankan

### 1. Install dependencies
```bash
cd kuliner-frontend-v2
npm install
```

### 2. Setup environment
```bash
cp .env.local.example .env.local
# Edit .env.local, sesuaikan URL backend
```

### 3. Jalankan dev server
```bash
npm run dev
```

Buka [http://localhost:3001](http://localhost:3001) di browser.

> **Tip:** Jalankan di port berbeda dari backend (default Next.js: 3000, pakai `PORT=3001 npm run dev` jika konflik).

---

## Struktur Folder

```
src/
├── app/
│   ├── (auth)/login/         # Halaman login
│   ├── (dashboard)/
│   │   ├── admin/            # Dashboard admin
│   │   │   ├── page.tsx      # Beranda admin (stats)
│   │   │   ├── users/        # Kelola user
│   │   │   ├── menu/         # Kelola menu
│   │   │   └── laporan/      # Laporan & statistik
│   │   └── kasir/
│   │       ├── transaksi/    # POS / buat transaksi
│   │       └── riwayat/      # Riwayat & update status
│   ├── layout.tsx            # Root layout
│   └── not-found.tsx         # Halaman 404
├── components/
│   ├── layout/               # DashboardLayout, AuthLayout
│   └── ui/                   # Komponen reusable (Modal, Spinner, dll)
├── context/
│   └── AuthContext.tsx       # Global auth state
├── lib/
│   ├── api.ts                # Axios instance
│   ├── utils.ts              # Helper functions
│   └── services/             # API service per resource
│       ├── authService.ts
│       ├── menuService.ts
│       ├── orderService.ts
│       ├── userService.ts
│       └── laporanService.ts
└── types/
    └── index.ts              # TypeScript types
```

## Halaman & Akses

| Halaman | Path | Akses |
|---------|------|-------|
| Login | `/login` | Semua |
| Dashboard Admin | `/admin` | ADMIN |
| Kelola User | `/admin/users` | ADMIN |
| Kelola Menu | `/admin/menu` | ADMIN |
| Laporan | `/admin/laporan` | ADMIN |
| Transaksi | `/kasir/transaksi` | KASIR |
| Riwayat | `/kasir/riwayat` | KASIR |

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Charts**: Recharts
- **Icons**: Lucide React
- **Toast**: React Hot Toast
- **Auth**: JWT via Cookie (js-cookie)
