import Link from 'next/link';
import { notFound } from 'next/navigation';
import Alert from '@/components/ui/Alert';
import ArtworkCard from '@/components/cards/ArtworkCard';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import Footer from '@/components/layout/Footer';
import Navbar from '@/components/layout/Navbar';
import StatusBadge from '@/components/ui/StatusBadge';
import WinnerCard from '@/components/cards/WinnerCard';
import { getCurrentUser } from '@/lib/auth/session';
import { todayInTz } from '@/lib/server/challenge-status';
import { formatDateRangeId } from '@/lib/shared/format';
import {
  findPublicChallengeById,
  listChallengeWinners,
  listPublicChallengeSubmissions,
} from '@/lib/repositories/challenges';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { id } = await params;
  const numId = Number(id);
  if (!Number.isInteger(numId) || numId <= 0) {
    return { title: 'Tantangan Tidak Ditemukan · ARTIVA' };
  }
  const challenge = await findPublicChallengeById(numId);
  return {
    title: challenge ? `${challenge.title} · ARTIVA` : 'Tantangan Tidak Ditemukan · ARTIVA',
  };
}

export default async function ChallengeDetailPage({ params }) {
  const { id } = await params;
  const challengeId = Number(id);
  if (!Number.isInteger(challengeId) || challengeId <= 0) {
    notFound();
  }

  const [viewer, challenge] = await Promise.all([
    getCurrentUser(),
    findPublicChallengeById(challengeId),
  ]);

  if (!challenge) {
    notFound();
  }

  const [submissionsData, winners] = await Promise.all([
    listPublicChallengeSubmissions(challengeId, { page: 1, limit: 24 }),
    challenge.status === 'announced' ? listChallengeWinners(challengeId) : [],
  ]);

  const today = todayInTz();
  const isOpenWindow =
    challenge.status === 'open' &&
    challenge.start_date <= today &&
    today <= challenge.end_date;

  const isClosingSoon =
    challenge.status === 'open' &&
    typeof challenge.days_remaining === 'number' &&
    challenge.days_remaining >= 0 &&
    challenge.days_remaining <= 3;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={viewer} />

      <main className="mx-auto w-full max-w-6xl flex-1 space-y-12 px-5 py-10 md:px-8">
        <div>
          <Link
            href="/challenges"
            className="text-sm font-semibold text-brand-700 hover:underline"
          >
            ← Kembali ke daftar tantangan
          </Link>
        </div>

        {/* Header & Aturan Tantangan */}
        <section className="edge-glow rounded-[28px] bg-grad-hero p-6 shadow-glass sm:p-10">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
            <div className="space-y-4 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2.5">
                <StatusBadge domain="challenge" status={challenge.status} />
                {isClosingSoon ? (
                  <StatusBadge label="Segera berakhir" tone="warning" />
                ) : null}
                <span className="rounded-full bg-surface px-3 py-1 text-xs font-semibold text-brand-700">
                  {challenge.category ? challenge.category.name : 'Semua Kategori'}
                </span>
              </div>

              <h1 className="text-[30px] font-semibold leading-tight text-ink sm:text-[40px]">
                {challenge.title}
              </h1>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-ink-soft">
                <span>
                  Kurator:{' '}
                  <Link
                    href={`/creators/${challenge.curator.username}`}
                    className="font-semibold text-brand-700 hover:underline"
                  >
                    {challenge.curator.display_name}
                  </Link>
                </span>
                <span>
                  Periode:{' '}
                  <strong className="text-ink">
                    {formatDateRangeId(challenge.start_date, challenge.end_date)}
                  </strong>
                </span>
                <span>
                  Peserta aktif:{' '}
                  <strong className="text-ink">
                    {challenge.submission_count} karya
                  </strong>
                </span>
              </div>

              {challenge.description ? (
                <p className="whitespace-pre-line text-base leading-relaxed text-ink-soft">
                  {challenge.description}
                </p>
              ) : null}
            </div>

            <div className="shrink-0">
              {isOpenWindow ? (
                viewer?.role === 'member' ? (
                  <Button
                    variant="primary"
                    size="lg"
                    href={`/challenges/${challenge.challenge_id}/submit`}
                  >
                    Ikuti tantangan →
                  </Button>
                ) : !viewer ? (
                  <Button
                    variant="primary"
                    size="lg"
                    href={`/login?next=/challenges/${challenge.challenge_id}/submit`}
                  >
                    Masuk untuk ikut →
                  </Button>
                ) : null
              ) : challenge.status === 'open' && challenge.start_date > today ? (
                <Alert tone="info" title="Segera dimulai">
                  Submission dibuka mulai tanggal mulai tantangan.
                </Alert>
              ) : null}
            </div>
          </div>

          {challenge.rules ? (
            <div className="mt-8 rounded-[18px] border border-line bg-surface p-6">
              <h2 className="text-lg font-semibold text-ink">
                Ketentuan & Aturan Tantangan
              </h2>
              <p className="mt-2 whitespace-pre-line text-base leading-relaxed text-ink-soft">
                {challenge.rules}
              </p>
            </div>
          ) : null}
        </section>

        {/* Pemenang (bila announced) */}
        {challenge.status === 'announced' && winners.length > 0 ? (
          <section className="space-y-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-brand-700">
                PEMENANG RESMI
              </p>
              <h2 className="mt-1 text-[24px] font-semibold text-ink sm:text-[30px]">
                Karya yang mencuri perhatian.
              </h2>
            </div>
            <div className="auto-grid-wide gap-6">
              {winners.map((w) => (
                <WinnerCard key={w.winner_id} winner={w} />
              ))}
            </div>
          </section>
        ) : null}

        {/* Daftar Karya Peserta */}
        <section className="space-y-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-brand-700">
              KARYA PESERTA
            </p>
            <h2 className="mt-1 text-[24px] font-semibold text-ink sm:text-[30px]">
              Galeri submission ({submissionsData.meta.total})
            </h2>
          </div>

          {submissionsData.items.length === 0 ? (
            <EmptyState
              title="Belum ada karya peserta"
              description={
                isOpenWindow
                  ? 'Jadilah Member pertama yang mengirimkan karya ke tantangan ini!'
                  : 'Belum ada karya yang terdaftar pada tantangan ini.'
              }
              actionLabel={
                isOpenWindow && viewer?.role === 'member'
                  ? 'Ikuti tantangan →'
                  : undefined
              }
              actionHref={
                isOpenWindow && viewer?.role === 'member'
                  ? `/challenges/${challenge.challenge_id}/submit`
                  : undefined
              }
            />
          ) : (
            <div
              className={`auto-grid-cards gap-6 ${
                submissionsData.items.length === 1 ? 'max-w-sm' : ''
              }`}
            >
              {submissionsData.items.map((sub, idx) => (
                <ArtworkCard
                  key={sub.submission_id}
                  artwork={sub.artwork}
                  index={idx}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
