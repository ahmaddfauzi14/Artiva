<h1 align="center">ARTIVA</h1>

<h3 align="center">Art Meets Community and Creativity</h3>

<p align="center">
  <img width="250" alt="ARTIVA Animated Logo" src="https://github.com/user-attachments/assets/1f19b19a-5b7e-47ec-8664-67456a15d9be" />
</p>

<p align="center">
  <strong>A Creative Showcase and Community Platform</strong>
</p>

<p align="center">
  Discover Art. Connect Creators. Compete Creatively.
</p>

---

## About ARTIVA

**ARTIVA** adalah platform showcase karya seni digital yang dirancang untuk menghubungkan kreator, karya seni, dan kompetisi kreatif dalam satu ekosistem. Platform ini menyediakan ruang bagi kreator untuk membangun portofolio, berinteraksi dengan komunitas, serta mengikuti tantangan kreatif terkurasi tanpa perlu mengunggah ulang file karya.

ARTIVA mengintegrasikan tiga aktivitas utama:

- **Creative Showcase**: Ruang untuk memamerkan, menjelajahi, dan mengapresiasi berbagai karya kreatif berdasarkan kategori maupun pencarian.
- **Creative Community**: Ruang interaksi bagi kreator untuk saling terhubung melalui like, favorit, dan komentar.
- **Creative Challenge**: Wadah kompetisi kurasi yang memungkinkan kreator mengikuti tantangan menggunakan karya portofolio yang sudah ada.

---

## Key Features

### 1. Artwork Showcase

- Menampilkan karya kreatif publik dengan filter kategori, pencarian kata kunci, tag, dan paginasi.
- Melihat halaman detail karya (inspektur zoom/pan dan tampilan layar penuh) serta profil publik kreator.
- Mengelola publikasi karya melalui status `published`, `hidden`, dan `removed`.

### 2. Creative Community

- Memberikan **like** pada karya.
- Menyimpan karya ke daftar **favorit**.
- Menulis dan menghapus **komentar** pada karya.
- **Melaporkan** karya yang melanggar ketentuan platform untuk ditinjau Admin.

### 3. Creative Challenge

- Menjelajahi tantangan kreatif yang sedang terbuka (`open`) maupun yang sudah selesai (`closed` / `announced`).
- Mengirimkan karya portofolio yang memenuhi syarat ke tantangan tanpa mengunggah ulang file gambar.
- Menarik kembali pengajuan (`withdraw`) selama tantangan belum diumumkan.
- Melihat galeri peserta dan daftar 1–3 pemenang resmi.

### 4. Role-Based Access Control

ARTIVA menyediakan empat peran pengguna dengan hak akses yang berbeda:

| Role | Description |
| :--- | :--- |
| **Public User** | Menjelajahi beranda, galeri karya, profil kreator, daftar tantangan, dan pemenang. |
| **Member** | Mengelola profil & karya, memberi like/favorit/komentar, melapor karya, serta mengirim & menarik submission tantangan. |
| **Curator** | Mendaftar dengan verifikasi Admin; setelah aktif dapat membuat, mempublikasikan tantangan, meninjau submission, dan menetapkan 1–3 pemenang. |
| **Admin** | Memverifikasi atau menolak pengajuan Kurator, mengelola kategori & akun pengguna, serta memoderasi laporan karya. |

---

## System Workflow

1. **Public User** mengakses beranda, galeri karya, tantangan, dan profil kreator.
2. Pengguna mendaftar sebagai **Member** (langsung aktif) atau mengajukan diri sebagai **Curator** (status `pending` hingga disetujui Admin).
3. **Member** mengunggah dan mempublikasikan karya ke portofolionya.
4. **Curator** terverifikasi membuat tantangan (`draft`) lalu mempublikasikannya (`open`).
5. **Member** memilih karya yang sudah terbit untuk dikirim ke tantangan terbuka (`submitted`).
6. **Curator** meninjau karya peserta dan menetapkan maksimal 3 pemenang berperingkat unik (`announced`).
7. **Admin** mengelola kategori, memverifikasi Kurator, mengatur status akun pengguna, dan menyelesaikan laporan moderasi.

---

## Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| Framework | **Next.js 16** (App Router, JavaScript) | Rendering halaman SSR/CSR dan backend REST API Route Handlers |
| UI & Styling | **React 19**, **Tailwind CSS v4**, **Hugeicons** | Antarmuka pengguna responsif dan sistem komponen |
| Database | **PostgreSQL** via **`pg`** | Penyimpanan relasional (14 tabel) dengan query SQL mentah berparameter |
| Auth & Security | **JWT (`jose`)**, **`bcryptjs`** | Sesi cookie `httpOnly`, hashing password, rate limiter, dan proteksi CSRF `Origin` |
| Validation | **Zod** | Validasi skema input request API |
| Storage | Local Filesystem (`storage/uploads/`) | Penyimpanan dan penyajian gambar lokal aman |

---


## Getting Started

Ikuti langkah berikut untuk menjalankan ARTIVA secara lokal.

### Prerequisites

- **Node.js** (disarankan v20+) dan **npm**
- **PostgreSQL**
- **Git**

### 1. Clone Repository

```bash
git clone https://github.com/ahmaddfauzi14/Artiva.git
cd ARTIVA
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Salin `.env.example` menjadi `.env.local` pada direktori utama project, lalu sesuaikan nilainya:

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

### 4. Setup Database

Pastikan layanan PostgreSQL sudah berjalan dan database `artiva` telah dibuat:

```sql
CREATE DATABASE artiva;
```

Kemudian jalankan migrasi skema dan seed data awal (kategori & akun admin):

```bash
npm run db:migrate
npm run db:seed
```

### 5. Run Development Server

```bash
npm run dev
```

Buka browser dan akses:

```text
http://localhost:3000
```

---

## Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Menjalankan development server Next.js |
| `npm run build` | Membuat production build |
| `npm run start` | Menjalankan production server |
| `npm run lint` | Menjalankan pemeriksaan kode dengan ESLint |
| `npm run db:migrate` | Menjalankan skrip migrasi tabel PostgreSQL (`scripts/migrate.js`) |
| `npm run db:seed` | Mengisi 6 kategori awal dan akun admin default (`scripts/seed.js`) |


---

## Project Vision

ARTIVA hadir untuk memberikan ruang bagi setiap kreator agar dapat menampilkan karya, membangun koneksi, dan mengembangkan kreativitas melalui satu ekosistem digital.

**Create. Connect. Compete.**

---

<p align="center">
  <strong>ARTIVA</strong><br/>
  Where Art Meets Community and Creativity.
</p>
