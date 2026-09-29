# Islamku.id

## Menjalankan aplikasi

Pastikan Node.js 18 atau lebih baru sudah terpasang, lalu jalankan dari folder proyek:

```powershell
npm.cmd start
```

Buka `http://localhost:3000` di browser.

Backend menyediakan:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`
- `GET /api/bookmark`
- `PUT /api/bookmark`
- `GET /api/preferences`
- `PUT /api/preferences`

Data user dan bookmark disimpan di `data/store.json`. Password di-hash menggunakan `scrypt` dan token sesi hanya berlaku selama proses server aktif.

## Email kontak

Pesan kontak selalu disimpan di server. Agar pesan juga diteruskan otomatis melalui email, install dependency lalu atur environment variable SMTP sebelum menjalankan server:

```powershell
npm.cmd install
Copy-Item .env.example .env
# Isi SMTP_USER, SMTP_PASS, dan SMTP_FROM di file .env
node server.js
```

Server membaca `.env` otomatis setiap kali dimulai. Untuk Gmail, `SMTP_PASS` harus berupa App Password Gmail, bukan kata sandi akun utama.


## Notifikasi dan pengingat ibadah

Izin notifikasi diminta melalui tombol lonceng di topbar, kartu "Aktifkan notifikasi" pada Beranda, tombol "Ingatkan saya" pada kartu waktu shalat, atau halaman Pengaturan. Preferensi pengingat (waktu shalat yang dipilih, jarak pengingat sebelum adzan, pengingat jamaah setelah adzan, dzikir pagi & petang, artikel islami) tersimpan per pengguna dan disinkronkan ke akun seperti dijelaskan pada bagian "Pengaturan preferensi pengguna".

Cara kerja pengingat shalat:

- Setiap waktu shalat (Subuh, Dzuhur, Ashar, Maghrib, Isya) bisa dinyalakan atau dimatikan sendiri dari dialog notifikasi atau halaman Pengaturan.
- Waktu pengingat dapat dimajukan 5/10/15 menit sebelum adzan agar ada waktu bersiap.
- Pengingat jamaah (opsional) dikirim 5/10/15 menit setelah adzan untuk mengingatkan shalat berjamaah.
- Notifikasi shalat menyediakan tombol **"Ingatkan 5 menit lagi"** (mengulang pengingat) dan **"Tandai sudah shalat"** (langsung menandai waktu shalat selesai, sama seperti tombol centang di Beranda).
- Tombol "Ingatkan saya" pada kartu waktu shalat adalah jalur cepat: meminta izin bila belum ada, lalu mengaktifkan pengingat sampai waktu shalat berikutnya.
- Kartu Beranda, dialog notifikasi, dan halaman Pengaturan menampilkan "Pengingat berikutnya: …" agar pengguna tahu kapan notifikasi akan datang, termasuk saat pengingat berikutnya jatuh besok (Subuh).

Catatan:

- Pengingat diproses oleh `app.js` memakai jadwal shalat Aladhan yang sedang aktif, jadi buka Beranda atau halaman Jadwal Shalat lebih dulu agar jadwal hari ini termuat.
- Penjadwalan memakai timer presisi menuju menit pengingat berikutnya, dengan pemeriksaan berkala (60 detik) sebagai jaring pengaman bila timer dihentikan browser, dan pemeriksaan ulang setiap tab kembali aktif.
- Notifikasi dikirim lewat Service Worker (`sw.js`) dan tampil selama aplikasi terbuka atau dikembalikan ke depan; pengingat latar belakang penuh belum tersedia karena menunggu Web Push di backend.
- Tombol "Kirim uji coba" pada dialog/pengaturan berguna untuk memastikan izin, Service Worker, dan aksi notifikasi sudah berjalan.
- Notifikasi browser hanya dapat diuji pada `localhost` atau alamat HTTPS, dan tombol aksi pada notifikasi bergantung dukungan browser.

Alamat penerima dikonfigurasi hanya di backend melalui `CONTACT_RECEIVER_EMAIL`, sehingga tidak dikirim ke browser atau ditampilkan pada form.

## Pengaturan preferensi pengguna

Halaman **Pengaturan** (sidebar → Pengaturan, atau menu akun → "Pengaturan preferensi") mengelola:

- **Akun** — status masuk/keluar dan status sinkronisasi preferensi.
- **Pengingat notifikasi** — pengingat waktu shalat, dzikir pagi & petang, artikel islami, dan jarak pengingat sebelum waktu shalat.
- **Tampilan bacaan** — ukuran teks normal atau besar (mode majelis) untuk Tahlil, Manaqib, Ratib, Dzikir, dan teks ayat.
- **Metode waktu shalat** — mazhab Ashar standar atau Hanafi (`school=0/1` pada API Aladhan).
- **Data perangkat** — tombol "Reset progres lokal" untuk menghapus progres shalat, hitungan dzikir, riwayat bacaan, dan cache surat.

Bentuk data preferensi:

```json
{
  "notification": {
    "prayer": true,
    "prayers": { "Fajr": true, "Dhuhr": true, "Asr": true, "Maghrib": true, "Isha": true },
    "leadMinutes": 0,
    "iqamahMinutes": 0,
    "dzikir": true,
    "artikel": false
  },
  "display": { "readingScale": "normal" },
  "ibadah": { "asrSchool": "standard" }
}
```

Preferensi disimpan di `localStorage` per pengguna (`islamku:prefs`) agar tamu tetap bisa mengatur aplikasi. Setelah masuk, preferensi disinkronkan ke akun lewat `GET/PUT /api/preferences` dan tersimpan di `data/store.json` pada bagian `preferences`, sehingga pengaturan yang sama terpakai di perangkat lain. `PUT` menerima pembaruan sebagian (misalnya hanya `{"notification":{"artikel":true}}`) karena server menggabungkannya dengan nilai sebelumnya dan nilai default.

