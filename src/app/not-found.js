import PublicShell from '@/components/layout/PublicShell';
import Button from '@/components/ui/Button';
import { getPublicViewer } from '@/lib/auth/page-guards';

export default async function NotFoundPage() {
  const user = await getPublicViewer();

  return (
    <PublicShell
      user={user}
      mainClassName="flex max-w-2xl flex-col items-center justify-center py-10 text-center sm:py-14"
    >
      <span className="rounded-full bg-tint-lavender px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-brand-700">
        404 · HALAMAN TIDAK DITEMUKAN
      </span>
      <h1 className="mt-4 text-3xl font-semibold text-ink sm:text-4xl">
        Halaman yang kamu cari tidak tersedia.
      </h1>
      <p className="mt-2.5 text-base text-ink-soft">
        Mungkin tautan sudah berubah, karya telah disembunyikan, atau halaman tidak dapat diakses.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button variant="primary" href="/">
          Kembali ke Beranda →
        </Button>
        <Button variant="secondary" href="/artworks">
          Jelajahi karya
        </Button>
      </div>
    </PublicShell>
  );
}
