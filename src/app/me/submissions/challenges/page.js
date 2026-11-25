import Link from 'next/link';
import ChallengeExplorer from '@/components/features/challenges/ChallengeExplorer';
import PageHeader from '@/components/layout/PageHeader';
import { requirePageRole } from '@/lib/auth/page-guards';
import { listPublicChallenges } from '@/lib/repositories/challenges';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Tantangan · Submission ARTIVA',
};

export default async function MemberSubmissionChallengesPage({ searchParams }) {
  await requirePageRole('member', '/me/submissions/challenges');

  const sp = await searchParams;
  const status = sp?.status || '';
  const q = sp?.q || '';
  const page = Math.max(1, Number(sp?.page || '1') || 1);

  const result = await listPublicChallenges({ status, q, page, limit: 12 });

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/me/submissions"
          className="text-sm font-semibold text-brand-700 hover:underline"
        >
          ← Kembali ke submission
        </Link>
      </div>

      <PageHeader
        eyebrow="PARTISIPASI KOMPETISI"
        title="Jelajahi tantangan"
        subtitle="Pilih tantangan komunitas dan lanjutkan pengajuan karyamu tanpa keluar dari ruang submission."
      />

      <ChallengeExplorer
        initialChallenges={result.items}
        initialMeta={result.meta}
        initialStatus={status}
        initialQuery={q}
        basePath="/me/submissions/challenges"
        challengeHrefPrefix="/me/submissions/challenges"
        challengeHrefSuffix="?from=list"
      />
    </div>
  );
}
