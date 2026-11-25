import Link from 'next/link';
import Footer from '@/components/layout/Footer';
import Navbar from '@/components/layout/Navbar';
import PageHeader from '@/components/layout/PageHeader';
import { getPublicViewer } from '@/lib/auth/page-guards';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Kebijakan Privasi · ARTIVA',
  description:
    'Penjelasan transparan mengenai data akun, karya, sesi cookie, dan kontrol privasi pengguna di ARTIVA.',
};

const SECTIONS = [
  {
    title: '1. Data Akun yang Disimpan',
    body: [
      'Saat mendaftar di ARTIVA, sistem menyimpan data dasar akun berupa username, alamat email, peran pengguna (Member atau Kurator), serta kata sandi yang telah di-hash secara satu arah menggunakan bcryptjs.',
      'Pengguna juga dapat melengkapi informasi profil publik secara sukarela seperti nama tampilan, bio singkat, foto profil, dan tautan situs atau portofolio eksternal.',
    ],
  },
  {
    title: '2. Karya Unggahan dan Aktivitas Komunitas',
    body: [
      'Gambar karya, judul, deskripsi, kategori, tag, komentar, serta pengajuan tantangan yang berstatus terbit ditampilkan secara publik agar dapat ditemukan oleh komunitas dan Kurator.',
      'Daftar karya favorit yang kamu simpan hanya ditampilkan pada ruang akun pribadi Member.',
    ],
  },
  {
    title: '3. Cookie Sesi dan Keamanan',
    body: [
      'ARTIVA menggunakan cookie sesi artiva_session dengan atribut httpOnly dan SameSite=Lax selama maksimal 7 hari untuk menjaga status login pengguna secara aman. Token sesi tidak dapat dibaca oleh skrip sisi klien.',
      'Permintaan pengubahan data dilindungi dengan validasi Origin dan pembatasan laju permintaan (rate limiting) pada jalur autentikasi dan interaksi utama.',
    ],
  },
  {
    title: '4. Kendali Pengguna atas Data',
    body: [
      'Pengguna dapat memperbarui detail profil, mengganti avatar, menyembunyikan atau menghapus karya, serta menghapus komentarnya sendiri kapan saja setelah masuk ke akun.',
      'Untuk pertanyaan terkait pengelolaan data atau kendala teknis platform, silakan kunjungi halaman Kontak & Dukungan.',
    ],
  },
];

export default async function PrivacyPage() {
  const user = await getPublicViewer();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={user} />

      <main className="mx-auto w-full max-w-[90rem] flex-1 space-y-10 px-4 py-10 sm:px-6 md:px-8 lg:py-12">
        <PageHeader
          eyebrow="PRIVASI & KEAMANAN"
          title="Kebijakan Privasi"
          subtitle="Penjelasan ringkas mengenai informasi yang disimpan oleh ARTIVA dan bagaimana pengguna memegang kendali atas datanya."
        />

        <div className="space-y-6 rounded-[28px] border border-line bg-surface p-6 shadow-card sm:p-8">
          {SECTIONS.map((section) => (
            <section
              key={section.title}
              className="space-y-2.5 border-b border-line/60 pb-6 last:border-b-0 last:pb-0"
            >
              <h2 className="text-xl font-semibold text-ink">
                {section.title}
              </h2>
              {section.body.map((paragraph, idx) => (
                <p
                  key={idx}
                  className="text-base leading-relaxed text-ink-soft"
                >
                  {paragraph}
                </p>
              ))}
            </section>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm text-ink-soft">
          <span>Lihat juga:</span>
          <Link
            href="/terms"
            className="inline-flex min-h-[44px] items-center font-semibold text-brand-700 hover:underline"
          >
            Ketentuan Penggunaan
          </Link>
          <Link
            href="/contact"
            className="inline-flex min-h-[44px] items-center font-semibold text-brand-700 hover:underline"
          >
            Kontak &amp; Dukungan
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
