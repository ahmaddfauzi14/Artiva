'use client';

import Link from 'next/link';
import DataTable from '@/components/ui/DataTable';
import { formatDateTimeId } from '@/lib/shared/format';

export default function AdminActivityQueue({ rows = [] }) {
  const normalizedRows = (rows || []).map((row) => ({
    ...row,
    queue_key: `${row.type || 'item'}-${row.item_id}`,
  }));

  const queueColumns = [
    {
      key: 'title',
      label: 'Aktivitas',
      render: (row) => (
        <span className="font-semibold text-ink">{row.title}</span>
      ),
    },
    {
      key: 'category_label',
      label: 'Jenis',
      render: (row) => (
        <span className="text-ink-soft">{row.category_label}</span>
      ),
    },
    {
      key: 'created_at',
      label: 'Diterima',
      render: (row) => (
        <span className="text-ink-soft">{formatDateTimeId(row.created_at)}</span>
      ),
    },
    {
      key: 'action',
      label: 'Tindakan',
      render: (row) => (
        <Link
          href={
            row.type === 'verification'
              ? `/dashboard/admin/curators/${row.item_id}`
              : `/dashboard/admin/reports/${row.item_id}`
          }
          className="text-sm font-semibold text-brand-700 hover:underline whitespace-nowrap"
        >
          {row.type === 'verification'
            ? 'Tinjau pengajuan →'
            : 'Tinjau laporan →'}
        </Link>
      ),
    },
  ];

  return (
    <DataTable
      columns={queueColumns}
      rows={normalizedRows}
      rowKey="queue_key"
      emptyTitle="Tidak ada antrean yang menunggu"
      emptyDescription="Semua pengajuan kurator dan laporan karya telah selesai ditinjau."
      authorityNote="Akses Admin: verifikasi kurator, moderasi laporan, pengelolaan pengguna, dan pengaturan kategori tercatat untuk akuntabilitas."
    />
  );
}
