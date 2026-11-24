'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import ChipRow from '@/components/ui/Chip';
import ConfirmModal from '@/components/ui/ConfirmModal';
import DataTable from '@/components/ui/DataTable';
import FormField from '@/components/ui/FormField';
import StatusBadge from '@/components/ui/StatusBadge';
import { useToast } from '@/components/ui/Toast';
import { apiFetch } from '@/lib/shared/api-client';

export default function AdminCategories({ initialCategories = [] }) {
  const router = useRouter();
  const { showToast } = useToast();

  const [categories, setCategories] = useState(initialCategories);
  const [filter, setFilter] = useState('active');

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const activeList = categories.filter((c) => c.is_active);
  const inactiveList = categories.filter((c) => !c.is_active);
  const visibleRows = filter === 'active' ? activeList : inactiveList;

  const openCreateModal = () => {
    setEditing(null);
    setName('');
    setDescription('');
    setFormError('');
    setFormOpen(true);
  };

  const openEditModal = (cat) => {
    setEditing(cat);
    setName(cat.name);
    setDescription(cat.description || '');
    setFormError('');
    setFormOpen(true);
  };

  const refreshCategories = async () => {
    const res = await apiFetch('/api/admin/categories');
    setCategories(res.data.categories || []);
  };

  const handleSave = async () => {
    if (!name.trim() || name.trim().length < 2) {
      setFormError('Nama kategori minimal 2 karakter.');
      return;
    }
    setFormError('');
    setSaving(true);
    try {
      if (editing) {
        await apiFetch(`/api/admin/categories/${editing.category_id}`, {
          method: 'PATCH',
          body: { name: name.trim(), description: description.trim() },
        });
        showToast({
          tone: 'success',
          title: 'Kategori diperbarui',
          message: `Kategori "${name.trim()}" berhasil disimpan.`,
        });
      } else {
        await apiFetch('/api/admin/categories', {
          method: 'POST',
          body: { name: name.trim(), description: description.trim() },
        });
        showToast({
          tone: 'success',
          title: 'Kategori ditambahkan',
          message: `Kategori "${name.trim()}" siap digunakan.`,
        });
      }
      await refreshCategories();
      setFormOpen(false);
      router.refresh();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (cat) => {
    try {
      await apiFetch(`/api/admin/categories/${cat.category_id}`, {
        method: 'PATCH',
        body: { is_active: !cat.is_active },
      });
      await refreshCategories();
      showToast({
        tone: 'info',
        message: cat.is_active
          ? `Kategori "${cat.name}" dinonaktifkan.`
          : `Kategori "${cat.name}" diaktifkan kembali.`,
      });
      router.refresh();
    } catch (err) {
      showToast({ tone: 'error', message: err.message });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await apiFetch(`/api/admin/categories/${deleteTarget.category_id}`, {
        method: 'DELETE',
      });
      await refreshCategories();
      setDeleteTarget(null);
      showToast({
        tone: 'info',
        title: 'Kategori dihapus',
        message: `Kategori "${deleteTarget.name}" telah dihapus.`,
      });
      router.refresh();
    } catch (err) {
      showToast({ tone: 'error', message: err.message });
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Kategori',
      render: (row) => (
        <div>
          <p className="font-semibold text-ink">{row.name}</p>
          {row.description ? (
            <p className="text-xs text-ink-mute line-clamp-1">
              {row.description}
            </p>
          ) : null}
        </div>
      ),
    },
    {
      key: 'slug',
      label: 'Slug',
      render: (row) => (
        <code className="rounded bg-brand-50 px-2 py-0.5 text-xs text-brand-700">
          {row.slug}
        </code>
      ),
    },
    {
      key: 'usage',
      label: 'Pemakaian',
      render: (row) => (
        <span className="text-ink-soft">
          {row.artwork_count} karya · {row.challenge_count} tantangan
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <StatusBadge
          label={row.is_active ? 'Aktif' : 'Nonaktif'}
          tone={row.is_active ? 'success' : 'neutral'}
        />
      ),
    },
    {
      key: 'actions',
      label: 'Tindakan',
      render: (row) => {
        const inUse = row.artwork_count > 0 || row.challenge_count > 0;
        return (
          <div className="flex flex-wrap items-center gap-3 whitespace-nowrap">
            <button
              type="button"
              onClick={() => openEditModal(row)}
              className="cursor-pointer text-sm font-semibold text-brand-700 hover:underline"
            >
              Ubah
            </button>
            <button
              type="button"
              onClick={() => handleToggleActive(row)}
              className="cursor-pointer text-sm font-semibold text-ink-soft hover:underline"
            >
              {row.is_active ? 'Nonaktifkan' : 'Aktifkan'}
            </button>
            {!inUse ? (
              <button
                type="button"
                onClick={() => setDeleteTarget(row)}
                className="cursor-pointer text-sm font-semibold text-[#FCA5A5] hover:underline"
              >
                Hapus
              </button>
            ) : null}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <ChipRow
          items={[
            { label: 'Aktif', value: 'active', count: activeList.length },
            { label: 'Nonaktif', value: 'inactive', count: inactiveList.length },
          ]}
          activeValue={filter}
          onSelect={setFilter}
        />
        <Button variant="primary" onClick={openCreateModal}>
          Tambah kategori
        </Button>
      </div>

      <DataTable
        columns={columns}
        rows={visibleRows}
        rowKey="category_id"
        emptyTitle="Tidak ada kategori pada tab ini"
        emptyDescription="Tambahkan kategori baru atau ubah status kategori yang sudah ada."
        authorityNote="Aturan BR-14: kategori yang sudah dipakai oleh karya atau tantangan tidak dapat dihapus permanen. Gunakan Nonaktifkan agar tidak bisa dipilih untuk unggahan baru."
      />

      {/* Modal Tambah / Ubah Kategori */}
      <ConfirmModal
        open={formOpen}
        title={editing ? 'Ubah kategori' : 'Tambah kategori baru'}
        description="Slug URL akan dibuat otomatis dari nama kategori."
        confirmLabel="Simpan kategori"
        cancelLabel="Batal"
        loading={saving}
        onConfirm={handleSave}
        onClose={() => setFormOpen(false)}
      >
        <div className="space-y-4">
          {formError ? <Alert tone="danger">{formError}</Alert> : null}
          <FormField
            label="Nama kategori"
            name="category_name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Contoh: Animasi 2D"
            required
          />
          <FormField
            label="Deskripsi (opsional)"
            name="category_description"
            as="textarea"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Penjelasan singkat kategori ini..."
          />
        </div>
      </ConfirmModal>

      {/* Modal Hapus Kategori */}
      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Hapus kategori ini?"
        description={`Kategori "${deleteTarget?.name || ''}" belum dipakai dan akan dihapus permanen.`}
        confirmLabel="Ya, hapus kategori"
        cancelLabel="Batal"
        variant="danger"
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
