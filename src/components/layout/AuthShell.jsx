import Navbar from '@/components/layout/Navbar';

const AUTH_PILLARS = [
  { number: '01', title: 'Portofolio', subtitle: 'Tampilkan karya digitalmu' },
  { number: '02', title: 'Apresiasi', subtitle: 'Interaksi & komentar' },
  { number: '03', title: 'Kompetisi', subtitle: 'Tantangan kurasi terbuka' },
];

export default function AuthShell({
  eyebrow,
  title,
  subtitle,
  children,
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      <Navbar />

      <main className="mx-auto flex w-full max-w-7xl flex-1 items-center px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="grid w-full grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-10">
          {/* Panel Kiri: Tipografi Editorial + Pilar Ringkas */}
          <div className="hidden lg:col-span-6 lg:flex lg:flex-col lg:justify-center lg:space-y-6 lg:pr-4">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-700">
                {eyebrow}
              </p>
              <h1 className="text-display-fluid font-semibold text-ink">
                {title}
              </h1>
              <p className="max-w-xl text-base leading-relaxed text-ink-soft lg:text-lg">
                {subtitle}
              </p>
            </div>

            <div className="grid max-w-xl grid-cols-3 gap-3">
              {AUTH_PILLARS.map((item) => (
                <div
                  key={item.number}
                  className="rounded-[18px] border border-line/80 bg-surface/75 p-3.5 shadow-card-sm"
                >
                  <p className="tabular-nums text-xs font-semibold text-brand-700">
                    {item.number}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-ink">{item.title}</p>
                  <p className="mt-0.5 text-xs text-ink-soft">{item.subtitle}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Kartu Form Kanan */}
          <div className="lg:col-span-6">
            <div className="rounded-[26px] border border-line bg-surface p-5 shadow-card sm:p-8">
              <div className="mb-5 space-y-1.5 lg:hidden">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-brand-700">
                  {eyebrow}
                </p>
                <h1 className="text-[1.75rem] font-semibold leading-tight text-ink">
                  {title}
                </h1>
                <p className="text-sm text-ink-soft">{subtitle}</p>
              </div>
              {children}
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-line bg-surface/70">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-2 px-4 py-4 text-xs text-ink-mute sm:flex-row sm:items-center sm:px-6 lg:px-8">
          <p>© 2026 ARTIVA</p>
          <p>Satu ide kecil. Kemungkinan tak terbatas.</p>
        </div>
      </footer>
    </div>
  );
}
