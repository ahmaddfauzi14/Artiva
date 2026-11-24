'use client';

import Link from 'next/link';
import Alert from '@/components/ui/Alert';
import ChipRow from '@/components/ui/Chip';
import DataTable from '@/components/ui/DataTable';
import Pagination from '@/components/ui/Pagination';
import SearchBar from '@/components/ui/SearchBar';
import StatusBadge from '@/components/ui/StatusBadge';
import { useAdminList } from '@/components/features/admin/useAdminList';
import { formatDateTimeId } from '@/lib/shared/format';

const REASON_LABELS = {
  spam: 'Spam',
  plagiarism: 'Plagiarisme',
  inappropriate: 'Tidak pantas',
  copyright: 'Hak cipta',
  other: 'Lainnya',
};

export default function AdminReports({
  initialReports = [],
  initialCounts = { pending: 0, resolved: 0, dismissed: 0 },
  initialMeta = { page: 1, limit: 12, total: 0 },
}) {
  const {
    items: reports,
    counts,
    meta,
    filter: status,
    setFilter: setStatus,
    q,
    setQ,
    loading,
    errorMsg,
    fetchList,
  } = useAdminList({
    endpoint: '/api/admin/reports',
    dataKey: 'reports',
    initialItems: initialReports,
    initialCounts,
    initialMeta,
    initialFilter: 'pending',
    filterParam: 'status',
    limit: 12,
  });

  const tabs = [
    { label: 'Menunggu', value: 'pending', count: counts.pending },
    { label: 'Selesai', value: 'resolved', count: counts.resolved },
    { label: 'Ditolak', value: 'dismissed', count: counts.dismissed },
  ];

  const columns = [
    {
      key: 'id',
      label: 'ID',
      colWidth: '44px',
      render: (row) => (
        <span className="font-semibold text-ink tabular-nums">
          #{row.report_id}
        </span>
      ),
    },
    {
      key: 'artwork',
      label: 'Karya Terlapor',
      colWidth: 'minmax(140px, 1.5fr)',
      render: (row) => (
        <div className="min-w-0">
          <p className="font-semibold text-ink truncate">{row.artwork_title}</p>
          <p className="text-xs text-ink-mute truncate">
            Kreator: {row.creator_display_name || row.creator_username}
          </p>
        </div>
      ),
    },
    {
      key: 'reason',
      label: 'Alasan',
      colWidth: 'minmax(76px, 0.8fr)',
      render: (row) => (
        <span className="font-medium text-ink-soft">
          {REASON_LABELS[row.reason] || row.reason}
        </span>
      ),
    },
    {
      key: 'reporter',
      label: 'Pelapor',
      colWidth: 'minmax(88px, 0.9fr)',
      render: (row) => (
        <span className="block text-ink-soft truncate">
          @{row.reporter_username}
        </span>
      ),
    },
    {
      key: 'created_at',
      label: 'Diterima',
      colWidth: 'minmax(106px, 0.95fr)',
      render: (row) => (
        <span className="text-ink-soft">{formatDateTimeId(row.created_at)}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      colWidth: '106px',
      render: (row) => <StatusBadge domain="report" status={row.status} />,
    },
    {
      key: 'actions',
      label: 'Tindakan',
      colWidth: 'max-content',
      className: 'text-right',
      cellClassName: 'text-right',
      render: (row) => (
        <Link
          href={`/dashboard/admin/reports/${row.report_id}`}
          className="text-sm font-semibold text-brand-700 hover:underline whitespace-nowrap"
        >
          Tinjau laporan →
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <ChipRow
          items={tabs}
          activeValue={status}
          onSelect={(val) => {
            setStatus(val);
            fetchList({ nextFilter: val, nextQ: q, nextPage: 1 });
          }}
        />
        <SearchBar
          compact
          value={q}
          onChange={setQ}
          placeholder="Cari judul karya atau pelapor…"
          onSubmit={(val) => {
            setQ(val);
            fetchList({ nextFilter: status, nextQ: val, nextPage: 1 });
          }}
        />
      </div>

      {errorMsg ? (
        <Alert tone="danger" title="Gagal memuat antrean laporan">
          {errorMsg}
        </Alert>
      ) : null}

      <DataTable
        columns={columns}
        rows={reports}
        rowKey="report_id"
        loading={loading}
        emptyTitle="Tidak ada laporan pada status ini"
        emptyDescription="Antrean laporan yang sesuai filter akan tampil di sini, diurutkan dari yang paling lama masuk."
        authorityNote="Akses Admin: penyembunyian atau penghapusan karya otomatis menarik submission aktif pada tantangan yang belum diumumkan dan menyelesaikan laporan tertunda lain pada karya yang sama."
      />

      <Pagination
        page={meta.page}
        limit={meta.limit}
        total={meta.total}
        onPageChange={(nextPage) =>
          fetchList({ nextFilter: status, nextQ: q, nextPage })
        }
      />
    </div>
  );
}
