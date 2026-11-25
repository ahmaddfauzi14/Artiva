import Link from 'next/link';
import Footer from '@/components/layout/Footer';
import Navbar from '@/components/layout/Navbar';
import PageHeader from '@/components/layout/PageHeader';
import { getPublicViewer } from '@/lib/auth/page-guards';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Ketentuan Penggunaan · ARTIVA',
  description:
    'Ketentuan publikasi karya, interaksi komunitas, tantangan terkurasi, dan moderasi konten di platform ARTIVA.',
};

const SECTIONS = [
  {
    title: '1. Kepemilikan dan Orisinalitas Karya',
    body: [
      'Setiap kreator tetap memegang penuh hak cipta atas karya seni digital yang diunggah ke ARTIVA. Dengan mempublikasikan karya, kreator memberikan izin kepada ARTIVA untuk menampilkannya di galeri publik, profil kreator, dan halaman tantangan yang diikuti.',
      'Kreator bertanggung jawab memastikan bahwa karya yang diunggah merupakan hasil karya sendiri atau memiliki izin yang sah, serta tidak melanggar hak cipta pihak lain maupun aturan komunitas.',
    ],
  },
  {
    title: '2. Status Publikasi dan Moderasi Konten',
    body: [
      'Member dapat mengatur visibilitas karyanya antara status terbit (published) dan tersembunyi (hidden) kapan saja melalui ruang kelola karya.',
      'Pengguna yang menemukan karya bermasalah dapat mengirimkan laporan melalui halaman detail karya. Tim Admin berhak meninjau laporan tersebut dan menurunkan karya (removed) apabila terbukti melanggar ketentuan platform.',
    ],
  },
  {
    title: '3. Interaksi Komunitas',
    body: [
      'Fitur suka, favorit, dan komentar disediakan untuk mendukung apresiasi visual secara konstruktif. Komentar yang mengandung spam, pelecehan, atau ujaran kebencian tidak diperkenankan di ARTIVA.',
      'Pengguna dapat menghapus komentar yang ditulisnya sendiri secara langsung melalui halaman detail karya.',
    ],
  },
  {
    title: '4. Tantangan Kreatif dan Penetapan Pemenang',
    body: [
      'Hanya karya berstatus terbit yang memenuhi kategori tantangan yang dapat dikirimkan oleh Member ke tantangan berstatus terbuka (open). Member dapat menarik pengajuan (withdraw) selama pemenang belum diumumkan.',
      'Kurator terverifikasi meninjau seluruh karya peserta secara independen dan menetapkan 1 sampai 3 pemenang resmi yang ditampilkan secara terbuka pada halaman tantangan serta beranda.',
    ],
  },
  {
    title: '5. Akun, Verifikasi Kurator, dan Penangguhan',
    body: [
      'Akun Member langsung aktif setelah registrasi, sedangkan akun Kurator memerlukan persetujuan verifikasi dari Admin sebelum dapat membuat dan mempublikasikan tantangan. Pengajuan yang ditolak dapat diajukan banding melalui halaman status verifikasi.',
      'Admin dapat menangguhkan akun yang melakukan pelanggaran berulang terhadap ketentuan penggunaan atau menyalahgunakan fitur platform.',
    ],
  },
];

export default async function TermsPage() {
  const user = await getPublicViewer();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={user} />

      <main className="mx-auto w-full max-w-[90rem] flex-1 space-y-10 px-4 py-10 sm:px-6 md:px-8 lg:py-12">
        <PageHeader
          eyebrow="KETENTUAN PLATFORM"
          title="Ketentuan Penggunaan"
          subtitle="Panduan hak dan tanggung jawab bagi seluruh pengunjung, Member, dan Kurator yang menggunakan ekosistem ARTIVA."
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
            href="/privacy"
            className="inline-flex min-h-[44px] items-center font-semibold text-brand-700 hover:underline"
          >
            Kebijakan Privasi
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
