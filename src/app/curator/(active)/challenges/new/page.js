import Link from 'next/link';
import PageHeader from '@/components/layout/PageHeader';
import ChallengeEditorForm from '@/components/features/curator/ChallengeEditorForm';
import { requirePageRole } from '@/lib/auth/page-guards';
import { listActiveCategories } from '@/lib/repositories/categories';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Buat Tantangan · Kurator ARTIVA',
};

export default async function NewChallengePage() {
  const [, categories] = await Promise.all([
    requirePageRole('curator', '/curator/challenges/new'),
    listActiveCategories(),
  ]);

  return (
    <div className="space-y-5">
      <div>
        <Link
          href="/curator/challenges"
          className="text-sm font-semibold text-brand-700 hover:underline"
        >
          ← Kembali ke daftar tantangan
        </Link>
      </div>
      <PageHeader
        eyebrow="MANAJEMEN TANTANGAN"
        title="Buat tantangan baru"
        subtitle="Rancang tantangan tematik lengkap dengan aturan dan periode pengumpulan karya."
      />
      <ChallengeEditorForm categories={categories} />
    </div>
  );
}
