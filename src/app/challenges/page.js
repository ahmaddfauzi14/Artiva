import StepCard from '@/components/cards/StepCard';
import WinnerPodium from '@/components/cards/WinnerPodium';
import ChallengeExplorer from '@/components/features/challenges/ChallengeExplorer';
import PublicShell from '@/components/layout/PublicShell';
import SectionHeader from '@/components/layout/SectionHeader';
import Button from '@/components/ui/Button';
import { getPublicViewer } from '@/lib/auth/page-guards';
import {
  listLatestAnnouncedWinners,
  listPublicChallenges,
} from '@/lib/repositories/challenges';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Tantangan Kreatif · ARTIVA',
};

const FAQ_ITEMS = [
  {
    tint: 'bg-tint-lavender shadow-tint-lavender',
    question: 'Siapa yang bisa ikut?',
    answer:
      'Seluruh pengguna dengan peran Member aktif dapat mendaftarkan karyanya ke tantangan berstatus Terbuka.',
  },
  {
    tint: 'bg-tint-mint shadow-tint-mint',
    question: 'Karya seperti apa yang eligible?',
    answer:
      'Karya harus milikmu sendiri, berstatus Dipublikasikan, dan berada pada kategori yang sesuai bila tantangan menentukan kategori.',
  },
  {
    tint: 'bg-tint-peach shadow-tint-peach',
    question: 'Kapan boleh didaftarkan atau ditarik?',
    answer:
      'Pendaftaran maupun penarikan submission dapat dilakukan kapan saja selama tanggal tantangan masih berlangsung.',
  },
];

function getHeroChallengeCta(user) {
  if (user?.role === 'curator') {
    const isActive = user.status === 'active';
    return {
      label: isActive ? 'Buat tantangan →' : 'Status verifikasi →',
      href: isActive ? '/curator/challenges/new' : '/curator/verification',
    };
  }
  if (user?.role === 'member') {
    return { label: 'Siapkan karya saya →', href: '/me/artworks' };
  }
  return { label: 'Gabung sebagai Member →', href: '/register/member' };
}

export default async function ChallengesPage({ searchParams }) {
  const user = await getPublicViewer();

  const sp = await searchParams;
  const status = sp?.status || '';
  const q = sp?.q || '';
  const page = Math.max(1, Number(sp?.page || '1') || 1);

  const [result, openChallengesData, latestWinnersData] = await Promise.all([
    listPublicChallenges({ status, q, page, limit: 12 }),
    listPublicChallenges({ status: 'open', limit: 1 }),
    listLatestAnnouncedWinners(),
  ]);

  const totalChallenges = result.meta?.total ?? result.items.length;
  const openCount = openChallengesData.meta?.total ?? 0;
  const heroCta = getHeroChallengeCta(user);

  return (
    <PublicShell user={user} mainClassName="space-y-9 py-6 sm:space-y-10 sm:py-8">
      {/* Hero Ringkas dengan Statistik */}
      <section className="edge-glow grid grid-cols-1 items-center gap-6 rounded-[26px] bg-grad-hero p-5 shadow-glass sm:p-7 lg:grid-cols-12">
        <div className="space-y-2.5 lg:col-span-8">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-brand-700">
            TANTANGAN TERKURASI
          </p>
          <h1 className="text-[1.75rem] font-semibold leading-tight text-ink sm:text-[2.25rem]">
            Tunjukkan karyamu dalam tantangan komunitas.
          </h1>
          <p className="max-w-2xl text-sm text-ink-soft sm:text-base">
            Kirimkan karya terbaik dari portofoliomu ke tantangan yang dikelola Kurator terverifikasi tanpa perlu mengunggah file berulang kali.
          </p>
        </div>

        <div className="flex flex-col justify-between gap-3.5 rounded-[20px] border border-line bg-surface/80 p-4 shadow-card-sm lg:col-span-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-[14px] border border-line/70 bg-canvas/70 px-3 py-2">
              <p className="tabular-nums text-2xl font-semibold text-brand-700">
                {openCount}
              </p>
              <p className="text-xs text-ink-soft">Sedang terbuka</p>
            </div>
            <div className="rounded-[14px] border border-line/70 bg-canvas/70 px-3 py-2">
              <p className="tabular-nums text-2xl font-semibold text-ink">
                {totalChallenges}
              </p>
              <p className="text-xs text-ink-soft">Total tantangan</p>
            </div>
          </div>

          <Button variant="primary" href={heroCta.href} className="w-full">
            {heroCta.label}
          </Button>
        </div>
      </section>

      {/* Daftar Tantangan */}
      <ChallengeExplorer
        initialChallenges={result.items}
        initialMeta={result.meta}
        initialStatus={status}
        initialQuery={q}
      />

      {/* Langkah Ikut Tantangan */}
      <section className="space-y-5">
        <SectionHeader
          eyebrow="ALUR PARTISIPASI"
          title="Giliran idemu mengambil tempat."
        />

        <div className="subgrid-step-row gap-5 lg:pb-2">
          <StepCard
            index={0}
            stagger
            number="01"
            tint="lavender"
            title="Siapkan karya Published"
            description="Pastikan karya yang ingin diikutsertakan sudah diunggah dan berstatus Dipublikasikan."
          />
          <StepCard
            index={1}
            stagger
            number="02"
            tint="mint"
            title="Pilih tantangan terbuka"
            description="Periksa periode serta kecocokan kategori jika tantangan menetapkan kategori tertentu."
          />
          <StepCard
            index={2}
            stagger
            number="03"
            tint="peach"
            title="Kirim & pantau kurasi"
            description="Kirim karya dengan satu klik; kamu masih bisa menariknya selama tantangan masih terbuka."
          />
        </div>
      </section>

      {/* Sorotan Pemenang */}
      {latestWinnersData.winners.length > 0 ? (
        <section className="space-y-5">
          <SectionHeader
            eyebrow="APRESIASI UNTUK KREATIVITAS"
            title="Karya yang mencuri perhatian."
          />
          <WinnerPodium
            winners={latestWinnersData.winners}
            artworkHrefPrefix="/challenges/artworks"
          />
        </section>
      ) : null}

      {/* FAQ */}
      <section className="space-y-5">
        <SectionHeader
          eyebrow="PERTANYAAN UMUM"
          title="Ruang mencoba, bukan ruang ragu."
        />
        <div className="auto-grid-wide gap-5">
          {FAQ_ITEMS.map((faq) => (
            <div
              key={faq.question}
              className={`flex flex-col justify-between rounded-[24px] p-5 ${faq.tint}`}
            >
              <h3 className="text-lg font-semibold text-ink">{faq.question}</h3>
              <p className="mt-2 text-sm text-ink-soft sm:text-base">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </section>
    </PublicShell>
  );
}
