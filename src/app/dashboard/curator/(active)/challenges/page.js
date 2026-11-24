import PageHeader from '@/components/layout/PageHeader';
import CuratorChallenges from '@/components/features/curator/CuratorChallenges';
import { requirePageRole } from '@/lib/auth/page-guards';
import { listCuratorChallenges } from '@/lib/repositories/curator-challenges';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Tantangan Saya · ARTIVA',
};

export default async function CuratorChallengesPage() {
  const user = await requirePageRole('curator', '/dashboard/curator/challenges');
  const result = await listCuratorChallenges(user.user_id, {
    page: 1,
    limit: 50,
  });

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="RUANG KURATOR"
        title="Tantangan Saya"
        subtitle="Kelola seluruh tantangan kreatif yang kamu buat, publikasikan draft, pantau karya masuk, dan umumkan pemenang."
        actionLabel="Buat tantangan →"
        actionHref="/dashboard/curator/challenges/new"
      />
      <CuratorChallenges initialChallenges={result.items} />
    </div>
  );
}
