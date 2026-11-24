import PageHeader from '@/components/layout/PageHeader';
import MemberChallenges from '@/components/features/member/MemberChallenges';
import { requirePageRole } from '@/lib/auth/page-guards';
import { listMemberJoinedChallenges } from '@/lib/repositories/submissions';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Tantangan yang Diikuti · ARTIVA',
};

export default async function MemberChallengesPage() {
  const user = await requirePageRole('member', '/dashboard/member/challenges');
  const result = await listMemberJoinedChallenges(user.user_id, {
    page: 1,
    limit: 50,
  });

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="RUANG MEMBER"
        title="Tantangan yang Diikuti"
        subtitle="Pantau daftar tantangan kreatif yang pernah kamu ikuti beserta status keikutsertaan dan hasilnya."
        actionLabel="Cari tantangan terbuka →"
        actionHref="/challenges"
      />
      <MemberChallenges initialChallenges={result.items} />
    </div>
  );
}
