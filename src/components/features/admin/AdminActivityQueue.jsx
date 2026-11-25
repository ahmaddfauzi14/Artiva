'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import DataTable from '@/components/ui/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
import { formatDateTimeId } from '@/lib/shared/format';

const FILTER_TABS = [
  { value: 'pending', label: 'Menunggu' },
  { value: 'verification', label: 'Verifikasi' },
  { value: 'report', label: 'Laporan' },
  { value: 'all', label: 'Semua' },
];

export default function AdminActivityQueue({ rows = [] }) {
  const [activeTab, setActiveTab] = useState('pending');

  const normalizedRows = useMemo(
    () =>
      (rows || []).map((row) => ({
        ...row,
        status: row.status || 'pending',
        queue_key: `${row.type || 'item'}-${row.item_id}`,
      })),
    [rows]
  );

  const filteredRows = useMemo(() => {
    if (activeTab === 'pending') {
      return normalizedRows.filter((row) => row.status === 'pending');
    }
    if (activeTab === 'verification') {
      return normalizedRows.filter((row) => row.type === 'verification');
    }
    if (activeTab === 'report') {
      return normalizedRows.filter((row) => row.type === 'report');
    }
    return normalizedRows;
  }, [normalizedRows, activeTab]);

  const columns = [
    {
      key: 'title',
      label: 'Aktivitas',
      render: (row) => (
        <span className="font-semibold text-ink">{row.title}</span>
      ),
    },
    {
      key: 'item_id',
      label: 'ID',
      cellClassName: 'tabular-nums',
      render: (row) => `#${row.item_id}`,
    },
    {
      key: 'category_label',
      label: 'Jenis',
      render: (row) => row.category_label,
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <StatusBadge
          domain={row.type === 'verification' ? 'verification' : 'report'}
          status={row.status}
        />
      ),
    },
    {
      key: 'created_at',
      label: 'Tanggal',
      cellClassName: 'tabular-nums whitespace-nowrap',
      render: (row) => formatDateTimeId(row.created_at),
    },
    {
      key: 'actions',
      label: 'Tindakan',
      className: 'text-right',
      cellClassName: 'text-right',
      render: (row) => (
        <Link
          href={
            row.type === 'verification'
              ? `/dashboard/admin/curators/${row.item_id}`
              : `/dashboard/admin/reports/${row.item_id}`
          }
          className="whitespace-nowrap font-semibold text-brand-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700"
        >
          {row.type === 'verification' ? 'Tinjau pengajuan →' : 'Tinjau laporan →'}
        </Link>
      ),
    },
  ];

  return (
    <DataTable
      title="Antrean Aktivitas Terbaru"
      tabs={FILTER_TABS}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      columns={columns}
      rows={filteredRows}
      rowKey="queue_key"
      emptyTitle="Tidak ada aktivitas pada filter ini"
      emptyDescription="Semua pengajuan kurator atau laporan karya pada kategori ini sudah ditinjau."
    />
  );
}
