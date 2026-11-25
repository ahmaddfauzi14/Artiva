'use client';

import Link from 'next/link';
import Alert from '@/components/ui/Alert';
import DataTable from '@/components/ui/DataTable';
import Pagination from '@/components/ui/Pagination';
import SearchBar from '@/components/ui/SearchBar';
import StatusBadge from '@/components/ui/StatusBadge';
import { useAdminList } from '@/components/features/admin/useAdminList';
import { formatDateId } from '@/lib/shared/format';
import { ROLE_LABELS } from '@/lib/shared/navigation';

export default function AdminUsers({
  initialUsers = [],
  initialCounts = { all: 0, member: 0, curator: 0, admin: 0 },
  initialMeta = { page: 1, limit: 15, total: 0 },
}) {
  const {
    items: users,
    counts,
    meta,
    filter: role,
    setFilter: setRole,
    q,
    setQ,
    loading,
    errorMsg,
    fetchList: fetchUsers,
  } = useAdminList({
    endpoint: '/api/admin/users',
    dataKey: 'users',
    initialItems: initialUsers,
    initialCounts,
    initialMeta,
    initialFilter: '',
    filterParam: 'role',
    limit: 15,
  });

  const tabs = [
    { label: 'Semua', value: '', count: counts.all },
    { label: 'Member', value: 'member', count: counts.member },
    { label: 'Kurator', value: 'curator', count: counts.curator },
  ];

  const columns = [
    {
      key: 'id',
      label: 'ID',
      render: (row) => (
        <span className="font-semibold text-ink tabular-nums whitespace-nowrap">
          #{row.user_id}
        </span>
      ),
    },
    {
      key: 'user',
      label: 'Pengguna',
      render: (row) => (
        <div className="min-w-0">
          <p className="font-semibold text-ink truncate">{row.display_name}</p>
          <p className="text-xs text-ink-mute truncate">
            @{row.username} · {row.email}
          </p>
        </div>
      ),
    },
    {
      key: 'created_at',
      label: 'Terdaftar',
      cellClassName: 'tabular-nums whitespace-nowrap',
      render: (row) => formatDateId(row.created_at),
    },
    {
      key: 'role',
      label: 'Jenis akun',
      render: (row) => (
        <span className="inline-block rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 whitespace-nowrap">
          {ROLE_LABELS[row.role] || row.role}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <StatusBadge domain="user" status={row.status} />,
    },
    {
      key: 'actions',
      label: 'Tindakan',
      className: 'text-right',
      cellClassName: 'text-right',
      render: (row) => (
        <Link
          href={`/dashboard/admin/users/${row.user_id}`}
          className="text-sm font-semibold text-brand-700 hover:underline whitespace-nowrap"
        >
          Kelola akun →
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {errorMsg ? (
        <Alert tone="danger" title="Gagal memuat daftar pengguna">
          {errorMsg}
        </Alert>
      ) : null}

      <DataTable
        title="Daftar Pengguna"
        tabs={tabs}
        activeTab={role}
        onTabChange={(val) => {
          setRole(val);
          fetchUsers({ nextFilter: val, nextQ: q, nextPage: 1 });
        }}
        headerActions={
          <SearchBar
            compact
            value={q}
            onChange={setQ}
            placeholder="Cari username atau email…"
            onSubmit={(val) => {
              setQ(val);
              fetchUsers({ nextFilter: role, nextQ: val, nextPage: 1 });
            }}
          />
        }
        columns={columns}
        rows={users}
        rowKey="user_id"
        loading={loading}
        emptyTitle="Tidak ada pengguna ditemukan"
        emptyDescription="Coba ubah filter peran atau kata kunci pencarian."
        authorityNote="Akses Admin: kamu dapat menangguhkan/mengaktifkan akun Member dan Kurator; penghapusan permanen hanya berlaku bagi akun tanpa riwayat aktivitas (D-11)."
      />

      <Pagination
        page={meta.page}
        limit={meta.limit}
        total={meta.total}
        onPageChange={(nextPage) =>
          fetchUsers({ nextFilter: role, nextQ: q, nextPage })
        }
      />
    </div>
  );
}
