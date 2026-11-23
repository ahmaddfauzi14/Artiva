import { notFound } from 'next/navigation';
import PageHeader from '@/components/layout/PageHeader';
import CuratorWinners from '@/components/features/curator/CuratorWinners';
import { requirePageRole } from '@/lib/auth/page-guards';
import { listChallengeWinners } from '@/lib/repositories/challenges';
import {
  findCuratorChallengeById,
  listCuratorChallengeSubmissions,
} from '@/lib/repositories/curator-challenges';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Pemenang Tantangan · Kurator ARTIVA',
};

export default async function CuratorChallengeWinnersPage({ params }) {
  const { id } = await params;
  const challengeId = Number(id);
  const user = await requirePageRole(
    'curator',
    `/dashboard/curator/challenges/${id}/winners`
  );

  if (!Number.isInteger(challengeId) || challengeId <= 0) {
    notFound();
  }

  const challenge = await findCuratorChallengeById(challengeId, user.user_id);
  if (!challenge) {
    notFound();
  }

  const [submissionsData, winners] = await Promise.all([
    challenge.status === 'closed'
      ? listCuratorChallengeSubmissions(challengeId, {
          status: 'submitted',
          page: 1,
          limit: 50,
        })
      : { items: [] },
    challenge.status === 'announced' ? listChallengeWinners(challengeId) : [],
  ]);

  const eligibleSubmissions = (submissionsData.items || []).filter(
    (s) => s.status === 'submitted' && !s.is_moderated
  );

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={
          challenge.status === 'announced'
            ? 'PENGUMUMAN PEMENANG'
            : 'PENETAPAN PEMENANG'
        }
        title={challenge.title}
        subtitle={
          challenge.status === 'announced'
            ? 'Pemenang resmi tantangan ini telah diumumkan ke publik.'
            : 'Tetapkan 1 hingga 3 pemenang dengan peringkat unik dari karya peserta yang aktif.'
        }
      />
      <CuratorWinners
        challenge={challenge}
        eligibleSubmissions={eligibleSubmissions}
        existingWinners={winners}
      />
    </div>
  );
}
