# 🚀 PANDUAN SETUP PROJECT - ISLAMKU.ID

**Versi**: v2.0 (Bug Bookmark Sudah Diperbaiki!)  
**Status**: ✅ SIAP DIJALANKAN  

---

## 📋 APA YANG SUDAH DIPERBAIKI?

✅ **Bug Bookmark Fixed** - Error 401 sudah diatasi  
✅ **Database Setup** - SQL migration sudah siap  
✅ **Server Code** - writeStore() sudah diperbaiki  
✅ **Dependencies** - package.json sudah lengkap  
✅ **Environment Config** - .env sudah dikonfigurasi  

---

## ⚡ SETUP CEPAT (5 MENIT)

### Step 1: Install Dependencies (2 menit)

```bash
# Buka terminal di folder ini
cd islamku-id-webapp

# Install semua package yang diperlukan
npm install
```

Tunggu sampai selesai (mungkin 1-2 menit tergantung internet).

---

### Step 2: Setup Database (1 menit)

Anda HARUS menjalankan SQL migration di Neon:

```
1. Buka: https://console.neon.tech
2. Login ke akun Anda
3. Pergi ke project: islamku-id-webapp
4. Buka SQL Editor
5. Copy-paste isi file: FIX_BOOKMARK_ISSUE.sql
6. Klik "Run"
7. Tunggu sampai "Success"
```

**File SQL sudah ada di folder:** `FIX_BOOKMARK_ISSUE.sql`

---

### Step 3: Jalankan Server (1 menit)

```bash
# Di terminal yang sama
npm start

# Tunggu sampai muncul:
# "Islamku.id berjalan di http://localhost:3000"
```

---

### Step 4: Buka di Browser (1 menit)

```
Buka: http://localhost:3000

Anda akan melihat halaman login aplikasi!
```

---

### Step 5: Test Bookmark (Opsional)

```
1. Klik "Daftar"
2. Buat akun test
3. Login
4. Buka Al-Qur'an
5. Bookmark surat
6. Logout & Login kembali
7. Verifikasi: Bookmark masih ada ✅
```

---

## 📁 STRUKTUR FOLDER PROJECT

```
islamku-id-webapp/
├── server.js ..................... Server utama (SUDAH DI-FIX!)
├── app.js ........................ Frontend logic
├── index.html .................... Tampilan utama
├── content.js .................... Data Al-Qur'an
├── .env .......................... Konfigurasi database
├── package.json .................. Dependencies
├── node_modules/ ................. Installed packages
├── data/ ......................... Folder data lokal
├── icons/ ........................ Icon files
├── FIX_BOOKMARK_ISSUE.sql ........ Database migration (PENTING!)
├── SETUP_GUIDE_ID.md ............. File ini!
├── CHANGELOG.md .................. Apa yang diperbaiki
└── README.md ..................... Original README
```

---

## 🔧 REQUIREMENTS

### Software yang Harus Ada:

✅ **Node.js** v18+ atau lebih baru
   - Download: https://nodejs.org/
   - Cek versi: `node --version`

✅ **Browser** (Chrome, Firefox, Safari, Edge)
   - Untuk akses aplikasi

✅ **Terminal/Command Prompt**
   - Sudah ada di Windows/Mac/Linux

✅ **Database Neon** (Cloud PostgreSQL)
   - Sudah setup di: https://console.neon.tech
   - DATABASE_URL sudah di .env

---

## 📝 KONFIGURASI (.env)

File `.env` sudah berisi:

```
# Database
DATABASE_URL=postgresql://[user]:[password]@[host]/neondb?...

# Email (opsional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=[your-email]
SMTP_PASS=[app-password]
SMTP_FROM=[your-email]
```

**Jika belum punya DATABASE_URL:**
1. Buat akun di https://console.neon.tech
2. Buat project baru
3. Copy connection string
4. Paste ke DATABASE_URL di .env

---

## 🚀 CARA JALANKAN

### Quick Start:

```bash
# 1. Terminal di folder project
cd islamku-id-webapp

# 2. Install dependencies
npm install

# 3. Setup database (buka Neon, run SQL migration)
# Lihat Step 2 di atas

# 4. Jalankan server
npm start

# 5. Buka browser
# http://localhost:3000
```

### Development Mode:

Jika Anda ingin auto-reload saat ada perubahan code:

```bash
npm install -g nodemon
nodemon server.js
```

---

## ✅ TESTING BOOKMARK FEATURE

Setelah server running, test bookmark:

```
1. Buka: http://localhost:3000
2. Register: Buat akun baru
3. Login: Masuk ke aplikasi
4. Al-Qur'an: Klik menu Al-Qur'an
5. Select: Pilih surat (misal: Al-Fatihah)
6. Bookmark: Klik "Tandai terakhir dibaca" di ayat tertentu
7. Toast: Seharusnya muncul "Ditandai: [Surat] ayat [X]"
8. Logout: Klik keluar
9. Login: Masuk lagi dengan akun yang sama
10. Verify: Seharusnya muncul banner "Terakhir dibaca: [Surat]"

Kalau semua berfungsi ✅ = Bookmark feature BERHASIL!
```

---

## 🐛 TROUBLESHOOTING

### Problem: npm install gagal

**Solusi:**
```bash
# Hapus node_modules lama
rm -rf node_modules package-lock.json

# Install ulang
npm install
```

---

### Problem: Server crash saat startup

**Solusi:**
```bash
# Cek apakah .env benar
# DATABASE_URL harus valid

# Cek apakah port 3000 tidak digunakan
# Kalau sudah digunakan, ubah di server.js

# Cek error message di console untuk detail
```

---

### Problem: Bookmark masih error 401

**Solusi:**
1. Pastikan sudah run SQL migration di Neon ✓
2. Pastikan writeStore() di server.js benar ✓
3. Restart server: `Ctrl+C` → `npm start`
4. Clear browser cache: `F12` → `Application` → `Clear All`
5. Coba lagi

---

### Problem: Database connection error

**Solusi:**
1. Verifikasi DATABASE_URL di .env
2. Cek apakah Neon project aktif
3. Pastikan internet connection stabil
4. Jika perlu, buat project Neon baru dan update DATABASE_URL

---

## 📚 FILE PENTING

### Untuk Developer:

- **server.js** - Main server (FIX bookmark ada di sini)
- **app.js** - Frontend logic
- **.env** - Configuration (jangan di-commit!)

### Untuk Database:

- **FIX_BOOKMARK_ISSUE.sql** - SQL migration (WAJIB jalankan di Neon!)

### Untuk Reference:

- **README.md** - Original documentation
- **CHANGELOG.md** - Apa yang berubah
- **SETUP_GUIDE_ID.md** - File ini!

---

## 🎯 NEXT STEPS

Setelah berhasil setup:

1. **Explore features** - Coba semua fitur aplikasi
2. **Test bookmark** - Pastikan working sempurna
3. **Customization** - Ubah sesuai kebutuhan Anda
4. **Deployment** - Deploy ke production kalau sudah siap

---

## 📞 BUTUH BANTUAN?

1. **Check ini dulu:**
   - Sudah run `npm install`? ✓
   - Sudah run SQL migration di Neon? ✓
   - Sudah jalankan `npm start`? ✓

2. **Lihat error message:**
   - Console akan memberitahu apa masalahnya
   - Screenshot error dan tanyakan ke developer

3. **Cek file ini:**
   - CHANGELOG.md - Apa yang berubah
   - README.md - Original documentation

---

## 🎊 SIAP?

Sekarang tinggal:

```bash
npm install
npm start
```

Dan buka: http://localhost:3000

**Good luck! Aplikasi Islamku.id siap dijalankan!** 🌙

---

**Last Updated:** 2026-09-29  
**Version:** v2.0 (Bookmark Fixed)  
**Status:** ✅ PRODUCTION READY
