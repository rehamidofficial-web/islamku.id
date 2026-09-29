# Backlog Sprint 30 Hari Islamku.id

**Tanggal pembaruan:** 24 September 2026  
**Durasi:** 30 hari  
**Status proyek:** MVP fungsional parsial, menuju kesiapan produksi  
**Pembagian sprint:** 4 sprint, masing-masing 7 hari, ditambah 2 hari buffer untuk rilis dan perbaikan

## Legenda

- **Status:** `✅ Selesai` = sudah tersedia di proyek saat ini; `⬜ Belum dikerjakan` = target sprint; `🟡 Sebagian` = sebagian subtask sudah tersedia dan sisanya menjadi pekerjaan lanjutan.
- **Story point:** estimasi relatif dengan skala Fibonacci: 1, 2, 3, 5, 8, 13.
- **Label:** `frontend`, `backend`, `content`, `security`, `testing`, `devops`, `accessibility`.

## Ringkasan sprint

| Sprint       |  Hari | Fokus                                           | Target story point |
| ------------ | ----: | ----------------------------------------------- | -----------------: |
| Sprint 1     |   1-7 | Stabilitas backend dan keamanan akun            |                 24 |
| Sprint 2     |  8-14 | Konten tervalidasi dan workflow admin           |                 39 |
| Sprint 3     | 15-21 | Progres ibadah, notifikasi, dan PWA             |                 29 |
| Sprint 4     | 22-28 | Aksesibilitas, testing, monitoring, dan rilis   |                 31 |
| Buffer rilis | 29-30 | UAT, perbaikan prioritas tinggi, dan deployment |                  8 |

## Backlog terencana

### Sprint 1 - Stabilitas backend dan keamanan akun

| Status              | Judul task                        | Deskripsi                                                                              | Subtask                                                                                                  | Sprint   | Story point | Label                             |
| ------------------- | --------------------------------- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | -------- | ----------: | --------------------------------- |
| ✅ Selesai          | Fondasi server dan penyimpanan    | Server Node.js dan penyimpanan JSON sudah berjalan sebagai fondasi MVP.                | `server.js`; `data/store.json`; konfigurasi `.env` dan SMTP                                              | Sprint 1 |           3 | `backend`, `devops`               |
| ✅ Selesai          | Registrasi dan login              | Pengguna dapat membuat akun, login, logout, dan mengambil sesi aktif.                  | Endpoint auth; validasi dasar; hash password `scrypt`; token sesi; modal akun                            | Sprint 1 |           5 | `backend`, `frontend`, `security` |
| ✅ Selesai          | Bookmark Al-Qur'an                | Bookmark tersimpan per pengguna dan dapat diambil kembali setelah login.               | Endpoint bookmark; integrasi UI; cache browser; validasi user                                            | Sprint 1 |           3 | `backend`, `frontend`             |
| ✅ Selesai          | Form contact dan pengiriman email | Pesan contact tervalidasi, disimpan, dan dikirim lewat SMTP bila konfigurasi tersedia. | Form UI; endpoint; penyimpanan `data/store.json`; integrasi Nodemailer                                   | Sprint 1 |           3 | `backend`, `frontend`             |
| ✅ Selesai          | Pengujian API utama               | Menjamin endpoint auth, bookmark, dan contact menangani skenario sukses serta gagal.   | ✅ Test register/login; ✅ Test bookmark; ✅ Test contact; ✅ Uji payload invalid; ✅ Uji server restart | Sprint 1 |           5 | `backend`, `testing`              |
| ⬜ Belum dikerjakan | Penguatan sesi dan login          | Mengurangi risiko penyalahgunaan akun pada MVP yang akan dipublikasikan.               | Expiry token; rate limiting login; sanitasi input; dokumentasikan data sensitif                          | Sprint 1 |           5 | `backend`, `security`             |

### Sprint 2 - Konten tervalidasi dan workflow admin

| Status              | Judul task                           | Deskripsi                                                                                                     | Subtask                                                                             | Sprint   | Story point | Label                             |
| ------------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | -------- | ----------: | --------------------------------- |
| ✅ Selesai          | Navigasi dan layout responsive       | Seluruh modul utama dapat diakses dari router internal dan tampil pada desktop/mobile.                        | Beranda; jadwal; kiblat; Al-Qur'an; Tahlil; Manaqib; Ratib; Dzikir; Artikel; Kontak | Sprint 2 |           5 | `frontend`                        |
| ✅ Selesai          | Jadwal shalat dan kompas kiblat      | Integrasi lokasi, jadwal API, countdown, dan perhitungan arah kiblat sudah tersedia.                          | GPS; pencarian kota; tanggal Hijriah; sensor perangkat; fallback desktop            | Sprint 2 |           5 | `frontend`, `backend`             |
| ✅ Selesai          | Modul Al-Qur'an digital              | Pengguna dapat mencari surat, membaca ayat, melihat terjemahan/tafsir/audio, dan melanjutkan posisi terakhir. | Integrasi EQuran.id; pencarian; detail ayat; audio; local progress                  | Sprint 2 |           5 | `frontend`, `content`             |
| ✅ Selesai          | Konten ibadah dasar                  | Tahlil, Manaqib, Ratib, dan Dzikir telah memiliki halaman baca serta counter.                                 | Konten internal; tampilan baca; counter dzikir                                      | Sprint 2 |           3 | `frontend`, `content`             |
| ⬜ Belum dikerjakan | Validasi sumber dan editorial konten | Memastikan konten agama memiliki sumber resmi, reviewer, dan status publikasi.                                | Inventaris sumber; field reviewer; checklist review; keputusan metode jadwal shalat | Sprint 2 |           5 | `content`, `backend`              |
| ⬜ Belum dikerjakan | Admin contact                        | Menyediakan kanal internal agar pesan saran/kisah dapat ditinjau tanpa membuka JSON manual.                   | Auth admin; daftar pesan; status baru/dibaca/ditindaklanjuti; endpoint admin        | Sprint 2 |           8 | `backend`, `frontend`, `security` |
| ⬜ Belum dikerjakan | CMS artikel sederhana                | Redaksi dapat membuat, mengubah, menerbitkan, dan mengarsipkan artikel tanpa mengedit `content.js`.           | Model artikel; CRUD API; editor admin; kategori; penulis; tanggal; artikel terkait  | Sprint 2 |           8 | `backend`, `frontend`, `content`  |

### Sprint 3 - Progres ibadah, notifikasi, dan PWA

| Status              | Judul task                  | Deskripsi                                                                                        | Subtask                                                                                                  | Sprint   | Story point | Label                             |
| ------------------- | --------------------------- | ------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------- | -------- | ----------: | --------------------------------- |
| ⬜ Belum dikerjakan | Sinkronisasi progres ibadah | Pengguna login dapat melanjutkan progres shalat, dzikir, dan bacaan dari perangkat lain.         | Desain schema progres; endpoint sync; UI status shalat; progres dzikir; progres bacaan                   | Sprint 3 |           8 | `backend`, `frontend`             |
| 🟡 Sebagian         | Pengaturan notifikasi       | Pengguna dapat mengaktifkan atau mematikan pengingat sesuai preferensi.                          | ✅ UI permission & dialog pengaturan; ✅ preferensi user tersinkron ke akun; ✅ pilih waktu shalat per waktu + pengingat jamaah (iqamah); ✅ pengingat shalat, dzikir pagi/petang, dan artikel (saat aplikasi terbuka); ✅ aksi notifikasi (ingatkan ulang & tandai sudah shalat); ⬜ Web Push latar belakang                        | Sprint 3 |           8 | `frontend`, `backend`             |
| ✅ Selesai          | PWA dan mode offline        | Aplikasi dapat dipasang dan tetap menampilkan aset serta konten yang pernah dibuka saat offline. | ✅ `manifest.json`; ✅ Service Worker; ✅ cache asset; ✅ fallback offline; ✅ strategi invalidasi cache | Sprint 3 |           8 | `frontend`, `devops`              |
| ⬜ Belum dikerjakan | Reset password dan profil   | Pengguna dapat memulihkan akun dan mengelola data profil dasar.                                  | Token reset; expiry reset token; form profil; ubah password; verifikasi email opsional                   | Sprint 3 |           5 | `backend`, `frontend`, `security` |

### Sprint 4 - Kualitas, aksesibilitas, monitoring, dan rilis

| Status              | Judul task                     | Deskripsi                                                                                       | Subtask                                                                                              | Sprint   | Story point | Label                            |
| ------------------- | ------------------------------ | ----------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | -------- | ----------: | -------------------------------- |
| ⬜ Belum dikerjakan | Audit aksesibilitas            | Memastikan fitur inti dapat digunakan dengan keyboard, screen reader, dan ukuran layar berbeda. | Fokus modal; label tombol ikon; kontras; heading; ukuran teks Arab; keyboard navigation              | Sprint 4 |           5 | `frontend`, `accessibility`      |
| ⬜ Belum dikerjakan | Pengujian end-to-end           | Memvalidasi alur pengguna utama dari browser sampai backend.                                    | Register/login; bookmark; pencarian Al-Qur'an; contact; admin contact; responsive smoke test         | Sprint 4 |           8 | `testing`, `frontend`, `backend` |
| ⬜ Belum dikerjakan | Logging dan monitoring error   | Menyediakan informasi teknis yang cukup untuk menemukan kegagalan setelah rilis.                | Structured logging; error handler; health check; pencatatan request penting; alert dasar             | Sprint 4 |           5 | `backend`, `devops`              |
| ⬜ Belum dikerjakan | Backup dan kesiapan deployment | Mengurangi risiko kehilangan data dan menyiapkan deployment yang dapat diulang.                 | Backup `store.json`; dokumentasi environment; migrasi database sebagai rencana; checklist deployment | Sprint 4 |           5 | `devops`, `backend`              |
| ⬜ Belum dikerjakan | Audit privasi dan keamanan     | Meninjau data yang dikumpulkan, durasi penyimpanan, dan konfigurasi publik sebelum rilis.       | Privacy notice; review token/password; proteksi spam; validasi CORS/headers; threat checklist        | Sprint 4 |           5 | `security`, `backend`            |
| ⬜ Belum dikerjakan | Pipeline CI dan quality gate   | Menjalankan test dan pemeriksaan dasar secara otomatis sebelum perubahan digabungkan.           | Script test; lint/check; workflow CI; status gagal sebagai penghalang merge                          | Sprint 4 |           3 | `testing`, `devops`              |

### Buffer rilis - Hari 29-30

| Status              | Judul task                         | Deskripsi                                                                          | Subtask                                                                       | Sprint       | Story point | Label                            |
| ------------------- | ---------------------------------- | ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | ------------ | ----------: | -------------------------------- |
| ⬜ Belum dikerjakan | UAT dan perbaikan prioritas tinggi | Menguji MVP bersama pengguna perwakilan dan menyelesaikan blocker sebelum rilis.   | Skenario UAT; catat bug; triase P0/P1; regression test; persetujuan rilis     | Buffer rilis |           5 | `testing`, `frontend`, `backend` |
| ⬜ Belum dikerjakan | Deployment dan dokumentasi rilis   | Mempublikasikan versi 30 hari dengan prosedur rollback dan dokumentasi penggunaan. | Deploy; backup sebelum rilis; smoke test production; changelog; rollback plan | Buffer rilis |           3 | `devops`, `documentation`        |

## Catatan teknis saat ini

- Stack: Node.js HTTP server, vanilla HTML/CSS/JavaScript, tanpa build tool.
- Penyimpanan: `data/store.json`; cocok untuk prototipe atau penggunaan kecil, belum ideal untuk produksi.
- Session: token disimpan di memory server sehingga semua sesi berakhir ketika proses server berhenti.
- Email contact: bersifat opsional; tanpa SMTP pesan tetap tersimpan di server.
- Artikel: konten lokal/statis di `content.js`, sehingga CMS pada Sprint 2 menjadi pekerjaan lanjutan.
- Notifikasi: izin dikelola browser; preferensi pengingat menjadi bagian dari preferensi pengguna yang disimpan per akun dan disinkronkan ke `data/store.json` melalui `GET/PUT /api/preferences`; pengingat shalat (per waktu, opsional dimajukan `leadMinutes`, plus pengingat jamaah `iqamahMinutes`), dzikir, dan artikel diproses `app.js` dengan timer presisi + pemeriksaan berkala 60 detik memakai jadwal Aladhan yang aktif, sehingga hanya berjalan selama aplikasi terbuka. Aksi notifikasi ("Ingatkan 5 menit lagi", "Tandai sudah shalat") diteruskan `sw.js` lewat `postMessage`. Pengingat latar belakang penuh memerlukan Web Push di backend.
- Preferensi pengguna: diatur pada halaman Pengaturan (`app.js` bagian `3c`) yang mencakup notifikasi, ukuran teks bacaan (`display.readingScale`), dan mazhab Ashar (`ibadah.asrSchool` → parameter `school` API Aladhan). Nilai default ada di `DEFAULT_USER_PREFS` (frontend) dan `DEFAULT_PREFERENCES` (backend) sehingga wajib diselaraskan bila skema berubah.

## Definition of Done umum

Sebuah task dianggap selesai apabila implementasi sudah dibuat, skenario sukses dan gagal utama sudah diuji, tidak menimbulkan error baru pada modul terkait, dokumentasi konfigurasi diperbarui bila diperlukan, dan statusnya ditandai `✅ Selesai`.
