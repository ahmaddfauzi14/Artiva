'use client';

import Link from 'next/link';
import Alert from '@/components/ui/Alert';
import ChipRow from '@/components/ui/Chip';
import DataTable from '@/components/ui/DataTable';
import Pagination from '@/components/ui/Pagination';
import SearchBar from '@/components/ui/SearchBar';
import StatusBadge from '@/components/ui/StatusBadge';
import { useAdminList } from '@/components/features/admin/useAdminList';

const ROLE_LABELS = {
  member: 'Member',
  curator: 'Kurator',
  admin: 'Admin',
};

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
      key: 'user',
      label: 'Pengguna',
      colWidth: 'minmax(160px, 1fr)',
      render: (row) => (
        <p className="font-semibold text-ink truncate">{row.display_name}</p>
      ),
    },
    {
      key: 'role',
      label: 'Jenis akun',
      colWidth: '108px',
      className: 'text-right',
      cellClassName: 'flex justify-end',
      render: (row) => (
        <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 whitespace-nowrap">
          {ROLE_LABELS[row.role] || row.role}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      colWidth: '124px',
      className: 'text-right',
      cellClassName: 'flex justify-end',
      render: (row) => <StatusBadge domain="user" status={row.status} />,
    },
    {
      key: 'actions',
      label: 'Tindakan',
      colWidth: '128px',
      className: 'text-right',
      cellClassName: 'flex justify-end',
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
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <ChipRow
          items={tabs}
          activeValue={role}
          onSelect={(val) => {
            setRole(val);
            fetchUsers({ nextFilter: val, nextQ: q, nextPage: 1 });
          }}
        />
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
      </div>

      {errorMsg ? (
        <Alert tone="danger" title="Gagal memuat daftar pengguna">
          {errorMsg}
        </Alert>
      ) : null}

      <DataTable
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
