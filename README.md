# 🍽️ Kuliner UKL System (Sistem Kasir Restoran)

Sistem Kasir Kuliner adalah aplikasi fullstack yang dikembangkan sebagai proyek Uji Kompetensi Keahlian (UKL). Sistem ini dirancang untuk memfasilitasi operasional restoran/kafe dengan dua hak akses utama:
* 👑 **ADMIN**: Mengelola data user (kasir), mengelola item menu makanan/minuman/snack, dan memantau laporan statistik transaksi penjualan.
* 💼 **KASIR**: Melakukan transaksi pesanan pelanggan, memperbarui status pesanan, dan mencatat riwayat transaksi.

---

## 📂 Struktur Project Workspace

```text
Kuliner-UKL/
├── kuliner-backend-v2/     # Folder Project Backend (Node.js + Express + Prisma)
│   ├── Kuliner-UKL.postman_collection.json # File uji coba API Postman
│   └── README.md           # Petunjuk detail instalasi & menjalankan backend
│
└── kuliner-frontend-v2/    # Folder Project Frontend (Rekomendasi Arsitektur React)
    ├── public/
    └── src/                # Kode sumber frontend
```

---

## ⚙️ 1. Setup & Menjalankan Backend

Untuk langkah-langkah detail penyiapan database, pengisian data awal (seeder), dan menjalankan server backend, silakan baca dokumentasi backend secara terpisah di:
👉 **[README Backend (kuliner-backend-v2)](file:///d:/SMK%20Telkom%20Sandhy%20Putra%20Malang/XI%20RPL1/Fullstack/Kuliner-UKL/kuliner-backend-v2/README.md)**

---

## 💻 2. Rekomendasi Struktur & Arsitektur Frontend

Jika Anda membangun bagian Frontend menggunakan **React.js + Vite + TailwindCSS**, berikut adalah rekomendasi struktur folder modular yang rapi, aman, dan mudah dikembangkan:

### 📂 Struktur Folder Frontend (`kuliner-frontend-v2`)
```text
kuliner-frontend-v2/
├── public/
│   └── logo.png            # Aset statis publik
├── src/
│   ├── assets/             # Gambar, ikon, ilustrasi lokal
│   ├── components/         # Komponen UI Reusable
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   ├── Modal.jsx       # Modal popup tambah/edit/hapus
│   │   ├── Navbar.jsx      # Header dengan info user & tombol logout
│   │   ├── Sidebar.jsx     # Navigasi samping yang dinamis sesuai Role
│   │   ├── Table.jsx       # Komponen tabel generic
│   │   └── ProtectedRoute.jsx # Pelindung halaman berdasarkan role (Route Guard)
│   │
│   ├── contexts/           # Global State Management
│   │   └── AuthContext.jsx # Menyimpan status login user, info profil, & fungsi logout
│   │
│   ├── services/           # Komunikasi API (HTTP Client)
│   │   └── api.js          # Konfigurasi Axios instance & interceptor JWT
│   │
│   ├── pages/              # View/Halaman Utama Aplikasi
│   │   ├── shared/         # Halaman umum
│   │   │   ├── Login.jsx   # Form Login (menyimpan token & redirect ke dashboard)
│   │   │   ├── NotFound.jsx # Halaman error 404
│   │   │   └── Forbidden.jsx # Halaman akses ditolak (403)
│   │   │
│   │   ├── admin/          # Halaman khusus ADMIN
│   │   │   ├── DashboardAdmin.jsx # Ringkasan cepat & pintasan
│   │   │   ├── UserManagement.jsx # CRUD Kasir
│   │   │   └── MenuManagement.jsx # CRUD Menu makanan/minuman/snack
│   │   │
│   │   └── kasir/          # Halaman khusus KASIR
│   │       ├── DashboardKasir.jsx # Info transaksi hari ini
│   │       ├── OrderTransaction.jsx # Menu transaksi (memilih menu, input jumlah, & checkout)
│   │       └── OrderHistory.jsx # Riwayat pesanan & tombol cetak struk (invoice)
│   │
│   ├── utils/              # Helper Utility Functions
│   │   ├── formatCurrency.js # Memformat angka ke Rupiah (Rp. 25.000)
│   │   └── formatDate.js     # Memformat timestamp ke format lokal Indonesia
│   │
│   ├── App.jsx             # Pengaturan Rute Aplikasi (React Router DOM)
│   ├── index.css           # Styling global & Tailwind directives
│   └── main.jsx            # Entry point aplikasi React
│
├── package.json            # Daftar dependensi frontend
├── tailwind.config.js      # Konfigurasi utility framework CSS
└── vite.config.js          # Konfigurasi build tools Vite
```

---

## 🔑 Implementasi Kunci Integrasi Frontend - Backend

### A. Konfigurasi Axios Client (`src/services/api.js`)
Gunakan Axios interceptor untuk menyisipkan header token JWT secara dinamis pada setiap request:
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api', // sesuaikan dengan port backend
});

// Interceptor untuk menyisipkan JWT token ke header request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor untuk menangani error global (misal: token kedaluwarsa)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Hapus token dan redirect ke login jika unauthorized
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### B. Route Guard / Pelindung Rute (`src/components/ProtectedRoute.jsx`)
Gunakan komponen wrapper untuk melindungi route agar tidak bisa diakses sembarang user:
```jsx
import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div>Memuat Halaman...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/forbidden" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
```

### C. Alur Penggunaan Rute (`src/App.jsx`)
Definisikan rute dengan mengelompokkannya berdasarkan otorisasi role:
```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/shared/Login';
import Forbidden from './pages/shared/Forbidden';

// Pages Admin
import DashboardAdmin from './pages/admin/DashboardAdmin';
import UserManagement from './pages/admin/UserManagement';
import MenuManagement from './pages/admin/MenuManagement';

// Pages Kasir
import DashboardKasir from './pages/kasir/DashboardKasir';
import OrderTransaction from './pages/kasir/OrderTransaction';
import OrderHistory from './pages/kasir/OrderHistory';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/forbidden" element={<Forbidden />} />

        {/* 👑 RUTE KHUSUS ADMIN */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
          <Route path="/admin/dashboard" element={<DashboardAdmin />} />
          <Route path="/admin/users" element={<UserManagement />} />
          <Route path="/admin/menus" element={<MenuManagement />} />
        </Route>

        {/* 💼 RUTE KHUSUS KASIR */}
        <Route element={<ProtectedRoute allowedRoles={['KASIR']} />}>
          <Route path="/kasir/dashboard" element={<DashboardKasir />} />
          <Route path="/kasir/transaksi" element={<OrderTransaction />} />
          <Route path="/kasir/riwayat" element={<OrderHistory />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
```

---

## 💎 Tips Desain UI/UX Frontend yang Menarik
Untuk nilai tambah dalam penilaian UKL, perhatikan estetika UI Anda:
1. **Glassmorphism / Neon Accent**: Berikan sentuhan backdrop blur pada sidebar atau modal dengan Tailwind (`backdrop-blur-md bg-white/70`).
2. **Micro-animations**: Tambahkan transisi halus saat tombol diarahkan (`hover:scale-[1.02] active:scale-[0.98] transition-all`).
3. **Statistik Interaktif**: Pada dashboard Admin, gunakan grafik interaktif (seperti **Chart.js** atau **ApexCharts**) untuk menampilkan laporan bulanan dan menu terlaris yang diambil dari endpoint `/api/laporan`.
