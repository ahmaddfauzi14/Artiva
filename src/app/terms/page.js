import LegalPageLayout from '@/components/layout/LegalPageLayout';
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
    <LegalPageLayout
      user={user}
      eyebrow="KETENTUAN PLATFORM"
      title="Ketentuan Penggunaan"
      subtitle="Panduan hak dan tanggung jawab bagi seluruh pengunjung, Member, dan Kurator yang menggunakan ekosistem ARTIVA."
      sections={SECTIONS}
      relatedLinks={[
        { label: 'Kebijakan Privasi', href: '/privacy' },
        { label: 'Kontak & Dukungan', href: '/contact' },
      ]}
    />
  );
}
