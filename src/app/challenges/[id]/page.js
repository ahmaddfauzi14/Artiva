import Link from 'next/link';
import { notFound } from 'next/navigation';
import { HugeiconsIcon } from '@hugeicons/react';
import { Award01Icon } from '@hugeicons/core-free-icons';
import ArtworkCard from '@/components/cards/ArtworkCard';
import WinnerPodium from '@/components/cards/WinnerPodium';
import PublicShell from '@/components/layout/PublicShell';
import SectionHeader from '@/components/layout/SectionHeader';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import StatusBadge from '@/components/ui/StatusBadge';
import { getPublicViewer } from '@/lib/auth/page-guards';
import {
  findPublicChallengeById,
  listChallengeWinners,
  listPublicChallengeSubmissions,
} from '@/lib/repositories/challenges';
import { todayInTz } from '@/lib/server/challenge-status';
import { formatDateRangeId } from '@/lib/shared/format';

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
  const viewer = await getPublicViewer();

  const { id } = await params;
  const challengeId = Number(id);
  if (!Number.isInteger(challengeId) || challengeId <= 0) {
    notFound();
  }

  const challenge = await findPublicChallengeById(challengeId);
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
    <PublicShell user={viewer} mainClassName="space-y-8 py-6 sm:py-8">
      <div>
        <Link
          href="/challenges"
          className="text-sm font-semibold text-brand-700 hover:underline"
        >
          ← Kembali ke daftar tantangan
        </Link>
      </div>

      {/* Header, Banner, Hadiah & Aturan Tantangan */}
      <section className="edge-glow rounded-[26px] bg-grad-hero p-5 shadow-glass sm:p-7">
        {challenge.banner_url ? (
          <div className="mb-6 aspect-[16/9] w-full overflow-hidden rounded-[20px] border border-line/80 bg-brand-900 sm:aspect-[21/9]">
            <img
              src={challenge.banner_url}
              alt={`Banner ${challenge.title}`}
              className="h-full w-full object-cover"
            />
          </div>
        ) : null}

        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
          <div className="max-w-3xl space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge domain="challenge" status={challenge.status} />
              {isClosingSoon ? (
                <StatusBadge label="Segera berakhir" tone="warning" />
              ) : null}
              <span className="rounded-full bg-surface px-3 py-1 text-xs font-semibold text-brand-700">
                {challenge.category ? challenge.category.name : 'Semua Kategori'}
              </span>
            </div>

            <h1 className="text-[1.75rem] font-semibold leading-tight text-ink sm:text-[2.25rem]">
              {challenge.title}
            </h1>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-ink-soft">
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
              <p className="whitespace-pre-line text-sm leading-relaxed text-ink-soft sm:text-base">
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

        {challenge.prize || challenge.rules ? (
          <div
            className={`mt-5 grid grid-cols-1 gap-4 ${
              challenge.prize && challenge.rules ? 'lg:grid-cols-2' : ''
            }`}
          >
            {challenge.prize ? (
              <div className="rounded-[18px] border border-brand-700/35 bg-brand-50/75 p-5">
                <h2 className="flex items-center gap-2 text-base font-semibold text-brand-700 sm:text-lg">
                  <HugeiconsIcon
                    icon={Award01Icon}
                    size={18}
                    strokeWidth={1.8}
                    aria-hidden="true"
                  />
                  <span>Hadiah &amp; Apresiasi</span>
                </h2>
                <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-ink sm:text-base">
                  {challenge.prize}
                </p>
              </div>
            ) : null}

            {challenge.rules ? (
              <div className="rounded-[18px] border border-line bg-surface p-5">
                <h2 className="text-base font-semibold text-ink sm:text-lg">
                  Ketentuan &amp; Aturan Tantangan
                </h2>
                <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-ink-soft sm:text-base">
                  {challenge.rules}
                </p>
              </div>
            ) : null}
          </div>
        ) : null}
      </section>

      {/* Pemenang (bila announced) */}
      {challenge.status === 'announced' && winners.length > 0 ? (
        <section className="space-y-5">
          <SectionHeader
            eyebrow="PEMENANG RESMI"
            title="Karya yang mencuri perhatian."
          />
          <WinnerPodium winners={winners} />
        </section>
      ) : null}

      {/* Daftar Karya Peserta */}
      <section className="space-y-5">
        <SectionHeader
          eyebrow="KARYA PESERTA"
          title={`Galeri submission (${submissionsData.meta.total})`}
        />

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
          <div className="auto-grid-cards gap-5">
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
    </PublicShell>
  );
}
