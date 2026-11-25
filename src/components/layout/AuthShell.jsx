import Navbar from '@/components/layout/Navbar';

export default function AuthShell({
  eyebrow,
  title,
  subtitle,
  children,
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="mx-auto flex w-full max-w-[90rem] flex-1 items-center px-4 py-10 sm:px-6 md:px-8 lg:py-14">
        <div className="grid w-full grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
          {/* Panel Kiri: Tipografi Editorial Besar + Pilar Ringkas agar seimbang dengan tinggi form */}
          <div className="hidden lg:col-span-6 lg:flex lg:flex-col lg:justify-center lg:space-y-7 lg:pr-4">
            <div className="space-y-4">
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-brand-700">
                {eyebrow}
              </p>
              <h1 className="text-[2.75rem] font-semibold leading-[1.08] tracking-[-0.025em] text-ink xl:text-[3.375rem]">
                {title}
              </h1>
              <p className="max-w-xl text-lg leading-relaxed text-ink-soft xl:text-xl">
                {subtitle}
              </p>
            </div>

            <div className="grid max-w-xl grid-cols-3 gap-3 pt-2">
              <div className="rounded-[18px] border border-line/80 bg-surface/75 p-4 shadow-card-sm">
                <p className="tabular-nums text-xs font-semibold text-brand-700">01</p>
                <p className="mt-1 text-sm font-semibold text-ink">Portofolio</p>
                <p className="mt-0.5 text-xs text-ink-soft">Tampilkan karya digitalmu</p>
              </div>
              <div className="rounded-[18px] border border-line/80 bg-surface/75 p-4 shadow-card-sm">
                <p className="tabular-nums text-xs font-semibold text-brand-700">02</p>
                <p className="mt-1 text-sm font-semibold text-ink">Apresiasi</p>
                <p className="mt-0.5 text-xs text-ink-soft">Interaksi &amp; komentar</p>
              </div>
              <div className="rounded-[18px] border border-line/80 bg-surface/75 p-4 shadow-card-sm">
                <p className="tabular-nums text-xs font-semibold text-brand-700">03</p>
                <p className="mt-1 text-sm font-semibold text-ink">Kompetisi</p>
                <p className="mt-0.5 text-xs text-ink-soft">Tantangan kurasi terbuka</p>
              </div>
            </div>
          </div>

          {/* Kartu Form Kanan */}
          <div className="lg:col-span-6">
            <div className="rounded-[28px] border border-line bg-surface p-6 shadow-card sm:p-10">
              <div className="mb-6 space-y-2 lg:hidden">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-brand-700">
                  {eyebrow}
                </p>
                <h1 className="text-[2rem] font-semibold leading-tight text-ink">
                  {title}
                </h1>
                <p className="text-base text-ink-soft">{subtitle}</p>
              </div>
              {children}
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-line bg-surface/70">
        <div className="mx-auto flex max-w-[90rem] flex-col justify-between gap-2 px-4 py-5 text-sm text-ink-mute sm:flex-row sm:items-center sm:px-6 md:px-8">
          <p>© 2026 ARTIVA</p>
          <p>Satu ide kecil. Kemungkinan tak terbatas.</p>
        </div>
      </footer>
    </div>
  );
}
