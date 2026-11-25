import PageHeader from '@/components/layout/PageHeader';
import AdminCategories from '@/components/features/admin/AdminCategories';
import { requirePageRole } from '@/lib/auth/page-guards';
import { listAllAdminCategories } from '@/lib/repositories/admin';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Kelola Kategori · Admin ARTIVA',
};

export default async function AdminCategoriesPage() {
  const [, categories] = await Promise.all([
    requirePageRole('admin', '/dashboard/admin/categories'),
    listAllAdminCategories(),
  ]);

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="TAKSONOMI PLATFORM"
        title="Manajemen kategori"
        subtitle="Kelola daftar kategori karya dan tantangan yang tersedia di ARTIVA."
      />
      <AdminCategories initialCategories={categories} />
    </div>
  );
}
