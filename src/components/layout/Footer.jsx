import Link from 'next/link';
import ArtivaLogo from '@/components/layout/ArtivaLogo';

const GITHUB_REPO_URL = 'https://github.com/ahmaddfauzi14/Artiva';

const QUICK_LINKS = [
  { label: 'Beranda', href: '/' },
  { label: 'Jelajahi Karya', href: '/artworks' },
  { label: 'Tantangan', href: '/challenges' },
  { label: 'Daftar Member', href: '/register/member' },
  { label: 'Ajukan Kurator', href: '/register/curator' },
  { label: 'Masuk', href: '/login' },
];

const ABOUT_LINKS = [
  { label: 'Tentang ARTIVA', href: '/about' },
  { label: 'Peran Pengguna', href: '/about#peran' },
  { label: 'Alur Berkarya', href: '/about#alur' },
  { label: 'Kontak & Dukungan', href: '/contact' },
];

const LEGAL_LINKS = [
  { label: 'Ketentuan Penggunaan', href: '/terms' },
  { label: 'Kebijakan Privasi', href: '/privacy' },
];

function FooterLinkGroup({ id, title, links }) {
  return (
    <nav aria-labelledby={id} className="min-w-0">
      <h3
        id={id}
        className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-mute"
      >
        {title}
      </h3>
      <ul className="mt-2 flex flex-col gap-0.5">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="inline-flex min-h-[36px] items-center text-sm font-medium text-ink transition-colors hover:text-brand-700 hover:underline underline-offset-4 sm:min-h-[30px]"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-line bg-brand-900">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-12 md:items-start">
          <div className="min-w-0 md:col-span-6 lg:col-span-7">
            <Link href="/" className="inline-flex items-center">
              <ArtivaLogo size="md" />
            </Link>
            <h2 className="mt-3 text-lg font-semibold tracking-[-0.01em] text-ink">
              Ekosistem Kreatif ARTIVA
            </h2>
            <p className="mt-1 max-w-lg text-sm leading-relaxed text-ink-soft">
              Ruang bertemu karya, ide, dan apresiasi yang menyatukan portofolio digital, interaksi komunitas, dan tantangan kreatif terkurasi.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6 md:col-span-6 lg:col-span-5">
            <FooterLinkGroup
              id="footer-quick-links"
              title="Tautan Cepat"
              links={QUICK_LINKS}
            />
            <FooterLinkGroup
              id="footer-about-links"
              title="Tentang"
              links={ABOUT_LINKS}
            />
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3 border-t border-line/80 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-ink-mute">
              <span>© 2026 ARTIVA. Seluruh hak cipta dilindungi.</span>
              <span aria-hidden="true" className="hidden select-none text-line sm:inline">
                •
              </span>
              <nav aria-label="Legal">
                <ul className="flex flex-wrap items-center gap-x-2.5 gap-y-1 font-medium text-ink">
                  {LEGAL_LINKS.map((link, index) => (
                    <li key={link.href} className="inline-flex items-center gap-2.5">
                      {index > 0 ? (
                        <span aria-hidden="true" className="select-none text-line">
                          |
                        </span>
                      ) : null}
                      <Link
                        href={link.href}
                        className="inline-flex min-h-[32px] items-center transition-colors hover:text-brand-700 hover:underline underline-offset-4 sm:min-h-0"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
            <p className="text-xs leading-relaxed text-ink-mute">
              Seluruh karya tetap menjadi hak cipta masing-masing kreator. Informasi pelaporan dan moderasi tersedia pada halaman{' '}
              <Link
                href="/terms"
                className="text-ink-soft underline decoration-line underline-offset-4 transition-colors hover:text-brand-700 hover:decoration-brand-700"
              >
                Ketentuan Penggunaan
              </Link>
              .
            </p>
          </div>

          <a
            href={GITHUB_REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Repositori GitHub ARTIVA (buka di tab baru)"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center self-start rounded-xl border border-line/80 bg-surface/70 text-ink transition-colors hover:border-brand-700/70 hover:bg-brand-50 hover:text-brand-700 sm:self-auto"
          >
            <svg
              className="h-[18px] w-[18px]"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z" />
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
}
