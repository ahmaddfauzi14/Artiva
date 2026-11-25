<a id="top"></a>
<div align="center">

<img width="220" alt="ARTIVA Animated Logo" src="https://github.com/user-attachments/assets/1f19b19a-5b7e-47ec-8664-67456a15d9be" />

# 🎨 ARTIVA
### *Where Art Meets Community and Creativity*

**Platform Showcase Karya Seni Digital, Komunitas Kreator, & Tantangan Kreatif Terkurasi**

*Discover Art · Connect Creators · Compete Creatively*

<p>
  <img src="https://img.shields.io/badge/Next.js-16.4.6-091326?style=for-the-badge&logo=nextdotjs&logoColor=F2C94C" alt="Next.js 16.4.6" />
  <img src="https://img.shields.io/badge/React-19.3.0-101F3D?style=for-the-badge&logo=react&logoColor=699EE8" alt="React 19.3.0" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4-101F3D?style=for-the-badge&logo=tailwindcss&logoColor=38BDF8" alt="Tailwind CSS v4" />
  <img src="https://img.shields.io/badge/PostgreSQL-14_Tables-091326?style=for-the-badge&logo=postgresql&logoColor=F2C94C" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Zod-v4.6-101F3D?style=for-the-badge&logo=zod&logoColor=699EE8" alt="Zod Validation" />
  <img src="https://img.shields.io/badge/License-MIT-F2C94C?style=for-the-badge&labelColor=091326" alt="MIT License" />
</p>

<p>
  <a href="#tentang">🎨 Tentang</a> •
  <a href="#fitur">✨ Fitur</a> •
  <a href="#peran">👥 Peran</a> •
  <a href="#arsitektur">⚙️ Arsitektur</a> •
  <a href="#database">🗄️ Database</a> •
  <a href="#instalasi">🚀 Instalasi</a> •
  <a href="#struktur-api">📂 Struktur &amp; API</a>
</p>

</div>

---

<a id="tentang"></a>
## 🎨 Tentang ARTIVA

**ARTIVA** adalah platform showcase karya seni digital berbasis web yang menyatukan **portofolio kreator**, **interaksi komunitas**, dan **kompetisi kreatif terkurasi** dalam satu ekosistem terpadu.

Dirancang dengan filosofi **"Satu Karya, Tiga Ruang untuk Bertumbuh"**, ARTIVA memungkinkan kreator mengunggah karya sekali ke portofolio digital mereka lalu memaksimalkannya untuk pameran publik, apresiasi komunitas, dan keikutsertaan dalam tantangan kreatif—**tanpa perlu mengunggah ulang file gambar**.

<table>
  <tr>
    <td width="33%" valign="top">
      <h3>🖼️ Creative Showcase</h3>
      <p>Ruang portofolio digital untuk memamerkan karya seni dengan filter kategori, pencarian cepat berbasis trigram (<code>pg_trgm</code>), tag, profil publik kreator, serta inspektur karya interaktif (<em>zoom, pan, &amp; lightbox</em>).</p>
    </td>
    <td width="33%" valign="top">
      <h3>💬 Creative Community</h3>
      <p>Ekosistem apresiasi antar kreator melalui fitur <strong>Suka (Like)</strong>, <strong>Simpan Favorit</strong>, dan <strong>Komentar</strong>, dilengkapi sistem pelaporan konten untuk menjaga kualitas komunitas.</p>
    </td>
    <td width="33%" valign="top">
      <h3>🏆 Creative Challenge</h3>
      <p>Wadah kompetisi tematik yang dikelola oleh <strong>Kurator terverifikasi</strong>. Member cukup memilih karya portofolio yang memenuhi syarat untuk ikut serta hingga penentuan 1–3 pemenang resmi.</p>
    </td>
  </tr>
</table>

---

<a id="fitur"></a>
## ✨ Fitur Utama

Klik setiap modul di bawah ini untuk melihat detail fungsionalitasnya secara lengkap:

<details open>
<summary><b>🖼️ 1. Artwork Showcase &amp; Interactive Inspector</b></summary>

- **Eksplorasi Galeri Publik (`/artworks`)**: Filter berdasarkan kategori aktif, pencarian kata kunci judul (didukung indeks `GIN pg_trgm`), filter tag, dan paginasi.
- **Interactive Artwork Inspector (`/artworks/[id]`)**: Dilengkapi kontrol **Zoom**, **Pan (geser kanvas)**, dan tampilan **Lightbox layar penuh** untuk mengamati detail karya secara presisi.
- **Profil Publik Kreator (`/creators/[username]`)**: Menampilkan bio, tautan situs, avatar, dan seluruh karya publik milik kreator dalam kartu profil interaktif.
- **Kontrol Visibilitas Karya**: Pemilik karya dan sistem moderasi mendukung status publikasi `published`, `hidden`, dan `removed`.

</details>

<details>
<summary><b>💬 2. Creative Community &amp; Moderasi Konten</b></summary>

- **Apresiasi Karya**: Member aktif dapat memberikan **Like** (dengan animasi `PulseHeart`) dan menyimpan karya ke daftar **Favorit (`/me/favorites`)**.
- **Diskusi Komentar**: Menulis komentar pada halaman detail karya serta menghapus komentar milik sendiri (*soft delete* dengan status `visible` / `deleted`).
- **Pelaporan Pelanggaran**: Member aktif dapat melaporkan karya dengan kategori alasan terstruktur (`spam`, `plagiarism`, `inappropriate`, `copyright`, `other`) agar ditinjau oleh Admin.
- **Tindak Lanjut Admin**: Admin meninjau laporan berstatus `pending`, lalu menyelesaikannya (`resolved`) dengan opsi penindakan karya/akun atau menolaknya (`dismissed`) disertai catatan resolusi.

</details>

<details>
<summary><b>🏆 3. Creative Challenge (Zero Re-Upload Workflow)</b></summary>

- **Penemuan Tantangan (`/challenges`)**: Menjelajahi tantangan berdasarkan status (`open`, `closed`, `announced`), kategori, periode tanggal, dan daftar karya peserta.
- **Pengiriman Karya Portofolio (`/challenges/[id]/submit`)**: Member memilih karya miliknya yang berstatus `published` dan sesuai kategori tantangan (bila ditetapkan) tanpa mengunggah ulang file gambar.
- **Tarik &amp; Kirim Ulang (`Withdraw`)**: Member dapat menarik pengajuan selama tantangan belum diumumkan, lalu mengirimkannya kembali sebelum tenggat berakhir.
- **Sinkronisasi Status Otomatis**: Server otomatis menutup tantangan `open` yang melewati `end_date` sesuai zona waktu aplikasi (`APP_TIMEZONE`).
- **Podium Pemenang Resmi**: Kurator menetapkan **1 hingga 3 pemenang** berperingkat unik (`1..n`) secara transaksional, yang langsung tampil pada **Winner Podium** di halaman detail tantangan dan beranda.

</details>

<details>
<summary><b>🛡️ 4. Verifikasi Kurator, Banding &amp; Tata Kelola Admin</b></summary>

- **Pendaftaran Kurator Bertahap (`/register/curator`)**: Akun Kurator baru berstatus `pending` hingga diverifikasi Admin.
- **Mekanisme Banding (`/curator/verification`)**: Jika pengajuan ditolak (`rejected`), calon Kurator dapat memperbarui profil/catatan perbaikan dan mengajukan banding hingga maksimal **3 kali** (`MAX_CURATOR_APPEALS`), atau menghapus akunnya sendiri secara permanen.
- **Dashboard Admin (`/dashboard/admin`)**: Menyediakan ringkasan statistik bento (`AdminDashboardBento`), antrean aktivitas moderasi, verifikasi Kurator, manajemen kategori karya, pengelolaan status pengguna (`active` / `suspended`), dan penyelesaian laporan.

</details>

<details>
<summary><b>🎨 5. Desain Visual &amp; Komponen Interaktif</b></summary>

- **Tema Midnight Navy &amp; Warm Gold**: Palet `#091326` (canvas), `#101F3D` (surface), `#F7F3E6` (ink), dan aksen emas `#F2C94C` dengan tipografi **Poppins**.
- **Efek &amp; Mikro-Interaksi**: Menggunakan komponen kustom seperti `Aurora`, `GooeyNav`, `CircularGallery`, `GridMotion`, `TiltedCard`, `ProfileCard`, `PulseHeart`, dan `WinnerPodium` dengan dukungan `MotionContext`.
- **Ikon Konsisten**: Seluruh antarmuka menggunakan paket ikon **Hugeicons** (`@hugeicons/react`).

</details>

---

<a id="peran"></a>
## 👥 Peran Pengguna

ARTIVA menerapkan **Role-Based Access Control (RBAC)** dengan empat tingkat akses yang tervalidasi di sisi halaman maupun REST API:

| Peran | Status Awal | Jelajah Publik | Upload &amp; Kelola Karya | Like, Favorit, Komentar &amp; Lapor | Ikut Tantangan | Buat Tantangan &amp; Pilih Pemenang | Verifikasi &amp; Moderasi |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| 🌐 **Public User** | — | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| 🧑‍🎨 **Member** | `active` | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| 🏛️ **Curator** | `pending` → `active` | ✅ | ❌ *(kelola tantangan)* | ❌ *(fokus kurasi)* | ❌ | ✅ *(jika active)* | ❌ |
| 🛡️ **Admin** | `active` | ✅ | ❌ *(moderasi status)* | ❌ | ❌ | ❌ | ✅ |

> [!NOTE]
> Kurator yang masih berstatus `pending` diarahkan ke halaman `/curator/verification` untuk memantau status peninjauan Admin atau mengajukan banding bila ditolak.

---

<a id="arsitektur"></a>
## ⚙️ Arsitektur & Alur Sistem

### 🔄 Alur Ekosistem ARTIVA

```mermaid
flowchart LR
    P["🌐 Public User"] -->|"Jelajahi Galeri & Pemenang"| G["🖼️ Showcase & Tantangan"]

    M["🧑‍🎨 Member (Active)"] -->|"Upload Karya"| A["🎨 Portofolio Karya"]
    A -->|"Like / Favorit / Komentar / Lapor"| C["💬 Interaksi Komunitas"]
    A -->|"Submit Tanpa Re-Upload"| S["📩 Submission Tantangan"]

    K["🏛️ Calon Kurator"] -->|"Daftar"| V{"🛡️ Verifikasi Admin"}
    V -->|"Disetujui"| KA["✅ Kurator Active"]
    V -->|"Ditolak"| B["📝 Banding (Maks. 3x) / Hapus Akun"]
    B --> V

    KA -->|"Buat & Publikasikan"| T["🏆 Tantangan (Draft → Open)"]
    S --> T
    T -->|"Melewati end_date"| CL["🔒 Closed"]
    CL -->|"Tetapkan 1–3 Pemenang"| AN["🥇 Announced (Podium)"]

    AD["🛡️ Admin"] -->|"Moderasi Laporan, Kategori & Akun"| G
```

### 🧱 Arsitektur Kode & Keamanan

ARTIVA dibangun dengan **arsitektur berlapis (*layered architecture*)** di dalam Next.js App Router:

```text
HTTP Request ──▶ Route Handler (withHandler + Same-Origin CSRF + Rate Limiter)
                     │
                     ▼
               Zod Validator (src/lib/validators/*)
                     │
                     ▼
               Service Layer (src/lib/services/* — aturan bisnis & transaksi)
                     │
                     ▼
               Repository Layer (src/lib/repositories/* — parameterized SQL)
                     │
                     ▼
               PostgreSQL Database (pg Pool)
```

- **Autentikasi Cookie `httpOnly`**: Token JWT (`HS256` via `jose`, masa berlaku 7 hari) disimpan pada cookie `artiva_session` dengan atribut `httpOnly`, `sameSite: 'lax'`, dan `secure` pada mode produksi.
- **Hashing Password**: Menggunakan `bcryptjs` untuk pendaftaran dan verifikasi kredensial.
- **Proteksi CSRF & Rate Limiting**: Semua permintaan mutasi API (`POST`, `PUT`, `PATCH`, `DELETE`) divalidasi kesamaan `Origin`/`Referer` terhadap `Host`, dan endpoint sensitif dilindungi rate limiter (`checkRateLimit`).
- **Keamanan Upload Lokal**: File gambar divalidasi ukuran (`MAX_UPLOAD_MB`) dan **magic bytes** aslinya (`detectImageFormat` untuk JPEG, PNG, dan WEBP), disimpan dengan UUID di `storage/uploads/{artworks,avatars}`, serta dilayani aman dari serangan *path traversal* melalui `/api/uploads/[...path]`.

---

<a id="database"></a>
## 🗄️ Skema Database

Database PostgreSQL ARTIVA terdiri dari **14 tabel domain inti** (didefinisikan di [`db/migrations/001_init.sql`](db/migrations/001_init.sql)) ditambah tabel pelacak `schema_migrations` dan ekstensi `pg_trgm` untuk pencarian judul karya yang cepat.

<details>
<summary><b>📊 Klik untuk melihat rincian 14 tabel PostgreSQL &amp; tipe ENUM</b></summary>

| Domain | Tabel | Fungsi Utama |
| :--- | :--- | :--- |
| **Akun &amp; Kurator** | `users`, `profiles`, `curator_verifications` | Data autentikasi, peran (`admin`, `member`, `curator`), status akun (`active`, `pending`, `suspended`), profil publik, serta riwayat verifikasi &amp; banding Kurator. |
| **Karya &amp; Taksonomi** | `categories`, `artworks`, `tags`, `artwork_tags` | Katalog kategori, metadata karya &amp; `image_path`, status publikasi (`published`, `hidden`, `removed`), serta relasi *many-to-many* tag karya. |
| **Komunitas &amp; Moderasi** | `likes`, `favorites`, `comments`, `reports` | Apresiasi like/favorit (composite PK), komentar (`visible`/`deleted`), dan pelaporan pelanggaran (`pending`, `resolved`, `dismissed`). |
| **Tantangan &amp; Pemenang** | `challenges`, `submissions`, `winners` | Tantangan Kurator (`draft`, `open`, `closed`, `announced`), pengajuan karya unik per tantangan (`submitted`/`withdrawn`), dan penetapan peringkat 1–3 unik. |

</details>

---

## 🛠️ Tech Stack

<p align="left">
  <img src="https://skillicons.dev/icons?i=nextjs,react,tailwind,postgres,nodejs,git" alt="Tech Stack Icons" />
</p>

| Layer | Teknologi | Peran dalam Project |
| :--- | :--- | :--- |
| ⚡ **Framework** | **Next.js `16.4.6`** (App Router, Turbopack, JS) | SSR/CSR pages, layout per peran, dan REST API Route Handlers |
| 🎨 **UI &amp; Styling** | **React `19.3.0`**, **Tailwind CSS `v4`**, **Hugeicons** | Antarmuka responsif, sistem komponen editorial, &amp; ikon vektor |
| 🐘 **Database** | **PostgreSQL** via **`pg` (`^8.23.1`)** | 14 tabel relasional, query SQL berparameter, transaksi ACID, &amp; `pg_trgm` |
| 🔐 **Auth &amp; Security** | **`jose` (`^6.2.18`)**, **`bcryptjs` (`^3.0.3`)** | Sesi JWT cookie `httpOnly`, hashing password, rate limiter, &amp; CSRF `Origin` |
| ✅ **Validation** | **Zod (`^4.6.7`)** | Validasi skema input request API beserta pemetaan error per field |
| 📁 **Media Storage** | Local Filesystem (`storage/uploads/`) | Penyimpanan gambar JPEG/PNG/WEBP terverifikasi *magic-bytes* |

---

<a id="instalasi"></a>
## 🚀 Panduan Instalasi

Ikuti langkah-langkah berikut untuk menjalankan **ARTIVA** di lingkungan lokal Anda.

### 📋 Prasyarat

- **Node.js** `v20+` (mendukung `process.loadEnvFile` yang dipakai skrip migrasi/seed) dan **npm**
- **PostgreSQL** (lokal atau container)
- **Git**

### 1️⃣ Clone Repository

```bash
git clone https://github.com/ahmaddfauzi14/Artiva.git
cd Artiva
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Konfigurasi Environment Variables

Salin berkas `.env.example` menjadi `.env.local` pada root project, lalu sesuaikan nilainya:

```env
DATABASE_URL=postgres://user:pass@localhost:5432/artiva
SESSION_SECRET=ganti-dengan-string-acak-min-32-karakter
APP_TIMEZONE=Asia/Makassar
UPLOAD_DIR=./storage/uploads
MAX_UPLOAD_MB=5
SEED_ADMIN_USERNAME=admin
SEED_ADMIN_EMAIL=admin@artiva.local
SEED_ADMIN_PASSWORD=ganti-saya
```

<details>
<summary><b>⚙️ Penjelasan masing-masing variabel environment</b></summary>

| Variabel | Keterangan | Default / Contoh |
| :--- | :--- | :--- |
| `DATABASE_URL` | String koneksi PostgreSQL | `postgres://user:pass@localhost:5432/artiva` |
| `SESSION_SECRET` | Kunci rahasia penandatanganan JWT (minimal 32 karakter) | String acak 32+ karakter |
| `APP_TIMEZONE` | Zona waktu acuan untuk penutupan otomatis tantangan | `Asia/Makassar` |
| `UPLOAD_DIR` | Direktori penyimpanan file upload karya &amp; avatar | `./storage/uploads` |
| `MAX_UPLOAD_MB` | Batas maksimum ukuran file gambar unggahan (MB) | `5` |
| `SEED_ADMIN_USERNAME` | Username akun Admin awal saat menjalankan `seed.js` | `admin` |
| `SEED_ADMIN_EMAIL` | Email akun Admin awal | `admin@artiva.local` |
| `SEED_ADMIN_PASSWORD` | Password akun Admin awal | `AdminArtiva2026!` |

</details>

### 4️⃣ Buat Database & Jalankan Migrasi

Pastikan layanan PostgreSQL sudah aktif, lalu buat database `artiva`:

```sql
CREATE DATABASE artiva;
```

Jalankan migrasi skema tabel dan seed data awal (6 kategori standar + akun Admin):

```bash
node scripts/migrate.js
node scripts/seed.js
```

<details>
<summary><b>🧪 Opsional: Isi Dataset Demo Lengkap (Karya, Kreator, Tantangan, &amp; Laporan)</b></summary>

Project ini juga menyediakan skrip [`scripts/seed-dummy.js`](scripts/seed-dummy.js) yang bersifat idempoten untuk mengisi galeri dengan dataset nyata berlisensi publik/terbuka beserta variasi status lengkap:

```bash
node scripts/seed-dummy.js
```

- Menambahkan kategori (termasuk `Lukisan`), puluhan akun kreator &amp; kurator (password default akun demo: `ArtivaDummy2026!`), karya berstatus `published`, `hidden`, dan `removed`, data like/favorit/komentar, tantangan (`draft`, `open`, `closed`, `announced`), pemenang, serta 10 contoh laporan moderasi (`pending`, `resolved`, `dismissed`).
- Gambar karya &amp; avatar demo sudah tersedia di `storage/uploads/`.

</details>

### 5️⃣ Jalankan Development Server

```bash
npm run dev
```

Buka browser dan akses **[http://localhost:3000](http://localhost:3000)** 🎉

---

<a id="struktur-api"></a>
## 📂 Struktur Project & API

```text
Artiva/
├── db/
│   └── migrations/001_init.sql     # Skema awal 14 tabel PostgreSQL, ENUM, & indeks pg_trgm
├── public/images/                  # Aset statis publik (artiva-logo.png)
├── scripts/
│   ├── migrate.js                  # Runner migrasi SQL idempoten (schema_migrations)
│   ├── seed.js                     # Seed 6 kategori awal & akun Admin default
│   └── seed-dummy.js               # Seed dataset demo lengkap (karya, tantangan, laporan)
├── storage/uploads/
│   ├── artworks/                   # Penyimpanan lokal gambar karya
│   └── avatars/                    # Penyimpanan lokal avatar kreator
└── src/
    ├── app/                        # Next.js App Router (Pages & REST API Route Handlers)
    │   ├── api/                    # Endpoint /api/* (auth, artworks, challenges, me, curator, admin, uploads)
    │   ├── artworks/               # Halaman galeri & detail karya (+ zoom/pan inspector)
    │   ├── challenges/             # Halaman daftar, detail, podium pemenang, & submit tantangan
    │   ├── creators/[username]/    # Halaman profil publik kreator
    │   ├── me/                     # Ruang kerja Member (artworks, favorites, submissions, profile)
    │   ├── curator/                # Ruang kerja Kurator & halaman status verifikasi/banding
    │   └── dashboard/admin/        # Dashboard Admin (stats, curators, categories, users, reports)
    ├── components/
    │   ├── cards/                  # ArtworkCard, ChallengeCard, StepCard, WinnerPodium
    │   ├── effects/                # Aurora, CircularGallery, GooeyNav, GridMotion, TiltedCard, dll.
    │   ├── features/               # Komponen fitur per domain (admin, artworks, auth, challenges, curator, member)
    │   ├── layout/                 # PublicShell, Navbar, Sidebar, DashboardShell, AuthShell, Footer, PageHeader, SectionHeader
    │   └── ui/                     # Komponen UI reusable (Button, DataTable, ImageUploader, ConfirmModal, Toast, dll.)
    └── lib/
        ├── auth/                   # Session JWT (jose), password (bcryptjs), guards & page-guards
        ├── repositories/           # Query PostgreSQL terstruktur per entitas
        ├── server/                 # Pool DB, wrapper HTTP/CSRF, rate-limit, upload handler, sync status tantangan
        ├── shared/                 # Helper format tanggal/zona waktu, navigation, error-messages, permissions, api-client
        └── validators/             # Skema validasi Zod untuk seluruh input API
```

<details>
<summary><b>🔌 Ringkasan Endpoint REST API (<code>src/app/api/</code>)</b></summary>

| Grup | Endpoint Utama | Fungsi |
| :--- | :--- | :--- |
| **Auth** | `POST /api/auth/register/member`, `POST /api/auth/register/curator`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me` | Registrasi Member/Kurator, login/logout cookie JWT, &amp; info sesi aktif |
| **Public Discovery** | `GET /api/categories`, `GET /api/artworks`, `GET /api/artworks/[id]`, `GET /api/challenges`, `GET /api/challenges/[id]`, `GET /api/creators/[username]` | Eksplorasi kategori, karya, tantangan, pemenang, &amp; profil kreator |
| **Interaksi &amp; Laporan** | `PUT/DELETE /api/artworks/[id]/like`, `PUT/DELETE /api/artworks/[id]/favorite`, `GET/POST /api/artworks/[id]/comments`, `DELETE /api/comments/[id]`, `POST /api/artworks/[id]/reports` | Like, simpan favorit, komentar karya, &amp; laporkan pelanggaran (Member aktif) |
| **Member Workspace** | `GET/POST /api/me/artworks`, `GET/PATCH/DELETE /api/me/artworks/[id]`, `GET /api/me/favorites`, `PATCH /api/me/profile`, `PATCH /api/me/account`, `GET /api/me/submissions` | Kelola karya portofolio, favorit, profil/akun, &amp; riwayat submission |
| **Challenge Submission** | `GET /api/challenges/[id]/eligible-artworks`, `GET/POST /api/challenges/[id]/submissions`, `POST /api/submissions/[id]/withdraw` | Cek karya layak, kirim karya ke tantangan, &amp; tarik submission |
| **Curator Workspace** | `GET/POST /api/curator/verification`, `DELETE /api/curator/account`, `GET/POST /api/curator/challenges`, `GET/PATCH/DELETE /api/curator/challenges/[id]`, `POST .../publish`, `GET .../submissions`, `POST .../winners` | Status verifikasi/banding, kelola tantangan, tinjau peserta, &amp; tetapkan 1–3 pemenang |
| **Admin Governance** | `GET /api/admin/stats`, `GET/POST /api/admin/categories`, `PATCH/DELETE /api/admin/categories/[id]`, `GET /api/admin/curator-verifications`, `POST .../approve`, `POST .../reject`, `GET /api/admin/users`, `GET/PATCH/DELETE /api/admin/users/[id]`, `GET /api/admin/reports`, `POST .../resolve`, `POST .../dismiss` | Statistik, kelola kategori, verifikasi Kurator, kelola akun, &amp; moderasi laporan |
| **Uploads** | `GET /api/uploads/[...path]` | Menyajikan file gambar lokal secara aman dengan validasi path &amp; MIME |

</details>

---

## 🧰 Script Tersedia

| Perintah | Deskripsi |
| :--- | :--- |
| `npm run dev` | Menjalankan development server Next.js |
| `npm run build` | Membangun production build |
| `npm run start` | Menjalankan production server hasil build |
| `npm run lint` | Menjalankan pemeriksaan kode dengan ESLint |
| `node scripts/migrate.js` | Menerapkan migrasi skema PostgreSQL dari `db/migrations/` |
| `node scripts/seed.js` | Mengisi 6 kategori awal dan akun Admin default secara idempoten |
| `node scripts/seed-dummy.js` | Mengisi dataset demo lengkap (karya, kreator, kurator, tantangan, &amp; laporan) |

---

## 📜 Lisensi & Visi Project

Project ini dilisensikan di bawah **[MIT License](LICENSE)** (`Copyright (c) 2026 ahmaddfauzi14`).

> *"ARTIVA hadir untuk memberikan ruang bagi setiap kreator agar dapat menampilkan karya, membangun koneksi, dan mengembangkan kreativitas melalui satu ekosistem digital."*
>
> **Create. Connect. Compete.**

<div align="center">
  <br />
  <a href="#top">⬆️ Kembali ke Atas</a>
  <br /><br />
  <strong>ARTIVA</strong> — <em>Where Art Meets Community and Creativity.</em>
</div>
