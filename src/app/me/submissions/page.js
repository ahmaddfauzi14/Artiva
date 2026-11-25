import Button from '@/components/ui/Button';
import PageHeader from '@/components/layout/PageHeader';
import MemberSubmissions from '@/components/features/member/MemberSubmissions';
import { requirePageRole } from '@/lib/auth/page-guards';
import { listMemberSubmissions } from '@/lib/repositories/submissions';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Submission · ARTIVA',
};

export default async function MemberSubmissionsPage() {
  const user = await requirePageRole('member', '/me/submissions');
  const mySubmissions = await listMemberSubmissions(user.user_id, {
    page: 1,
    limit: 50,
  });

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="PARTISIPASI KOMPETISI"
        title="Submission"
        subtitle="Pantau seluruh karya yang telah kamu ajukan ke tantangan."
        rightSlot={
          <Button
            variant="secondary"
            href="/me/submissions/challenges?status=open"
          >
            Lihat tantangan terbuka →
          </Button>
        }
      />
      <MemberSubmissions initialSubmissions={mySubmissions.items || []} />
    </div>
  );
}
