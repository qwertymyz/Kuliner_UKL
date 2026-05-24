# Kuliner Backend API v2 🍽️

Backend REST API untuk Sistem Kasir Kuliner (Uji Kompetensi Keahlian - UKL). Dibuat menggunakan **Node.js**, **Express.js**, **Prisma ORM**, dan database **MySQL**. Menggunakan autentikasi berbasis **JWT (JSON Web Token)** dengan otorisasi berbasis Role (`ADMIN` dan `KASIR`).

---

## 🛠️ Langkah-Langkah Menjalankan Backend

### 1. Prasyarat (Prerequisites)
Pastikan Anda sudah menginstal:
* [Node.js](https://nodejs.org/) (versi 16 atau lebih baru)
* MySQL Server (XAMPP, Laragon, Docker, atau MySQL Installer)

---

### 2. Kloning & Masuk ke Direktori Project
Masuk ke folder backend ini di terminal Anda:
```bash
cd kuliner-backend-v2
```

---

### 3. Instalasi Dependency
Instal semua package node_modules yang dibutuhkan:
```bash
npm install
```

---

### 4. Konfigurasi Environment (`.env`)
Salin file konfigurasi environment dari `.env.example`:
```bash
copy .env.example .env
```
*(atau buat file `.env` baru jika menggunakan MacOS/Linux: `cp .env.example .env`)*

Buka file `.env` yang baru dibuat dan sesuaikan pengaturannya:
```env
# URL koneksi database MySQL Anda
DATABASE_URL="mysql://root:@127.0.0.1:3306/kuliner_db"

# Port Server
PORT=3000
NODE_ENV=development

# JWT Configuration (Ganti secret key dengan string yang panjang dan aman)
JWT_SECRET="isi_dengan_string_random_yang_sangat_panjang_dan_rahasia"
JWT_EXPIRES_IN="8h"
```
> ⚠️ **Catatan Port MySQL:** Sesuaikan port pada `DATABASE_URL` (biasanya `3306` untuk default XAMPP/MySQL, atau `3307` jika Anda mengubah konfigurasinya). Pastikan database server (MySQL) sudah berjalan.

---

### 5. Sinkronisasi Database (Prisma db push)
Jalankan perintah berikut untuk membuat database `kuliner_db` dan membuat tabel-tabel secara otomatis berdasarkan skema Prisma:
```bash
npm run db:push
```

---

### 6. Seeding Data Awal (Default Users & Menus)
Gunakan seeder bawaan untuk mengisi data awal (2 User default & 9 item Menu):
```bash
npm run db:seed
```
* **Akun Default setelah Seeding:**
  * **Admin:** username: `admin` | password: `password123`
  * **Kasir:** username: `kasir1` | password: `password123`

---

### 7. Jalankan Server
* **Mode Development (dengan reload otomatis menggunakan Nodemon):**
  ```bash
  npm run dev
  ```
* **Mode Production:**
  ```bash
  npm start
  ```

Server akan berjalan di: **`http://localhost:3000`**

---

## 🧪 Menguji API dengan Postman
Gunakan file **`Kuliner-UKL.postman_collection.json`** yang sudah disediakan di folder root backend ini:
1. Buka aplikasi **Postman**.
2. Klik **Import** -> pilih file `Kuliner-UKL.postman_collection.json`.
3. Jalankan request **Login Admin** atau **Login Kasir**. Token JWT akan disimpan otomatis secara dinamis ke variabel koleksi Postman (`token`) untuk mengotorisasi request selanjutnya.

---

## 📂 Struktur Folder Backend
```text
kuliner-backend-v2/
├── prisma/
│   ├── schema.prisma   # Skema Database (tabel User, Menu, Pesanan, ItemPesanan)
│   └── seed.js         # Script seeder data dummy
├── src/
│   ├── controllers/    # Logika bisnis endpoint (auth, user, menu, pesanan, laporan)
│   ├── middlewares/    # Custom middlewares (auth JWT, errorHandler, validateBody)
│   ├── routes/         # Routing URL API express
│   ├── utils/          # Helper utilities (koneksi prisma client, template response JSON)
│   └── server.js       # Entry point utama aplikasi express
├── .env                # File konfigurasi sensitif (diabaikan oleh git)
├── package.json        # Manifest file dependency Node.js
└── Kuliner-UKL.postman_collection.json # File collection Postman
```
