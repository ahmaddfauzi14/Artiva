import { notFound } from 'next/navigation';
import PageHeader from '@/components/layout/PageHeader';
import CuratorSubmissions from '@/components/features/curator/CuratorSubmissions';
import { requirePageRole } from '@/lib/auth/page-guards';
import {
  findCuratorChallengeById,
  listCuratorChallengeSubmissions,
} from '@/lib/repositories/curator-challenges';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Submission Peserta · Kurator ARTIVA',
};

export default async function CuratorChallengeSubmissionsPage({ params }) {
  const { id } = await params;
  const challengeId = Number(id);
  const user = await requirePageRole(
    'curator',
    `/curator/challenges/${id}/submissions`
  );

  if (!Number.isInteger(challengeId) || challengeId <= 0) {
    notFound();
  }

  const challenge = await findCuratorChallengeById(challengeId, user.user_id);
  if (!challenge) {
    notFound();
  }

  const submissionsData = await listCuratorChallengeSubmissions(challengeId, {
    status: 'submitted',
    page: 1,
    limit: 50,
  });

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="KURASI KARYA MASUK"
        title={`Submission: ${challenge.title}`}
        subtitle="Tinjau seluruh karya peserta yang masuk pada tantangan ini."
        actionLabel={
          challenge.status === 'closed'
            ? 'Tentukan pemenang'
            : challenge.status === 'announced'
              ? 'Lihat pengumuman'
              : undefined
        }
        actionHref={
          challenge.status === 'closed' || challenge.status === 'announced'
            ? `/curator/challenges/${challenge.challenge_id}/winners`
            : undefined
        }
      />
      <CuratorSubmissions
        challenge={challenge}
        initialSubmissions={submissionsData.items}
      />
    </div>
  );
}
