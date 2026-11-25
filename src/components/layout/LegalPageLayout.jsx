import Link from 'next/link';
import PageHeader from '@/components/layout/PageHeader';
import PublicShell from '@/components/layout/PublicShell';

/**
 * Tata letak bersama untuk halaman informasi legal (Privasi & Ketentuan).
 * Memecah konten menjadi daftar isi cepat di kiri dan teks yang nyaman dibaca di kanan.
 */
export default function LegalPageLayout({
  user,
  eyebrow,
  title,
  subtitle,
  sections = [],
  relatedLinks = [],
}) {
  return (
    <PublicShell user={user} mainClassName="space-y-7 py-6 sm:py-8">
      <PageHeader eyebrow={eyebrow} title={title} subtitle={subtitle} />

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        {/* Ringkasan & Navigasi Cepat */}
        <aside className="space-y-4 rounded-[24px] border border-line bg-surface/90 p-5 shadow-card-sm lg:sticky lg:top-20 lg:col-span-4">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-brand-700">
              DAFTAR ISI
            </p>
            <p className="text-sm text-ink-soft">
              Lompat langsung ke bagian yang ingin kamu baca.
            </p>
          </div>

          <nav aria-label="Daftar isi halaman">
            <ol className="space-y-1.5 text-sm">
              {sections.map((section, idx) => (
                <li key={section.title}>
                  <a
                    href={`#bagian-${idx + 1}`}
                    className="flex min-h-[38px] items-center rounded-xl px-3 py-1.5 font-medium text-ink-soft transition-colors hover:bg-brand-50 hover:text-brand-700"
                  >
                    {section.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          {relatedLinks.length > 0 ? (
            <div className="border-t border-line pt-4">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-mute">
                DOKUMEN TERKAIT
              </p>
              <div className="mt-2 flex flex-wrap gap-3 text-sm">
                {relatedLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="inline-flex min-h-[36px] items-center font-semibold text-brand-700 hover:underline"
                  >
                    {link.label} →
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </aside>

        {/* Konten Utama dengan Panjang Baris Terjaga (max-w-prose) */}
        <div className="space-y-5 rounded-[24px] border border-line bg-surface p-5 shadow-card sm:p-7 lg:col-span-8">
          {sections.map((section, idx) => (
            <section
              key={section.title}
              id={`bagian-${idx + 1}`}
              className="scroll-mt-24 space-y-2 border-b border-line/60 pb-5 last:border-b-0 last:pb-0"
            >
              <h2 className="text-lg font-semibold text-ink sm:text-xl">
                {section.title}
              </h2>
              {section.body.map((paragraph, pIdx) => (
                <p
                  key={pIdx}
                  className="max-w-[70ch] text-sm leading-relaxed text-ink-soft sm:text-base"
                >
                  {paragraph}
                </p>
              ))}
            </section>
          ))}
        </div>
      </div>
    </PublicShell>
  );
}
