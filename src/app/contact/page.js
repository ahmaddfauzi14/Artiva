import PageHeader from '@/components/layout/PageHeader';
import PublicShell from '@/components/layout/PublicShell';
import Button from '@/components/ui/Button';
import { getPublicViewer } from '@/lib/auth/page-guards';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Kontak & Dukungan · ARTIVA',
  description:
    'Saluran resmi untuk pelaporan bug, diskusi pengembangan melalui GitHub, moderasi karya, dan verifikasi Kurator ARTIVA.',
};

const GITHUB_REPO_URL = 'https://github.com/ahmaddfauzi14/Artiva';

const SUPPORT_CARDS = [
  {
    eyebrow: 'KODE SUMBER & MASUKAN',
    title: 'Repositori GitHub ARTIVA',
    description:
      'Laporkan bug, usulkan peningkatan fitur, atau pelajari arsitektur proyek ARTIVA langsung di repositori resmi GitHub.',
    actionLabel: 'Buka GitHub ARTIVA',
    href: GITHUB_REPO_URL,
    external: true,
  },
  {
    eyebrow: 'MODERASI KONTEN',
    title: 'Laporkan Karya Bermasalah',
    description:
      'Untuk karya yang diduga melanggar hak cipta atau ketentuan komunitas, gunakan tombol lapor pada halaman detail karya agar langsung masuk ke antrean peninjauan Admin.',
    actionLabel: 'Buka Galeri Karya',
    href: '/artworks',
  },
  {
    eyebrow: 'PENYELENGGARA TANTANGAN',
    title: 'Verifikasi Akun Kurator',
    description:
      'Ingin menyelenggarakan tantangan kreatif terkurasi di ARTIVA? Ajukan pendaftaran Kurator untuk ditinjau dan diverifikasi oleh Admin.',
    actionLabel: 'Ajukan Sebagai Kurator',
    href: '/register/curator',
  },
];

export default async function ContactPage() {
  const user = await getPublicViewer();

  return (
    <PublicShell user={user} mainClassName="space-y-8 py-6 sm:py-8">
      <PageHeader
        eyebrow="DUKUNGAN PLATFORM"
        title="Kontak & Dukungan"
        subtitle="Temukan saluran resmi untuk melaporkan kendala teknis, menyampaikan masukan pengembangan, atau menggunakan fitur moderasi di dalam ARTIVA."
      />

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {SUPPORT_CARDS.map((card) => (
          <section
            key={card.title}
            className="flex flex-col justify-between gap-5 rounded-[24px] border border-line bg-surface p-5 shadow-card"
          >
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-brand-700">
                {card.eyebrow}
              </p>
              <h2 className="text-xl font-semibold text-ink">{card.title}</h2>
              <p className="text-sm leading-relaxed text-ink-soft">
                {card.description}
              </p>
            </div>

            <div>
              {card.external ? (
                <a
                  href={card.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-grad-primary px-5 py-2.5 text-sm font-semibold text-white shadow-btn transition-all duration-150 hover:-translate-y-0.5 hover:brightness-110"
                >
                  {card.actionLabel}
                </a>
              ) : (
                <Button variant="secondary" href={card.href}>
                  {card.actionLabel}
                </Button>
              )}
            </div>
          </section>
        ))}
      </div>
    </PublicShell>
  );
}
