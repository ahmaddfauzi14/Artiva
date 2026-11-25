'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import ConfirmModal from '@/components/ui/ConfirmModal';
import FormField from '@/components/ui/FormField';
import ImageUploader from '@/components/ui/ImageUploader';
import StatusBadge from '@/components/ui/StatusBadge';
import { useToast } from '@/components/ui/Toast';
import { apiFetch } from '@/lib/shared/api-client';
import { todayInTz } from '@/lib/shared/format';

export default function ChallengeEditorForm({
  categories = [],
  initialChallenge = null,
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const isEdit = Boolean(initialChallenge);
  const status = initialChallenge?.status || 'draft';

  const isOpen = isEdit && status === 'open';
  const isReadOnly = isEdit && (status === 'closed' || status === 'announced');

  const today = todayInTz();
  const [title, setTitle] = useState(initialChallenge?.title || '');
  const [description, setDescription] = useState(
    initialChallenge?.description || ''
  );
  const [rules, setRules] = useState(initialChallenge?.rules || '');
  const [prize, setPrize] = useState(initialChallenge?.prize || '');
  const [bannerFile, setBannerFile] = useState(null);
  const [removeBanner, setRemoveBanner] = useState(false);
  const [categoryId, setCategoryId] = useState(
    initialChallenge?.category_id ? String(initialChallenge.category_id) : ''
  );
  const [startDate, setStartDate] = useState(
    initialChallenge?.start_date || today
  );
  const [endDate, setEndDate] = useState(initialChallenge?.end_date || '');

  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const dateInvalid = Boolean(startDate && endDate && endDate <= startDate);

  const submitChallenge = async (publishNow = false) => {
    setErrorMsg('');
    setFieldErrors({});

    if (dateInvalid) {
      setFieldErrors({
        end_date: 'Tanggal berakhir harus lebih akhir dari tanggal mulai.',
      });
      setErrorMsg('Periksa rentang tanggal tantangan.');
      return;
    }

    setLoading(true);
    try {
      if (isEdit) {
        let body;
        if (isOpen) {
          body = { description, rules, end_date: endDate };
        } else {
          const fd = new FormData();
          fd.set('title', title);
          fd.set('description', description);
          fd.set('rules', rules);
          fd.set('prize', prize);
          fd.set('category_id', categoryId || '');
          fd.set('start_date', startDate);
          fd.set('end_date', endDate);
          if (bannerFile) {
            fd.set('banner', bannerFile);
          } else if (removeBanner) {
            fd.set('remove_banner', 'true');
          }
          body = fd;
        }

        await apiFetch(
          `/api/curator/challenges/${initialChallenge.challenge_id}`,
          { method: 'PATCH', body }
        );
        showToast({
          tone: 'success',
          title: 'Perubahan tersimpan',
          message: 'Detail tantangan telah diperbarui.',
        });
      } else {
        const fd = new FormData();
        fd.set('title', title);
        fd.set('description', description);
        fd.set('rules', rules);
        fd.set('prize', prize);
        fd.set('category_id', categoryId || '');
        fd.set('start_date', startDate);
        fd.set('end_date', endDate);
        fd.set('publish', publishNow ? 'true' : 'false');
        if (bannerFile) {
          fd.set('banner', bannerFile);
        }

        await apiFetch('/api/curator/challenges', {
          method: 'POST',
          body: fd,
        });
        showToast({
          tone: 'success',
          title: publishNow ? 'Tantangan dipublikasikan' : 'Draft tersimpan',
          message: publishNow
            ? 'Tantangan kini terbuka untuk peserta.'
            : 'Tantangan tersimpan sebagai Draft.',
        });
      }

      router.push('/curator/challenges');
      router.refresh();
    } catch (err) {
      setErrorMsg(err.message);
      if (err.fields) setFieldErrors(err.fields);
    } finally {
      setLoading(false);
    }
  };

  const handlePublishDraft = async () => {
    setPublishing(true);
    try {
      await apiFetch(
        `/api/curator/challenges/${initialChallenge.challenge_id}/publish`,
        { method: 'POST' }
      );
      showToast({
        tone: 'success',
        title: 'Tantangan dipublikasikan',
        message: 'Tantangan kini berstatus Terbuka.',
      });
      router.push('/curator/challenges');
      router.refresh();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setPublishing(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await apiFetch(
        `/api/curator/challenges/${initialChallenge.challenge_id}`,
        { method: 'DELETE' }
      );
      setDeleteOpen(false);
      showToast({
        tone: 'info',
        title: 'Tantangan dihapus',
        message: 'Tantangan berhasil dihapus.',
      });
      router.push('/curator/challenges');
      router.refresh();
    } catch (err) {
      showToast({ tone: 'error', message: err.message });
    } finally {
      setDeleting(false);
    }
  };

  const canDelete =
    isEdit && (status === 'draft' || initialChallenge.total_submissions === 0);

  return (
    <div className="space-y-6">
      {isEdit ? (
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge domain="challenge" status={status} />
          {isOpen ? (
            <span className="text-sm text-ink-soft">
              Tantangan sedang Terbuka: hanya deskripsi, aturan, dan perpanjangan tanggal berakhir yang dapat diubah.
            </span>
          ) : isReadOnly ? (
            <span className="text-sm text-ink-soft">
              Tantangan yang sudah Ditutup atau Diumumkan tidak dapat diubah lagi.
            </span>
          ) : null}
        </div>
      ) : null}

      {errorMsg ? (
        <Alert tone="danger" title="Gagal menyimpan tantangan">
          {errorMsg}
        </Alert>
      ) : null}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!isReadOnly) submitChallenge(!isEdit);
        }}
        className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12"
      >
        <div className="space-y-5 rounded-[28px] border border-line bg-surface p-6 shadow-card sm:p-8 lg:col-span-8">
          <ImageUploader
            label="Banner tantangan (opsional)"
            aspectClass="aspect-[16/9]"
            currentUrl={removeBanner ? null : initialChallenge?.banner_url || null}
            disabled={isOpen || isReadOnly}
            onFileSelect={(file) => {
              setBannerFile(file);
              setRemoveBanner(false);
            }}
            onClear={
              !isOpen &&
              !isReadOnly &&
              (bannerFile || (!removeBanner && initialChallenge?.banner_url))
                ? () => {
                    setBannerFile(null);
                    setRemoveBanner(true);
                  }
                : undefined
            }
            clearLabel="Hapus banner"
            helperText={
              isOpen
                ? 'Banner terkunci selama tantangan berlangsung.'
                : 'JPEG/PNG/WEBP, maks. 5 MB. Rasio 16:9 disarankan.'
            }
            error={fieldErrors.banner || fieldErrors.image}
          />

          <FormField
            label="Judul tantangan"
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Contoh: Poster Kampus Hijau 2026"
            disabled={isOpen || isReadOnly}
            helperText={
              isOpen ? 'Judul terkunci selama tantangan berlangsung.' : '3–150 karakter.'
            }
            error={fieldErrors.title}
            required
          />

          <FormField
            label="Kategori karya yang diterima (opsional)"
            name="category_id"
            as="select"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            disabled={isOpen || isReadOnly}
            helperText={
              isOpen
                ? 'Kategori terkunci selama tantangan berlangsung.'
                : 'Biarkan "Semua Kategori" bila terbuka untuk semua jenis karya.'
            }
            error={fieldErrors.category_id}
          >
            <option value="">Semua Kategori (bebas)</option>
            {categories.map((c) => (
              <option key={c.category_id} value={String(c.category_id)}>
                {c.name}
              </option>
            ))}
          </FormField>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              label="Tanggal mulai"
              name="start_date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              disabled={isOpen || isReadOnly}
              error={fieldErrors.start_date}
              required
            />
            <FormField
              label="Tanggal berakhir"
              name="end_date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              disabled={isReadOnly}
              error={
                fieldErrors.end_date ||
                (dateInvalid
                  ? 'Tanggal berakhir harus lebih akhir dari tanggal mulai.'
                  : '')
              }
              helperText={
                isOpen
                  ? 'Hanya boleh diperpanjang (tidak boleh dimajukan).'
                  : 'Inklusif sampai pukul 23:59 WITA.'
              }
              required
            />
          </div>

          <FormField
            label="Hadiah & Apresiasi (opsional)"
            name="prize"
            as="textarea"
            rows={3}
            value={prize}
            onChange={(e) => setPrize(e.target.value)}
            disabled={isOpen || isReadOnly}
            placeholder="Contoh: Juara 1: Rp2.500.000 + Sertifikat Kurasi; Juara 2 & 3: Sorotan Galeri & Lencana Resmi."
            helperText={
              isOpen
                ? 'Informasi hadiah terkunci selama tantangan berlangsung.'
                : 'Maksimal 500 karakter.'
            }
            error={fieldErrors.prize}
          />

          <FormField
            label="Deskripsi tantangan"
            name="description"
            as="textarea"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isReadOnly}
            placeholder="Jelaskan tema, tujuan, dan konteks kreatif tantangan..."
            error={fieldErrors.description}
          />

          <FormField
            label="Aturan & kriteria kurasi"
            name="rules"
            as="textarea"
            rows={4}
            value={rules}
            onChange={(e) => setRules(e.target.value)}
            disabled={isReadOnly}
            placeholder="Cantumkan ketentuan orisinalitas, batas peserta, atau kriteria penilaian..."
            error={fieldErrors.rules}
          />
        </div>

        {/* Kartu Samping */}
        <div className="space-y-6 lg:col-span-4">
          <div className="space-y-4 rounded-[28px] border border-line bg-surface p-6 shadow-card">
            <h2 className="text-xl font-semibold text-ink">Sebelum disimpan</h2>
            <ul className="space-y-2 text-sm text-ink-soft list-disc pl-4">
              <li>Pastikan tanggal berakhir lebih akhir dari tanggal mulai.</li>
              <li>Tantangan <strong>Draft</strong> belum tampil ke publik.</li>
              <li>Setelah dipublikasikan, judul, kategori, hadiah, dan banner terkunci.</li>
            </ul>

            {!isReadOnly ? (
              <div className="flex flex-col gap-3 pt-2">
                {!isEdit ? (
                  <>
                    <Button
                      variant="primary"
                      loading={loading}
                      onClick={() => submitChallenge(true)}
                      className="w-full"
                    >
                      Publikasikan tantangan
                    </Button>
                    <Button
                      variant="secondary"
                      loading={loading}
                      onClick={() => submitChallenge(false)}
                      className="w-full"
                    >
                      Simpan sebagai Draft
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="primary"
                      loading={loading}
                      onClick={() => submitChallenge(false)}
                      className="w-full"
                    >
                      Simpan perubahan
                    </Button>
                    {status === 'draft' ? (
                      <Button
                        variant="tonal"
                        loading={publishing}
                        onClick={handlePublishDraft}
                        className="w-full"
                      >
                        Publikasikan sekarang
                      </Button>
                    ) : null}
                  </>
                )}

                <Button
                  variant="ghost"
                  href="/curator/challenges"
                  className="w-full"
                >
                  Kembali ke daftar
                </Button>
              </div>
            ) : (
              <Button
                variant="secondary"
                href="/curator/challenges"
                className="w-full"
              >
                Kembali ke daftar
              </Button>
            )}
          </div>

          {canDelete ? (
            <div className="rounded-[28px] border border-[#6E2734] bg-[#38171E]/60 p-6 space-y-3">
              <h3 className="text-base font-semibold text-[#FCA5A5]">
                Hapus tantangan
              </h3>
              <p className="text-sm text-[#FECACA]">
                Tantangan masih berstatus Draft atau belum menerima submission sehingga masih dapat dihapus.
              </p>
              <Button
                variant="danger"
                size="sm"
                onClick={() => setDeleteOpen(true)}
              >
                Hapus tantangan
              </Button>
            </div>
          ) : null}
        </div>
      </form>

      <ConfirmModal
        open={deleteOpen}
        title="Hapus tantangan ini?"
        description={`Tantangan "${title}" akan dihapus secara permanen.`}
        confirmLabel="Ya, hapus tantangan"
        cancelLabel="Batal"
        variant="danger"
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteOpen(false)}
      />
    </div>
  );
}
