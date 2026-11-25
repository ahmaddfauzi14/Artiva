<a id="top"></a>

<div align="center">

<!-- Project Banner -->
<img width="220" alt="ARTIVA Animated Logo" src="https://github.com/user-attachments/assets/1f19b19a-5b7e-47ec-8664-67456a15d9be" />

# 🎨 ARTIVA

> **Where Art Meets Community and Creativity** — Platform showcase karya seni digital, interaksi komunitas kreator, dan tantangan kreatif terkurasi dalam satu ekosistem web modern.

<p>
  <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-16.4.6-091326?style=for-the-badge&logo=nextdotjs&logoColor=F2C94C" alt="Next.js 16.4.6" /></a>
  <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-19.3.0-101F3D?style=for-the-badge&logo=react&logoColor=699EE8" alt="React 19.3.0" /></a>
  <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind_CSS-v4-101F3D?style=for-the-badge&logo=tailwindcss&logoColor=38BDF8" alt="Tailwind CSS v4" /></a>
  <a href="https://www.postgresql.org/"><img src="https://img.shields.io/badge/PostgreSQL-14_Tables-091326?style=for-the-badge&logo=postgresql&logoColor=F2C94C" alt="PostgreSQL" /></a>
  <a href="https://zod.dev/"><img src="https://img.shields.io/badge/Zod-v4.6-101F3D?style=for-the-badge&logo=zod&logoColor=699EE8" alt="Zod v4.6" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-F2C94C?style=for-the-badge&labelColor=091326" alt="MIT License" /></a>
</p>

<p>
  <a href="#about-the-project">🎨 About</a> •
  <a href="#features">✨ Features</a> •
  <a href="#preview">🖼️ Preview</a> •
  <a href="#tech-stack">🛠️ Tech Stack</a> •
  <a href="#getting-started">🚀 Getting Started</a> •
  <a href="#project-structure">📂 Structure</a> •
  <a href="#usage">🧭 Usage</a> •
  <a href="#contributing">🤝 Contributing</a> •
  <a href="#license">📜 License</a> •
  <a href="#author">👤 Author</a>
</p>

</div>

---

<a id="about-the-project"></a>
## About The Project

**ARTIVA** adalah platform showcase karya seni digital berbasis web yang menyatukan **portofolio kreator**, **interaksi komunitas**, dan **kompetisi kreatif terkurasi** dalam satu ekosistem terpadu.

Banyak platform seni memisahkan ruang pamer portofolio, diskusi komunitas, dan ajang kompetisi—sehingga kreator harus mengunggah ulang karya di berbagai tempat. ARTIVA memecahkan masalah ini melalui filosofi **"Satu Karya, Tiga Ruang untuk Bertumbuh"**: kreator cukup mengunggah karya **sekali** ke portofolio digital mereka, lalu langsung memaksimalkannya untuk pameran publik, apresiasi komunitas, dan pengajuan tantangan kreatif **tanpa proses re-upload**.

<table>
  <tr>
    <td width="33%" valign="top">
      <h3>🖼️ Creative Showcase</h3>
      <p>Ruang portofolio digital untuk memamerkan karya seni dengan filter kategori, pencarian judul cepat berbasis trigram (<code>pg_trgm</code>), tag, profil publik kreator, serta inspektur karya interaktif (<em>zoom, pan, &amp; lightbox</em>).</p>
    </td>
    <td width="33%" valign="top">
      <h3>💬 Creative Community</h3>
      <p>Ekosistem apresiasi antar kreator melalui fitur <strong>Suka (Like)</strong> dengan animasi <code>PulseHeart</code>, <strong>Simpan Favorit</strong>, dan <strong>Komentar</strong>, dilengkapi pelaporan pelanggaran terstruktur untuk menjaga kualitas komunitas.</p>
    </td>
    <td width="33%" valign="top">
      <h3>🏆 Creative Challenge</h3>
      <p>Wadah kompetisi tematik yang dikelola oleh <strong>Kurator terverifikasi</strong>. Member cukup memilih karya portofolio yang memenuhi syarat untuk ikut serta hingga penetapan 1–3 pemenang resmi di <strong>Winner Podium</strong>.</p>
    </td>
  </tr>
</table>

<details>
<summary><b>🧱 Klik untuk melihat arsitektur berlapis &amp; keamanan sistem ARTIVA</b></summary>

<br />

ARTIVA dibangun menggunakan **arsitektur berlapis (*layered architecture*)** di atas Next.js App Router:

```text
HTTP Request ──▶ Route Handler (withHandler + Same-Origin CSRF + Rate Limiter)
                     │
                     ▼
               Zod Validator (src/lib/validators/*)
                     │
                     ▼
               Service Layer (src/lib/services/* — aturan bisnis & transaksi ACID)
                     │
                     ▼
               Repository Layer (src/lib/repositories/* — parameterized SQL)
                     │
                     ▼
               PostgreSQL Database (pg Pool)
```

- **Autentikasi Cookie `httpOnly`**: Token JWT (`HS256` via `jose`, masa berlaku 7 hari) disimpan di cookie `artiva_session` dengan atribut `httpOnly`, `sameSite: 'lax'`, dan `secure` pada mode produksi.
- **Hashing Password**: Menggunakan `bcryptjs` untuk registrasi dan verifikasi kredensial.
- **Proteksi CSRF & Rate Limiting**: Seluruh mutasi API (`POST`, `PUT`, `PATCH`, `DELETE`) memvalidasi kesamaan `Origin`/`Referer` terhadap `Host`, dan endpoint sensitif dilindungi rate limiter (`checkRateLimit`).
- **Validasi Upload Lokal**: File gambar (`artworks`, `avatars`, `challenges`) dan dokumen CV kurator (`cvs`) divalidasi ukuran (`MAX_UPLOAD_MB`) serta **magic bytes** aslinya (`detectImageFormat` untuk JPEG/PNG/WEBP dan `detectDocumentFormat` untuk PDF/DOC/DOCX), disimpan dengan nama UUID di `storage/uploads/`, serta disajikan aman dari *path traversal* melalui `/api/uploads/[...path]`.

</details>

---

<a id="features"></a>
## Features

Klik setiap modul di bawah ini untuk menjelajahi fungsionalitas ARTIVA secara interaktif:

<details open>
<summary><b>🖼️ 1. Artwork Showcase &amp; Interactive Inspector</b></summary>

- **Eksplorasi Galeri Publik (`/artworks`)**: Filter berdasarkan kategori aktif, pencarian kata kunci judul (didukung indeks `GIN pg_trgm`), filter tag, dan paginasi.
- **Interactive Artwork Inspector (`/artworks/[id]`)**: Dilengkapi kontrol **Zoom**, **Pan (geser kanvas)**, dan tampilan **Lightbox layar penuh** untuk mengamati detail karya secara presisi.
- **Profil Publik Kreator (`/creators/[username]`)**: Menampilkan bio, tautan portofolio, avatar, serta seluruh karya publik milik kreator melalui komponen `ProfileCard`.
- **Kontrol Visibilitas Karya**: Mendukung status publikasi `published`, `hidden`, dan `removed` untuk pengelolaan portofolio dan moderasi.

</details>

<details>
<summary><b>💬 2. Creative Community &amp; Content Moderation</b></summary>

- **Apresiasi Karya**: Member aktif dapat memberikan **Like** (`PulseHeart`) dan menyimpan karya ke daftar **Favorit (`/me/favorites`)**.
- **Diskusi Komentar**: Menulis komentar pada halaman detail karya dan menghapus komentar milik sendiri (*soft delete* `visible` → `deleted`).
- **Pelaporan Pelanggaran**: Member aktif dapat melaporkan karya dengan alasan terstruktur (`spam`, `plagiarism`, `inappropriate`, `copyright`, `other`) agar ditinjau oleh Admin.
- **Tindak Lanjut Admin**: Admin meninjau laporan berstatus `pending`, lalu menyelesaikannya (`resolved`) dengan opsi penindakan karya/akun atau menolaknya (`dismissed`) beserta catatan resolusi.

</details>

<details>
<summary><b>🏆 3. Creative Challenge (Zero Re-Upload Workflow)</b></summary>

- **Penemuan Tantangan (`/challenges`)**: Menjelajahi tantangan berdasarkan status (`open`, `closed`, `announced`), kategori, periode tanggal, banner tantangan, dan galeri karya peserta.
- **Pengiriman Karya Portofolio (`/challenges/[id]/submit`)**: Member memilih karya miliknya yang berstatus `published` dan sesuai kategori tantangan (jika ditetapkan) tanpa perlu mengunggah ulang file gambar.
- **Tarik &amp; Kirim Ulang (`Withdraw`)**: Member dapat menarik pengajuan selama tantangan belum diumumkan dan mengirimkannya kembali sebelum tenggat berakhir.
- **Sinkronisasi Status Otomatis**: Server otomatis menutup tantangan `open` yang melewati `end_date` sesuai zona waktu aplikasi (`APP_TIMEZONE`).
- **Podium Pemenang Resmi**: Kurator menetapkan **1 hingga 3 pemenang** berperingkat unik (`1..n`) secara transaksional, yang langsung tampil di **Winner Podium** pada halaman tantangan dan beranda.

</details>

<details>
<summary><b>🛡️ 4. Curator Verification, CV Upload &amp; Admin Governance</b></summary>

- **Pendaftaran Kurator &amp; Upload CV (`/register/curator`)**: Calon Kurator mendaftar dengan status awal `pending` dan dapat melampirkan dokumen CV (PDF/DOC/DOCX) yang disimpan aman di `storage/uploads/cvs/`.
- **Mekanisme Banding (`/curator/verification`)**: Jika pengajuan ditolak (`rejected`), calon Kurator dapat memperbarui profil/dokumen CV serta mengajukan banding hingga maksimal **3 kali**, atau menghapus akunnya sendiri.
- **Dashboard Admin (`/dashboard/admin`)**: Menyediakan ringkasan statistik bento animatif (`AdminDashboardBento`), antrean aktivitas moderasi, verifikasi Kurator (beserta preview/unduh CV), manajemen kategori karya, pengelolaan status pengguna (`active` / `suspended`), dan penyelesaian laporan.

</details>

<details>
<summary><b>🎨 5. Editorial Visual Design, Interactive Effects &amp; FAQ</b></summary>

- **Tema Midnight Navy &amp; Warm Gold**: Palet `#091326` (canvas), `#101F3D` (surface), `#F7F3E6` (ink), dan aksen emas `#F2C94C` dengan tipografi **Poppins**.
- **Efek &amp; Mikro-Interaksi**: Komponen kustom `Aurora`, `GooeyNav`, `CircularGallery`, `GridMotion`, `TiltedCard`, `ProfileCard`, `PulseHeart`, `WinnerPodium`, serta bagian **FAQ interaktif** (`FaqSection`) pada beranda dengan dukungan `MotionContext` & `framer-motion`.
- **Ikon &amp; Primitif UI Konsisten**: Menggunakan **Hugeicons** (`@hugeicons/react`) dan primitif aksesibel dari **`@base-ui/react`**.

</details>

---

<a id="preview"></a>
## Preview

<div align="center">

<img src="docs/screenshots/preview.gif" alt="ARTIVA Preview — Beranda Hero, Galeri Karya CircularGallery, dan Tantangan Kreatif Terkurasi" width="100%" />

*Beranda Hero · Galeri & CircularGallery · Tantangan Terkurasi*

<img width="1066" height="666" alt="1" src="https://github.com/user-attachments/assets/ac46eabe-c5a4-44bc-8579-739467c9bf98" />
<img width="1628" height="4619" alt="landingpage_2_11zon" src="https://github.com/user-attachments/assets/9ffd29c7-c819-44f6-8052-3e6b81e51692" />

### 🖼️ Galeri Karya — CircularGallery & Filter Kategori

<img width="1066" height="666" alt="2" src="https://github.com/user-attachments/assets/f09bfa08-2f7d-4e1d-bf01-d7e117e2791c" />
<img width="2804" height="3234" alt="jelajahi" src="https://github.com/user-attachments/assets/65c98dda-ed85-4761-b40e-3a34921307fb" />

### 🏆 Tantangan Kreatif — Kompetisi Terkurasi

<img width="1066" height="666" alt="Pi7_GIF_CMP (2)" src="https://github.com/user-attachments/assets/e8cce001-656b-4052-bd52-6d2f5d8797ea" />
<img width="495" height="1731" alt="tantangan_1_11zon" src="https://github.com/user-attachments/assets/e5536628-796b-4294-b232-2ccf4eb9ce1c" />

</div>

---

<a id="tech-stack"></a>
## Tech Stack

<p align="left">
  <img src="https://skillicons.dev/icons?i=nextjs,react,tailwind,postgres,nodejs,git" alt="Tech Stack Icons" />
</p>

- **Frontend**: Next.js `16.4.6` (App Router, Turbopack), React `19.3.0`, Tailwind CSS `v4` (`@tailwindcss/turbopack`), Framer Motion `^14.14.0`, Base UI (`@base-ui/react`), Hugeicons (`@hugeicons/react`), Lucide Icons, Tabler Icons, Poppins Font
- **Backend**: Next.js Route Handlers (REST API), Layered Service & Repository Pattern, `jose` (`^6.2.18`) untuk JWT `HS256`, `bcryptjs` (`^3.0.3`) untuk hashing password, Zod (`^4.6.7`) untuk validasi input, Same-Origin CSRF & Rate Limiting
- **Database**: PostgreSQL via `pg` (`^8.23.1`) — 14 tabel relasional + `schema_migrations` + ekstensi `pg_trgm` untuk pencarian judul karya cepat
- **Tools**: Node.js `v20+`, npm, ESLint `^9` (`eslint-config-next`), Local Filesystem Storage (`storage/uploads/`) dengan verifikasi *magic-bytes*, Git & GitHub

<details>
<summary><b>🗄️ Klik untuk melihat rincian skema &amp; diagram ERD 14 tabel PostgreSQL (<code>db/migrations/001_init.sql</code>)</b></summary>

| Domain | Tabel | Fungsi Utama |
| :--- | :--- | :--- |
| **Akun &amp; Kurator** | `users`, `profiles`, `curator_verifications` | Data autentikasi, peran (`admin`, `member`, `curator`), status akun (`active`, `pending`, `suspended`), profil publik, dokumen CV, serta riwayat verifikasi &amp; banding Kurator. |
| **Karya &amp; Taksonomi** | `categories`, `artworks`, `tags`, `artwork_tags` | Katalog kategori, metadata karya &amp; `image_path`, status publikasi (`published`, `hidden`, `removed`), serta relasi *many-to-many* tag karya. |
| **Komunitas &amp; Moderasi** | `likes`, `favorites`, `comments`, `reports` | Apresiasi like/favorit (composite PK), komentar (`visible`/`deleted`), dan pelaporan pelanggaran (`pending`, `resolved`, `dismissed`). |
| **Tantangan &amp; Pemenang** | `challenges`, `submissions`, `winners` | Tantangan Kurator (`draft`, `open`, `closed`, `announced`), pengajuan karya unik per tantangan (`submitted`/`withdrawn`), dan penetapan peringkat 1–3 unik. |

```mermaid
erDiagram
    users ||--o| profiles : "memiliki (user_id)"
    users ||--o{ curator_verifications : "mengajukan (user_id)"
    users |o--o{ curator_verifications : "meninjau (reviewed_by)"
    users ||--o{ artworks : "mengunggah (user_id)"
    users ||--o{ likes : "menyukai (user_id)"
    users ||--o{ favorites : "menyimpan (user_id)"
    users ||--o{ comments : "menulis (user_id)"
    users ||--o{ challenges : "membuat (curator_id)"
    users ||--o{ reports : "melaporkan (reporter_id)"
    users |o--o{ reports : "menangani (handled_by)"

    categories ||--o{ artworks : "mengkategorikan (category_id)"
    categories |o--o{ challenges : "opsional (category_id)"

    artworks ||--o{ artwork_tags : "memiliki (artwork_id)"
    tags ||--o{ artwork_tags : "digunakan (tag_id)"
    artworks ||--o{ likes : "disukai (artwork_id)"
    artworks ||--o{ favorites : "difavoritkan (artwork_id)"
    artworks ||--o{ comments : "dikomentari (artwork_id)"
    artworks ||--o{ submissions : "diajukan (artwork_id)"
    artworks ||--o{ reports : "dilaporkan (artwork_id)"

    challenges ||--o{ submissions : "menerima (challenge_id)"
    challenges ||--o{ winners : "menetapkan (challenge_id)"
    submissions ||--o| winners : "menang (submission_id)"

    users {
        serial user_id PK
        varchar username UK
        varchar email UK
        varchar password_hash
        user_role role
        user_status status
        timestamptz created_at
    }

    profiles {
        serial profile_id PK
        int user_id FK,UK
        varchar display_name
        text bio
        varchar avatar_path
        varchar website
    }

    curator_verifications {
        serial verification_id PK
        int user_id FK
        int reviewed_by FK
        verification_status status
        text note
        text appeal_note
        varchar cv_path
        timestamptz submitted_at
        timestamptz reviewed_at
    }

    categories {
        serial category_id PK
        varchar name UK
        varchar slug UK
        text description
        boolean is_active
    }

    artworks {
        serial artwork_id PK
        int user_id FK
        int category_id FK
        varchar title
        text description
        varchar image_path
        artwork_status status
        timestamptz created_at
        timestamptz updated_at
    }

    tags {
        serial tag_id PK
        varchar name UK
    }

    artwork_tags {
        int artwork_id PK,FK
        int tag_id PK,FK
    }

    likes {
        int user_id PK,FK
        int artwork_id PK,FK
        timestamptz created_at
    }

    favorites {
        int user_id PK,FK
        int artwork_id PK,FK
        timestamptz created_at
    }

    comments {
        serial comment_id PK
        int artwork_id FK
        int user_id FK
        text content
        comment_status status
        timestamptz created_at
    }

    challenges {
        serial challenge_id PK
        int curator_id FK
        int category_id FK
        varchar title
        text description
        text rules
        text prize
        varchar banner_path
        date start_date
        date end_date
        challenge_status status
        timestamptz created_at
    }

    submissions {
        serial submission_id PK
        int challenge_id FK
        int artwork_id FK
        submission_status status
        timestamptz submitted_at
        timestamptz withdrawn_at
    }

    winners {
        serial winner_id PK
        int challenge_id FK
        int submission_id FK,UK
        smallint rank
        timestamptz announced_at
    }

    reports {
        serial report_id PK
        int reporter_id FK
        int artwork_id FK
        int handled_by FK
        varchar reason
        text description
        report_status status
        text resolution_note
        timestamptz created_at
    }
```

</details>

---

<a id="getting-started"></a>
## Getting Started

Ikuti langkah-langkah berikut untuk menjalankan **ARTIVA** di lingkungan lokal Anda.

### Prerequisites

- **Node.js** `v20+` (mendukung `process.loadEnvFile` yang dipakai skrip migrasi dan seed)
- **npm**
- **PostgreSQL** (lokal atau Docker container)
- **Git**

### Installation

1. Clone the repository.

```bash
git clone https://github.com/ahmaddfauzi14/Artiva.git
```

2. Navigate to the project directory.

```bash
cd Artiva
```

3. Install dependencies.

```bash
npm install
```

4. Configure environment variables.

Salin file `.env.example` menjadi `.env.local` (pada Windows Command Prompt gunakan `copy .env.example .env.local`):

```bash
cp .env.example .env.local
```

<details>
<summary><b>⚙️ Klik untuk melihat daftar lengkap variabel environment</b></summary>

| Variabel | Keterangan | Contoh / Default |
| :--- | :--- | :--- |
| `DATABASE_URL` | String koneksi PostgreSQL | `postgres://user:pass@localhost:5432/artiva` |
| `SESSION_SECRET` | Kunci rahasia penandatanganan JWT (min. 32 karakter) | String acak 32+ karakter |
| `APP_TIMEZONE` | Zona waktu acuan untuk penutupan otomatis tantangan | `Asia/Makassar` |
| `UPLOAD_DIR` | Direktori penyimpanan upload karya, avatar, banner, &amp; CV | `./storage/uploads` |
| `MAX_UPLOAD_MB` | Batas maksimum ukuran file unggahan (MB) | `5` |
| `SEED_ADMIN_USERNAME` | Username akun Admin awal saat menjalankan `seed.js` | `admin` |
| `SEED_ADMIN_EMAIL` | Email akun Admin awal | `admin@artiva.local` |
| `SEED_ADMIN_PASSWORD` | Password akun Admin awal | `ganti-saya` |

</details>

5. Setup database, jalankan migrasi & seed, lalu jalankan development server.

Buat database PostgreSQL `artiva` terlebih dahulu (`CREATE DATABASE artiva;`), kemudian jalankan migrasi dan seed:

```bash
node scripts/migrate.js
node scripts/seed.js
```

<details>
<summary><b>🧪 Opsional: Isi dataset demo lengkap (karya, kreator, kurator, tantangan, CV, &amp; laporan)</b></summary>

Jalankan skrip idempoten [`scripts/seed-dummy.js`](scripts/seed-dummy.js) untuk mengisi galeri dengan dataset lengkap beserta variasi status moderasi dan tantangan:

```bash
node scripts/seed-dummy.js
```

- Menambahkan kategori (termasuk `Lukisan`), puluhan akun kreator &amp; kurator (password default akun demo: `ArtivaDummy2026!`), karya (`published`, `hidden`, `removed`), data like/favorit/komentar, tantangan (`draft`, `open`, `closed`, `announced`), pemenang, dokumen CV kurator, serta contoh laporan moderasi (`pending`, `resolved`, `dismissed`).
- Aset gambar karya, avatar, banner tantangan, dan CV demo sudah tersedia di `storage/uploads/`.

</details>

Jalankan server pengembangan:

```bash
npm run dev
```

Buka browser dan akses **[http://localhost:3000](http://localhost:3000)** 🎉

---

<a id="project-structure"></a>
## Project Structure

Struktur direktori berikut telah disesuaikan dengan susunan terbaru project **ARTIVA** saat ini:

```text
Artiva/
├── db/
│   └── migrations/
│       └── 001_init.sql                # Skema 14 tabel PostgreSQL, 8 ENUM, & indeks pg_trgm
├── public/
│   ├── images/
│   │   └── artiva-logo.png             # Logo & ikon aplikasi ARTIVA
│   └── *.svg                           # Aset SVG publik
├── scripts/
│   ├── migrate.js                      # Runner migrasi SQL idempoten (schema_migrations)
│   ├── seed.js                         # Seed 6 kategori awal & akun Admin default
│   └── seed-dummy.js                   # Seed dataset demo lengkap (karya, tantangan, CV, laporan)
├── storage/
│   └── uploads/
│       ├── artworks/                   # Penyimpanan lokal file gambar karya
│       ├── avatars/                    # Penyimpanan lokal foto profil/avatar kreator
│       ├── challenges/                 # Penyimpanan lokal banner tantangan kreatif
│       └── cvs/                        # Penyimpanan lokal dokumen CV verifikasi kurator (PDF/DOC/DOCX)
├── src/
│   ├── app/                            # Next.js App Router (Pages & REST API Route Handlers)
│   │   ├── about/                      # Halaman Tentang ARTIVA
│   │   ├── api/                        # Endpoint REST API (/api/*)
│   │   │   ├── admin/                  # categories, curator-verifications (+ cv), reports, stats, users
│   │   │   ├── artworks/               # daftar/detail karya, like, favorite, comments, reports
│   │   │   ├── auth/                   # login, logout, me, register/{member,curator}
│   │   │   ├── categories/             # Daftar kategori aktif
│   │   │   ├── challenges/             # daftar/detail tantangan, eligible-artworks, submissions
│   │   │   ├── comments/[id]/          # Hapus komentar (soft delete)
│   │   │   ├── creators/[username]/    # Data profil publik kreator
│   │   │   ├── curator/                # account, challenges (+ publish, submissions, winners), verification (+ cv)
│   │   │   ├── me/                     # account, artworks, favorites, profile, submissions
│   │   │   ├── submissions/[id]/       # Tarik pengajuan tantangan (withdraw)
│   │   │   └── uploads/[...path]/      # Penyajian file upload lokal yang aman
│   │   ├── artworks/                   # Galeri publik & detail karya (+ zoom/pan inspector)
│   │   ├── challenges/                 # Daftar tantangan, detail, podium, artwork peserta, & submit
│   │   ├── contact/                    # Halaman Kontak
│   │   ├── creators/[username]/        # Halaman profil publik kreator
│   │   ├── curator/
│   │   │   ├── (active)/               # Workspace Kurator aktif (dashboard, challenges, winners, profile)
│   │   │   └── verification/           # Halaman status verifikasi, upload CV, & banding Kurator
│   │   ├── dashboard/admin/            # Dashboard Admin (stats, categories, curators, reports, users)
│   │   ├── login/                      # Halaman masuk pengguna
│   │   ├── me/                         # Workspace Member (artworks, favorites, profile, submissions)
│   │   ├── privacy/                    # Kebijakan Privasi
│   │   ├── register/                   # Registrasi akun Member & Kurator
│   │   ├── terms/                      # Syarat & Ketentuan
│   │   ├── globals.css                 # Tema Midnight Navy & Warm Gold + token Tailwind v4
│   │   ├── layout.js                   # Root layout (Poppins, Aurora, MotionProvider, ToastProvider)
│   │   ├── not-found.js                # Halaman 404 kustom
│   │   └── page.js                     # Halaman Beranda utama
│   ├── components/
│   │   ├── cards/                      # ArtworkCard, ChallengeCard, StepCard, WinnerPodium
│   │   ├── effects/                    # Aurora, CircularGallery, GooeyNav, GridMotion, MotionContext, ProfileCard, PulseHeart, TiltedCard
│   │   ├── features/                   # Modul fitur per domain:
│   │   │   ├── admin/                  # AdminActivityQueue, AdminCategories, AdminCurators, AdminDashboardBento, AdminReports, AdminUsers
│   │   │   ├── artworks/               # ArtworkDetail, ArtworkDetailView, ArtworkExplorer, ArtworkShowcaseGallery
│   │   │   ├── auth/                   # AccountCredentialsFields, LoginForm, RegisterCuratorForm, RegisterMemberForm, RoleSelector
│   │   │   ├── challenges/             # ChallengeDetailView, ChallengeExplorer, ChallengeSubmitForm
│   │   │   ├── creators/               # CreatorProfile
│   │   │   ├── curator/                # ChallengeEditorForm, CuratorChallenges, CuratorSubmissions, CuratorVerification, CuratorWinners
│   │   │   ├── home/                   # FaqSection, HomeSearchBox
│   │   │   └── member/                 # ArtworkEditorForm, MemberArtworks, MemberSubmissions, ProfileOverview, ProfileSettings
│   │   ├── layout/                     # AccountNavPills, ArtivaLogo, AuthShell, DashboardShell, Footer, LegalPageLayout, Navbar, PageHeader, PublicShell, SectionHeader, Sidebar
│   │   └── ui/                         # Alert, Avatar, Button, Chip, ConfirmModal, DataTable, DocumentUploader, EmptyState, FormField, ImageUploader, Pagination, SearchBar, Select, SidebarPrimitive, Skeleton, StatusBadge, Toast
│   └── lib/
│       ├── auth/                       # guards.js, page-guards.js, password.js, session.js
│       ├── repositories/               # Query SQL berparameter (admin, artworks, categories, challenges, curator-challenges, interactions, reports, submissions, users, verifications)
│       ├── server/                     # artwork-detail, challenge-detail, challenge-status, db, http, rate-limit, uploads
│       ├── shared/                     # api-client, error-messages, format, navigation, permissions, stagger, status-styles
│       └── validators/                 # Skema validasi Zod (admin, artworks, auth, challenges, interactions, reports, submissions, verifications, winners)
├── .env.example                        # Template konfigurasi environment variables
├── AGENTS.md                           # Catatan aturan Next.js untuk agen AI
├── components.json                     # Konfigurasi komponen UI
├── eslint.config.mjs                   # Konfigurasi ESLint
├── jsconfig.json                       # Konfigurasi path alias (@/*)
├── LICENSE                             # Lisensi MIT
├── next.config.mjs                     # Konfigurasi Next.js, Turbopack, & URL redirects
├── package.json                        # Dependensi & script npm
└── README.md                           # Dokumentasi project
```

<details>
<summary><b>🔌 Klik untuk melihat ringkasan Endpoint REST API (<code>src/app/api/</code>)</b></summary>

| Grup | Endpoint Utama | Fungsi |
| :--- | :--- | :--- |
| **Auth** | `POST /api/auth/register/member`, `POST /api/auth/register/curator`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me` | Registrasi Member/Kurator, login/logout cookie JWT, &amp; info sesi aktif |
| **Public Discovery** | `GET /api/categories`, `GET /api/artworks`, `GET /api/artworks/[id]`, `GET /api/challenges`, `GET /api/challenges/[id]`, `GET /api/creators/[username]` | Eksplorasi kategori, karya, tantangan, pemenang, &amp; profil kreator |
| **Interaksi &amp; Laporan** | `PUT/DELETE /api/artworks/[id]/like`, `PUT/DELETE /api/artworks/[id]/favorite`, `GET/POST /api/artworks/[id]/comments`, `DELETE /api/comments/[id]`, `POST /api/artworks/[id]/reports` | Like, simpan favorit, komentar karya, &amp; laporkan pelanggaran (Member aktif) |
| **Member Workspace** | `GET/POST /api/me/artworks`, `GET/PATCH/DELETE /api/me/artworks/[id]`, `GET /api/me/favorites`, `PATCH /api/me/profile`, `PATCH /api/me/account`, `GET /api/me/submissions` | Kelola karya portofolio, favorit, profil/akun, &amp; riwayat submission |
| **Challenge Submission** | `GET /api/challenges/[id]/eligible-artworks`, `GET/POST /api/challenges/[id]/submissions`, `POST /api/submissions/[id]/withdraw` | Cek karya layak, kirim karya ke tantangan, &amp; tarik submission |
| **Curator Workspace** | `GET/POST /api/curator/verification`, `POST /api/curator/verification/cv`, `DELETE /api/curator/account`, `GET/POST /api/curator/challenges`, `GET/PATCH/DELETE /api/curator/challenges/[id]`, `POST .../publish`, `GET .../submissions`, `POST .../winners` | Status verifikasi/banding (+ CV), kelola tantangan, tinjau peserta, &amp; tetapkan 1–3 pemenang |
| **Admin Governance** | `GET /api/admin/stats`, `GET/POST /api/admin/categories`, `PATCH/DELETE /api/admin/categories/[id]`, `GET /api/admin/curator-verifications`, `GET .../cv`, `POST .../approve`, `POST .../reject`, `GET /api/admin/users`, `GET/PATCH/DELETE /api/admin/users/[id]`, `GET /api/admin/reports`, `POST .../resolve`, `POST .../dismiss` | Statistik, kelola kategori, verifikasi Kurator (+ unduh CV), kelola akun, &amp; moderasi laporan |
| **Uploads** | `GET /api/uploads/[...path]` | Menyajikan file lokal secara aman dengan validasi path &amp; MIME |

</details>

---

<a id="usage"></a>
## Usage

Alur penggunaan **ARTIVA** terbagi berdasarkan peran pengguna (*Role-Based Access Control*) yang divalidasi di sisi halaman (`src/lib/auth/page-guards.js`) dan API (`src/lib/auth/guards.js`).

### 🔄 Alur Ekosistem Terpadu

```mermaid
flowchart LR
    P["🌐 Public User"] -->|"Jelajahi Galeri & Pemenang"| G["🖼️ Showcase & Tantangan"]

    M["🧑‍🎨 Member (Active)"] -->|"Upload Karya"| A["🎨 Portofolio Karya"]
    A -->|"Like / Favorit / Komentar / Lapor"| C["💬 Interaksi Komunitas"]
    A -->|"Submit Tanpa Re-Upload"| S["📩 Submission Tantangan"]

    K["🏛️ Calon Kurator"] -->|"Daftar + Upload CV"| V{"🛡️ Verifikasi Admin"}
    V -->|"Disetujui"| KA["✅ Kurator Active"]
    V -->|"Ditolak"| B["📝 Banding (Maks. 3x) / Hapus Akun"]
    B --> V

    KA -->|"Buat & Publikasikan"| T["🏆 Tantangan (Draft → Open)"]
    S --> T
    T -->|"Melewati end_date"| CL["🔒 Closed"]
    CL -->|"Tetapkan 1–3 Pemenang"| AN["🥇 Announced (Podium)"]

    AD["🛡️ Admin"] -->|"Moderasi Laporan, Kategori & Akun"| G
```

### 🧭 Flowchart Detail per Role

Klik setiap role di bawah ini untuk melihat alur penggunaan secara detail:

<details open>
<summary><b>🌐 1. Flowchart Public User (Pengunjung Tanpa Login)</b></summary>

```mermaid
flowchart TD
    Start(["Mulai: Kunjungi Beranda (/)"]) --> Explore{"Pilih Jalur Eksplorasi"}

    Explore -->|"Cari / Jelajahi Karya"| Gallery["Galeri Publik (/artworks)"]
    Gallery --> FilterArt["Filter Kategori, Tag, & Pencarian Judul (pg_trgm)"]
    FilterArt --> DetailArt["Detail Karya (/artworks/[id])"]
    DetailArt --> Inspect["Inspeksi Karya: Zoom, Pan, Lightbox & Baca Komentar"]
    DetailArt --> CreatorProf["Kunjungi Profil Kreator (/creators/[username])"]

    Explore -->|"Jelajahi Kompetisi"| Challenges["Daftar Tantangan (/challenges)"]
    Challenges --> FilterCh["Filter Status: Open / Closed / Announced"]
    FilterCh --> DetailCh["Detail Tantangan (/challenges/[id])"]
    DetailCh --> ViewEntries["Lihat Karya Peserta & Winner Podium"]

    Explore -->|"Ingin Berinteraksi / Berpartisipasi"| AuthChoice{"Sudah Punya Akun?"}
    AuthChoice -->|"Sudah"| Login["Masuk (/login)"]
    AuthChoice -->|"Daftar Kreator"| RegMember["Daftar Member (/register/member)"]
    AuthChoice -->|"Daftar Kurator"| RegCurator["Daftar Kurator (/register/curator)"]
```

</details>

<details>
<summary><b>🧑‍🎨 2. Flowchart Member (Kreator &amp; Peserta Komunitas)</b></summary>

```mermaid
flowchart TD
    Auth(["Masuk (/login) atau Daftar (/register/member)"]) --> Active["Akun Member Active (/me)"]
    Active --> Menu{"Pilih Aktivitas Member"}

    Menu -->|"Kelola Portofolio"| MyArt["Karya Saya (/me/artworks)"]
    MyArt --> Upload["Tambah Karya (/me/artworks/new): Upload Gambar, Kategori & Tag"]
    Upload --> Vis{"Atur Visibilitas"}
    Vis -->|"published"| Pub["Tampil di Galeri Publik & Siap Ikut Tantangan"]
    Vis -->|"hidden"| Hid["Disembunyikan dari Publik"]
    MyArt --> EditDel["Edit (/me/artworks/[id]/edit) atau Hapus Karya"]

    Menu -->|"Interaksi Komunitas"| ArtPage["Buka Detail Karya (/artworks/[id])"]
    ArtPage --> Interact["Like (PulseHeart), Simpan Favorit (/me/favorites), & Komentar"]
    ArtPage --> Report["Laporkan Pelanggaran Karya (spam/plagiarism/inappropriate/copyright)"]

    Menu -->|"Ikut Tantangan"| ChPage["Buka Tantangan Open (/challenges/[id])"]
    ChPage --> SubmitForm["Ajukan Karya (/challenges/[id]/submit): Pilih Karya Published (Zero Re-Upload)"]
    SubmitForm --> SubStatus["Status: submitted (Pantau di /me/submissions)"]
    SubStatus --> WithdrawCheck{"Masih Open & Belum Announced?"}
    WithdrawCheck -->|"Tarik Pengajuan"| Withdraw["Withdraw Submission (Dapat Diajukan Ulang)"]
    WithdrawCheck -->|"Tunggu Hasil"| Announced["Pengumuman Pemenang di Winner Podium"]

    Menu -->|"Atur Profil"| Prof["Profil & Akun (/me/profile & /me/profile/edit)"]
```

</details>

<details>
<summary><b>🏛️ 3. Flowchart Curator (Penyelenggara Tantangan)</b></summary>

```mermaid
flowchart TD
    Reg(["Daftar Kurator (/register/curator) + Upload CV (PDF/DOC/DOCX)"]) --> Pending["Status Awal: pending (/curator/verification)"]
    Pending --> Review{"Hasil Verifikasi Admin"}

    Review -->|"approved"| Active["Akun Kurator Active (/curator)"]
    Review -->|"rejected"| Rejected["Status: rejected + Catatan Penolakan Admin"]
    Rejected --> Choice{"Tindakan Calon Kurator"}
    Choice -->|"Banding (Maks. 3x)"| Appeal["Perbarui Profil, Upload CV Baru & Kirim Banding"]
    Appeal --> Pending
    Choice -->|"Batalkan Pendaftaran"| DeleteAcc["Hapus Akun Permanen"]

    Active --> CMenu{"Aktivitas Kurator Aktif"}
    CMenu -->|"Profil"| CProf["Kelola Profil Kurator (/curator/profile)"]
    CMenu -->|"Tantangan"| CList["Kelola Tantangan (/curator/challenges)"]

    CList --> NewCh["Buat Tantangan (/curator/challenges/new) + Banner -> Status: draft"]
    NewCh --> Publish["Publikasikan Tantangan -> Status: open"]
    Publish --> MonitorSub["Tinjau Karya Peserta (/curator/challenges/[id]/submissions)"]
    MonitorSub --> Deadline{"Melewati end_date (APP_TIMEZONE)?"}
    Deadline -->|"Otomatis oleh Server"| Closed["Status: closed (Siap Penjurian)"]
    Closed --> PickWinners["Tetapkan 1–3 Pemenang Unik (/curator/challenges/[id]/winners)"]
    PickWinners --> Final["Status: announced -> Tampil di Winner Podium"]
```

</details>

<details>
<summary><b>🛡️ 4. Flowchart Admin (Tata Kelola &amp; Moderasi)</b></summary>

```mermaid
flowchart TD
    AdminLogin(["Login Akun Admin (/login)"]) --> Dash["Dashboard Admin (/dashboard/admin): Bento Stats & Activity Queue"]
    Dash --> AMenu{"Pilih Modul Tata Kelola"}

    AMenu -->|"Verifikasi Kurator"| CurList["Daftar Pengajuan (/dashboard/admin/curators)"]
    CurList --> CurDetail["Detail Pengajuan (/dashboard/admin/curators/[id]): Tinjau Profil, Banding & Unduh CV"]
    CurDetail --> CurDec{"Keputusan Admin"}
    CurDec -->|"Approve"| ApproveCur["Setujui -> Akun Kurator Menjadi active"]
    CurDec -->|"Reject + Catatan"| RejectCur["Tolak -> Calon Kurator Dapat Banding (Maks. 3x)"]

    AMenu -->|"Moderasi Laporan"| RepList["Daftar Laporan (/dashboard/admin/reports)"]
    RepList --> RepDetail["Detail Laporan (/dashboard/admin/reports/[id])"]
    RepDetail --> RepDec{"Keputusan Laporan"}
    RepDec -->|"Resolve + Catatan"| ResolveRep["Tindak Karya (hidden / removed) -> Status: resolved"]
    RepDec -->|"Dismiss + Catatan"| DismissRep["Tolak Laporan -> Status: dismissed"]

    AMenu -->|"Manajemen Pengguna"| UserList["Daftar Pengguna (/dashboard/admin/users)"]
    UserList --> UserDetail["Detail Pengguna (/dashboard/admin/users/[id]): Suspend / Aktifkan / Hapus Akun"]

    AMenu -->|"Manajemen Kategori"| CatPage["Kategori Karya (/dashboard/admin/categories): Tambah, Edit, Aktif/Nonaktifkan"]
```

</details>

### Matriks Hak Akses Pengguna

| Peran | Status Awal | Jelajah Publik | Upload &amp; Kelola Karya | Like, Favorit, Komentar &amp; Lapor | Ikut Tantangan | Buat Tantangan &amp; Pilih Pemenang | Verifikasi &amp; Moderasi |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| 🌐 **Public User** | — | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| 🧑‍🎨 **Member** | `active` | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| 🏛️ **Curator** | `pending` → `active` | ✅ | ❌ *(kelola tantangan)* | ❌ *(fokus kurasi)* | ❌ | ✅ *(jika active)* | ❌ |
| 🛡️ **Admin** | `active` | ✅ | ❌ *(moderasi status)* | ❌ | ❌ | ❌ | ✅ |

<details>
<summary><b>🧭 Panduan cepat penggunaan untuk setiap peran &amp; daftar skrip npm</b></summary>

1. **Public User**: Jelajahi galeri `/artworks`, gunakan pencarian &amp; filter tag, inspeksi karya dengan fitur *Zoom/Pan/Lightbox*, kunjungi `/creators/[username]`, atau lihat `/challenges` beserta podium pemenang.
2. **Member**: Daftar di `/register/member`, unggah karya di `/me/artworks/new`, beri *Like/Favorit/Komentar* pada karya kreator lain, dan daftarkan karya portofolio Anda ke tantangan aktif melalui `/challenges/[id]/submit`.
3. **Curator**: Daftar di `/register/curator` sambil melampirkan CV, pantau verifikasi di `/curator/verification`, lalu setelah berstatus `active`, buat tantangan di `/curator/challenges/new`, publikasikan, tinjau karya peserta, dan tetapkan 1–3 pemenang resmi.
4. **Admin**: Masuk menggunakan akun admin (`SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`) untuk mengakses `/dashboard/admin` guna memverifikasi pengajuan Kurator, mengelola kategori, mengatur status akun pengguna, dan menyelesaikan laporan moderasi.

| Perintah | Deskripsi |
| :--- | :--- |
| `npm run dev` | Menjalankan development server Next.js |
| `npm run build` | Membangun production build |
| `npm run start` | Menjalankan production server hasil build |
| `npm run lint` | Menjalankan pemeriksaan kode dengan ESLint |
| `node scripts/migrate.js` | Menerapkan migrasi skema PostgreSQL dari `db/migrations/` |
| `node scripts/seed.js` | Mengisi 6 kategori awal dan akun Admin default secara idempoten |
| `node scripts/seed-dummy.js` | Mengisi dataset demo lengkap (karya, kreator, kurator, tantangan, CV, &amp; laporan) |

</details>

---

<a id="contributing"></a>
## Contributing

Contributions, issues, and feature requests are welcome!

Jika Anda ingin berkontribusi pada pengembangan **ARTIVA**:

1. **Fork** repositori ini.
2. Buat branch fitur atau perbaikan baru (`git checkout -b feat/nama-fitur`).
3. Commit perubahan Anda dengan pesan yang jelas (`git commit -m "feat: deskripsi singkat perubahan"`).
4. Push ke branch tersebut (`git push origin feat/nama-fitur`).
5. Buka **Pull Request** dan jelaskan perubahan yang Anda buat.

> [!NOTE]
> Pastikan kode lolos pemeriksaan linter (`npm run lint`) sebelum mengajukan Pull Request.

---

<a id="license"></a>
## License

Project ini didisensikan di bawah **[MIT License](LICENSE)** (`Copyright (c) 2026 ahmaddfauzi14`). Lihat berkas [LICENSE](LICENSE) untuk detail lengkap.

---

<a id="author"></a>
## Author

**ahmaddfauzi14**

- GitHub: [@ahmaddfauzi14](https://github.com/ahmaddfauzi14)
- Repository: [ahmaddfauzi14/Artiva](https://github.com/ahmaddfauzi14/Artiva)

> *"ARTIVA hadir untuk memberikan ruang bagi setiap kreator agar dapat menampilkan karya, membangun koneksi, dan mengembangkan kreativitas melalui satu ekosistem digital."*
>
> **Create. Connect. Compete.**

<div align="center">
  <br />
  <a href="#top">⬆️ Kembali ke Atas</a>
  <br /><br />
  <strong>ARTIVA</strong> — <em>Where Art Meets Community and Creativity.</em>
</div>
