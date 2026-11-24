import Button from '@/components/ui/Button';

export default function AdminNotFoundPage() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center justify-center rounded-[28px] border border-line bg-surface px-6 py-16 text-center shadow-card">
      <span className="rounded-full bg-tint-lavender px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-brand-700">
        404 · DATA TIDAK DITEMUKAN
      </span>
      <h1 className="mt-4 text-2xl font-semibold text-ink sm:text-3xl">
        Halaman atau data admin tidak tersedia.
      </h1>
      <p className="mt-3 text-base text-ink-soft">
        Tautan yang kamu buka mungkin tidak valid, atau data yang dicari sudah dihapus.
      </p>
      <div className="mt-8">
        <Button variant="primary" href="/dashboard/admin">
          Kembali ke Dashboard Admin →
        </Button>
      </div>
    </div>
  );
}
