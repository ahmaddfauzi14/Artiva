import { notFound } from 'next/navigation';
import PageHeader from '@/components/layout/PageHeader';
import ChallengeEditorForm from '@/components/features/curator/ChallengeEditorForm';
import { requirePageRole } from '@/lib/auth/page-guards';
import { listActiveCategories } from '@/lib/repositories/categories';
import { findCuratorChallengeById } from '@/lib/repositories/curator-challenges';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Ubah Tantangan · Kurator ARTIVA',
};

export default async function EditChallengePage({ params }) {
  const { id } = await params;
  const challengeId = Number(id);
  const user = await requirePageRole(
    'curator',
    `/dashboard/curator/challenges/${id}/edit`
  );

  if (!Number.isInteger(challengeId) || challengeId <= 0) {
    notFound();
  }

  const [challenge, categories] = await Promise.all([
    findCuratorChallengeById(challengeId, user.user_id),
    listActiveCategories(),
  ]);

  if (!challenge) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="UBAH TANTANGAN"
        title={challenge.title}
        subtitle="Perbarui informasi tantangan sesuai batas status saat ini."
      />
      <ChallengeEditorForm
        categories={categories}
        initialChallenge={challenge}
      />
    </div>
  );
}
