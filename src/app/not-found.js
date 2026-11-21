import Button from '@/components/ui/Button';
import Footer from '@/components/layout/Footer';
import Navbar from '@/components/layout/Navbar';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-5 py-20 text-center">
        <span className="rounded-full bg-tint-lavender px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-brand-700">
          404 · HALAMAN TIDAK DITEMUKAN
        </span>
        <h1 className="mt-4 text-3xl font-semibold text-ink sm:text-4xl">
          Halaman yang kamu cari tidak tersedia.
        </h1>
        <p className="mt-3 text-base text-ink-soft">
          Mungkin tautan sudah berubah, karya telah disembunyikan, atau halaman tidak dapat diakses.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button variant="primary" href="/">
            Kembali ke Beranda →
          </Button>
          <Button variant="secondary" href="/artworks">
            Jelajahi karya
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
}
