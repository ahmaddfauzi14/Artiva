'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import ConfirmModal from '@/components/ui/ConfirmModal';
import FormField from '@/components/ui/FormField';
import ImageUploader from '@/components/ui/ImageUploader';
import { useToast } from '@/components/ui/Toast';
import { apiFetch } from '@/lib/shared/api-client';

export default function ArtworkEditorForm({
  categories = [],
  initialArtwork = null,
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const isEdit = Boolean(initialArtwork);

  const [title, setTitle] = useState(initialArtwork?.title || '');
  const [description, setDescription] = useState(
    initialArtwork?.description || ''
  );
  const [categoryId, setCategoryId] = useState(
    initialArtwork?.category?.category_id
      ? String(initialArtwork.category.category_id)
      : categories[0]
        ? String(categories[0].category_id)
        : ''
  );
  const [status, setStatus] = useState(initialArtwork?.status || 'published');
  const [imageFile, setImageFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setFieldErrors({});

    if (!isEdit && !imageFile) {
      setFieldErrors({ image: 'Gambar karya wajib dipilih.' });
      setErrorMsg('Pilih file gambar sebelum menyimpan karya.');
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.set('title', title);
      fd.set('description', description);
      fd.set('category_id', categoryId);
      fd.set('status', status);
      if (imageFile) {
        fd.set('image', imageFile);
      }

      if (isEdit) {
        await apiFetch(`/api/me/artworks/${initialArtwork.artwork_id}`, {
          method: 'PATCH',
          body: fd,
        });
        showToast({
          tone: 'success',
          title: 'Perubahan tersimpan',
          message: 'Detail karyamu telah diperbarui.',
        });
      } else {
        await apiFetch('/api/me/artworks', {
          method: 'POST',
          body: fd,
        });
        showToast({
          tone: 'success',
          title: 'Karya tersimpan',
          message: 'Karyamu berhasil ditambahkan ke portofolio.',
        });
      }

      router.push('/dashboard/member?tab=artworks');
      router.refresh();
    } catch (err) {
      setErrorMsg(err.message);
      if (err.fields) setFieldErrors(err.fields);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!initialArtwork) return;
    setDeleting(true);
    try {
      await apiFetch(`/api/me/artworks/${initialArtwork.artwork_id}`, {
        method: 'DELETE',
      });
      showToast({
        tone: 'info',
        title: 'Karya dihapus',
        message: 'Karya telah dihapus dari daftar portofoliomu.',
      });
      setDeleteOpen(false);
      router.push('/dashboard/member?tab=artworks');
      router.refresh();
    } catch (err) {
      showToast({ tone: 'error', message: err.message });
    } finally {
      setDeleting(false);
    }
  };

  const hasInactiveOriginalCategory =
    isEdit &&
    initialArtwork?.category &&
    !categories.some(
      (c) => c.category_id === initialArtwork.category.category_id
    );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errorMsg ? (
        <Alert tone="danger" title="Belum dapat menyimpan karya">
          {errorMsg}
        </Alert>
      ) : null}

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
        {/* Kiri: Gambar + Informasi Karya */}
        <div className="space-y-6 rounded-[28px] border border-line bg-surface p-6 shadow-card sm:p-8 lg:col-span-8">
          <ImageUploader
            label={isEdit ? 'Gambar karya (opsional untuk diganti)' : 'Gambar karya'}
            currentUrl={initialArtwork?.image_url || null}
            onFileSelect={setImageFile}
            error={fieldErrors.image}
            required={!isEdit}
          />

          <FormField
            label="Judul karya"
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Contoh: Cahaya Senja di Pelabuhan"
            helperText="Maksimal 120 karakter."
            error={fieldErrors.title}
            required
          />

          <FormField
            label="Kategori"
            name="category_id"
            as="select"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            error={fieldErrors.category_id}
            required
          >
            {hasInactiveOriginalCategory ? (
              <option value={String(initialArtwork.category.category_id)}>
                {initialArtwork.category.name} (nonaktif, pilih kategori aktif bila ingin mengubah)
              </option>
            ) : null}
            {categories.map((cat) => (
              <option key={cat.category_id} value={String(cat.category_id)}>
                {cat.name}
              </option>
            ))}
          </FormField>

          <FormField
            label="Cerita atau deskripsi karya"
            name="description"
            as="textarea"
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ceritakan konsep, media, atau proses di balik karya ini..."
            error={fieldErrors.description}
          />
        </div>

        {/* Kanan: Status Karya & Aksi */}
        <div className="space-y-6 lg:col-span-4">
          <div className="space-y-4 rounded-[28px] border border-line bg-surface p-6 shadow-card">
            <h2 className="text-xl font-semibold text-ink">Status karya</h2>

            <div className="space-y-3">
              <label className="flex cursor-pointer items-start gap-3 rounded-[18px] border border-line bg-canvas p-4 hover:border-brand-200">
                <input
                  type="radio"
                  name="artwork_status"
                  value="published"
                  checked={status === 'published'}
                  onChange={() => setStatus('published')}
                  className="mt-1 h-4 w-4 accent-brand-600"
                />
                <div className="space-y-0.5">
                  <p className="text-sm font-semibold text-ink">
                    Dipublikasikan
                  </p>
                  <p className="text-xs text-ink-soft">
                    Tampil di galeri publik dan dapat diajukan ke tantangan.
                  </p>
                </div>
              </label>

              <label className="flex cursor-pointer items-start gap-3 rounded-[18px] border border-line bg-canvas p-4 hover:border-brand-200">
                <input
                  type="radio"
                  name="artwork_status"
                  value="hidden"
                  checked={status === 'hidden'}
                  onChange={() => setStatus('hidden')}
                  className="mt-1 h-4 w-4 accent-brand-600"
                />
                <div className="space-y-0.5">
                  <p className="text-sm font-semibold text-ink">
                    Disembunyikan
                  </p>
                  <p className="text-xs text-ink-soft">
                    Hanya terlihat olehmu. Mengubah karya menjadi disembunyikan otomatis menarik submission yang sedang aktif.
                  </p>
                </div>
              </label>
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <Button
                type="submit"
                variant="primary"
                loading={loading}
                className="w-full"
              >
                Simpan karya
              </Button>
              <Button
                variant="secondary"
                href="/dashboard/member?tab=artworks"
                className="w-full"
              >
                Batal
              </Button>
            </div>
          </div>

          <div className="rounded-[28px] bg-tint-lavender p-6 shadow-tint-lavender space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-brand-700">
              TIPS UNGGAH KARYA
            </p>
            <p className="text-sm text-ink-soft">
              Gunakan gambar resolusi tajam dalam format JPEG, PNG, atau WEBP (maksimal 5 MB). Satu karya bisa dikirimkan ke banyak tantangan tanpa unggah ulang.
            </p>
          </div>

          {isEdit ? (
            <div className="rounded-[28px] border border-[#6E2734] bg-[#38171E]/60 p-6 space-y-3">
              <h3 className="text-base font-semibold text-[#FCA5A5]">
                Hapus karya
              </h3>
              <p className="text-sm text-[#FECACA]">
                Karya yang dihapus akan hilang dari daftar milikmu dan submission aktif pada tantangan yang belum diumumkan akan ditarik otomatis.
              </p>
              <Button
                variant="danger"
                size="sm"
                onClick={() => setDeleteOpen(true)}
              >
                Hapus karya
              </Button>
            </div>
          ) : null}
        </div>
      </div>

      <ConfirmModal
        open={deleteOpen}
        title="Hapus karya ini?"
        description={`"${title || initialArtwork?.title}" akan dihapus dari karya milikmu. Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Ya, hapus karya"
        cancelLabel="Batal"
        variant="danger"
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteOpen(false)}
      />
    </form>
  );
}
