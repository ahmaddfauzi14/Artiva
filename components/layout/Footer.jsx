import Link from 'next/link';
import ArtivaLogo from '@/components/layout/ArtivaLogo';
import MotionToggle from '@/components/effects/MotionToggle';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-line bg-surface/80">
      <div className="mx-auto max-w-6xl px-5 py-12 md:px-8">
        <div className="flex flex-col justify-between gap-8 sm:flex-row sm:items-center">
          <div>
            <Link href="/" className="inline-flex min-h-[44px] items-center">
              <ArtivaLogo size="sm" />
            </Link>
            <p className="mt-2 text-base text-ink-soft">
              Ruang bertemu karya, ide, dan apresiasi.
            </p>
          </div>

          <div className="flex flex-col items-start gap-4 sm:items-end">
            <nav
              aria-label="Navigasi footer"
              className="flex flex-wrap items-center gap-6 text-sm font-semibold text-ink-soft"
            >
              <Link href="/artworks" className="hover:text-brand-700">
                Jelajahi karya
              </Link>
              <Link href="/challenges" className="hover:text-brand-700">
                Tantangan
              </Link>
              <Link href="/login" className="hover:text-brand-700">
                Masuk
              </Link>
              <Link href="/register/member" className="hover:text-brand-700">
                Daftar
              </Link>
            </nav>
            <MotionToggle />
          </div>
        </div>

        <div className="mt-8 flex flex-col justify-between gap-2 border-t border-line pt-6 text-sm text-ink-mute sm:flex-row sm:items-center">
          <p>© 2026 ARTIVA. Ruang untuk setiap kreativitas.</p>
          <p>Satu karya, tiga fungsi: tampil, berinteraksi, berkompetisi.</p>
        </div>
      </div>
    </footer>
  );
}
