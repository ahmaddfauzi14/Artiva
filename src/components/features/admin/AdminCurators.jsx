'use client';

import Link from 'next/link';
import Alert from '@/components/ui/Alert';
import DataTable from '@/components/ui/DataTable';
import Pagination from '@/components/ui/Pagination';
import SearchBar from '@/components/ui/SearchBar';
import StatusBadge from '@/components/ui/StatusBadge';
import { useAdminList } from '@/components/features/admin/useAdminList';
import { formatDateTimeId } from '@/lib/shared/format';

export default function AdminCurators({
  initialItems = [],
  initialCounts = { pending: 0, approved: 0, rejected: 0 },
  initialMeta = { page: 1, limit: 12, total: 0 },
}) {
  const {
    items,
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
    endpoint: '/api/admin/curator-verifications',
    dataKey: 'verifications',
    initialItems,
    initialCounts,
    initialMeta,
    initialFilter: 'pending',
    filterParam: 'status',
    limit: 12,
  });

  const tabs = [
    { label: 'Menunggu', value: 'pending', count: counts.pending },
    { label: 'Disetujui', value: 'approved', count: counts.approved },
    { label: 'Ditolak', value: 'rejected', count: counts.rejected },
  ];

  const columns = [
    {
      key: 'id',
      label: 'Kode',
      colWidth: '80px',
      render: (row) => (
        <span className="font-semibold text-ink tabular-nums whitespace-nowrap">
          RG-{String(row.verification_id).padStart(3, '0')}
        </span>
      ),
    },
    {
      key: 'candidate',
      label: 'Calon Kurator',
      colWidth: 'minmax(180px, 1.5fr)',
      render: (row) => (
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-ink truncate">
              {row.display_name || row.username}
            </p>
            {row.appeal_number > 0 ? (
              <span className="inline-flex items-center rounded-full border border-[#264E91] bg-[#142B52] px-2 py-0.5 text-[0.6875rem] font-semibold text-[#9BC4FF] whitespace-nowrap">
                Banding ke-{row.appeal_number}
              </span>
            ) : null}
          </div>
          <p className="text-xs text-ink-mute truncate">
            @{row.username} · {row.email}
            {row.has_cv ? ` · CV ${String(row.cv_ext || 'DOC').toUpperCase()}` : ''}
          </p>
        </div>
      ),
    },
    {
      key: 'submitted_at',
      label: 'Diajukan',
      colWidth: 'minmax(125px, 1fr)',
      render: (row) => (
        <span className="text-ink-soft">
          {formatDateTimeId(row.submitted_at)}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      colWidth: '116px',
      render: (row) => (
        <StatusBadge domain="verification" status={row.status} />
      ),
    },
    {
      key: 'actions',
      label: 'Tindakan',
      colWidth: 'max-content',
      className: 'text-right',
      cellClassName: 'text-right',
      render: (row) => (
        <Link
          href={`/dashboard/admin/curators/${row.verification_id}`}
          className="text-sm font-semibold text-brand-700 hover:underline whitespace-nowrap"
        >
          Tinjau pengajuan →
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {errorMsg ? (
        <Alert tone="danger" title="Gagal memuat daftar verifikasi">
          {errorMsg}
        </Alert>
      ) : null}

      <DataTable
        title="Daftar Pengajuan Kurator"
        tabs={tabs}
        activeTab={status}
        onTabChange={(val) => {
          setStatus(val);
          fetchList({ nextFilter: val, nextQ: q, nextPage: 1 });
        }}
        headerActions={
          <SearchBar
            compact
            value={q}
            onChange={setQ}
            placeholder="Cari nama, username, email…"
            onSubmit={(val) => {
              setQ(val);
              fetchList({ nextFilter: status, nextQ: val, nextPage: 1 });
            }}
          />
        }
        columns={columns}
        rows={items}
        rowKey="verification_id"
        loading={loading}
        emptyTitle="Tidak ada pengajuan pada status ini"
        emptyDescription="Semua pengajuan kurator yang sesuai filter akan tampil di sini."
        authorityNote="Akses Admin: persetujuan mengaktifkan peran Kurator secara langsung; penolakan wajib disertai catatan minimal 5 karakter. Calon Kurator dapat mengajukan banding maksimal 3 kali."
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
