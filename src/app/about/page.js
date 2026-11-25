import Button from '@/components/ui/Button';
import Footer from '@/components/layout/Footer';
import Navbar from '@/components/layout/Navbar';
import PageHeader from '@/components/layout/PageHeader';
import { getPublicViewer } from '@/lib/auth/page-guards';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Tentang ARTIVA · ARTIVA',
  description:
    'Mengenal ARTIVA, platform showcase karya seni digital, komunitas kreator, dan tantangan kreatif terkurasi.',
};

const PILLARS = [
  {
    number: '01',
    tint: 'bg-tint-lavender shadow-tint-lavender',
    title: 'Creative Showcase',
    description:
      'Ruang portofolio digital untuk memamerkan karya seni dengan filter kategori, pencarian kata kunci, tag, tampilan inspeksi zoom, dan halaman profil publik kreator.',
  },
  {
    number: '02',
    tint: 'bg-tint-mint shadow-tint-mint',
    title: 'Creative Community',
    description:
      'Ekosistem apresiasi antar kreator melalui fitur suka, simpan favorit, dan komentar langsung pada karya, dilengkapi sistem pelaporan konten untuk menjaga kenyamanan bersama.',
  },
  {
    number: '03',
    tint: 'bg-tint-peach shadow-tint-peach',
    title: 'Creative Challenge',
    description:
      'Wadah kompetisi tematik terkurasi yang memungkinkan kreator mengikuti tantangan dengan karya portofolio yang sudah terbit tanpa mengunggah ulang file gambar.',
  },
];

const ROLES = [
  {
    name: 'Pengunjung Publik',
    summary:
      'Menjelajahi beranda, galeri karya berdasarkan kategori dan pencarian, profil kreator, daftar tantangan, serta daftar pemenang yang telah diumumkan.',
  },
  {
    name: 'Member',
    summary:
      'Langsung aktif setelah mendaftar. Mengelola profil dan portofolio karya, memberi suka, favorit, dan komentar, melapor karya bermasalah, serta mengirim atau menarik karya dari tantangan.',
  },
  {
    name: 'Kurator',
    summary:
      'Mendaftar melalui verifikasi Admin. Setelah aktif, Kurator dapat membuat dan mempublikasikan tantangan tematik, meninjau karya peserta, serta menetapkan 1 sampai 3 pemenang resmi.',
  },
  {
    name: 'Admin',
    summary:
      'Memverifikasi pengajuan Kurator, mengelola kategori karya dan status akun pengguna, serta menyelesaikan laporan moderasi konten dari komunitas.',
  },
];

const WORKFLOW_STEPS = [
  'Pengguna mendaftar sebagai Member (langsung aktif) atau mengajukan akun Kurator yang ditinjau oleh Admin.',
  'Member mengunggah karya seni digital ke portofolio pribadinya dengan kontrol penuh atas status publikasi.',
  'Komunitas menjelajahi galeri, saling memberi apresiasi lewat suka, favorit, dan komentar pada setiap karya.',
  'Kurator terverifikasi merancang dan membuka tantangan kreatif sesuai tema dan kategori tertentu.',
  'Member memilih karya portofolio yang memenuhi syarat untuk ikut tantangan, lalu Kurator meninjau peserta dan mengumumkan maksimal 3 pemenang resmi.',
];

export default async function AboutPage() {
  const user = await getPublicViewer();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={user} />

      <main className="mx-auto w-full max-w-[90rem] flex-1 space-y-14 px-4 py-10 sm:px-6 md:px-8 lg:py-12">
        <PageHeader
          eyebrow="TENTANG ARTIVA"
          title="Satu karya, tiga ruang untuk bertumbuh."
          subtitle="ARTIVA adalah platform showcase karya seni digital yang menyatukan portofolio kreator, apresiasi komunitas, dan tantangan kreatif terkurasi dalam satu ekosistem."
          actionLabel="Jelajahi karya"
          actionHref="/artworks"
        />

        <section aria-labelledby="pilar-heading" className="space-y-6">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-brand-700">
              PILAR UTAMA
            </p>
            <h2
              id="pilar-heading"
              className="text-[1.5rem] font-semibold leading-tight text-ink sm:text-[1.875rem]"
            >
              Dirancang untuk kreator dan penyelenggara.
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {PILLARS.map((item) => (
              <article
                key={item.number}
                className={`rounded-[28px] border border-line/70 p-6 ${item.tint}`}
              >
                <p className="tabular-nums text-xs font-semibold text-brand-700">
                  {item.number}
                </p>
                <h3 className="mt-3 text-xl font-semibold text-ink">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section
          id="peran"
          aria-labelledby="peran-heading"
          className="scroll-mt-24 space-y-6"
        >
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-brand-700">
              AKSES BERBASIS PERAN
            </p>
            <h2
              id="peran-heading"
              className="text-[1.5rem] font-semibold leading-tight text-ink sm:text-[1.875rem]"
            >
              Peran pengguna di ARTIVA.
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {ROLES.map((role) => (
              <div
                key={role.name}
                className="rounded-[24px] border border-line bg-surface p-6 shadow-card-sm"
              >
                <h3 className="text-lg font-semibold text-ink">{role.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                  {role.summary}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section
          id="alur"
          aria-labelledby="alur-heading"
          className="scroll-mt-24 space-y-6"
        >
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-brand-700">
              ALUR EKOSISTEM
            </p>
            <h2
              id="alur-heading"
              className="text-[1.5rem] font-semibold leading-tight text-ink sm:text-[1.875rem]"
            >
              Alur berkarya dan berkompetisi.
            </h2>
          </div>

          <ol className="space-y-3 rounded-[28px] border border-line bg-surface p-6 shadow-card sm:p-8">
            {WORKFLOW_STEPS.map((step, idx) => (
              <li
                key={idx}
                className="flex items-start gap-4 border-b border-line/60 pb-3 last:border-b-0 last:pb-0"
              >
                <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-50 tabular-nums text-xs font-semibold text-brand-700">
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <p className="pt-1 text-base leading-relaxed text-ink-soft">
                  {step}
                </p>
              </li>
            ))}
          </ol>
        </section>

        <section className="edge-glow flex flex-col items-start justify-between gap-6 rounded-[28px] bg-grad-hero p-6 shadow-glass sm:flex-row sm:items-center sm:p-8">
          <div className="space-y-1.5">
            <h2 className="text-2xl font-semibold text-ink">
              Siap mulai berbagi karya di ARTIVA?
            </h2>
            <p className="max-w-xl text-base text-ink-soft">
              Bangun portofolio sebagai Member atau ajukan diri sebagai Kurator untuk menyelenggarakan tantangan kreatif.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="primary" href="/register/member">
              Daftar Member
            </Button>
            <Button variant="secondary" href="/register/curator">
              Ajukan Kurator
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
