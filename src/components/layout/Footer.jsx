import Link from 'next/link';
import { HugeiconsIcon } from '@hugeicons/react';
import { GithubIcon } from '@hugeicons/core-free-icons';
import ArtivaLogo from '@/components/layout/ArtivaLogo';

const GITHUB_REPO_URL = 'https://github.com/ahmaddfauzi14/Artiva';

const PUBLIC_QUICK_LINKS = [
  { label: 'Beranda', href: '/' },
  { label: 'Jelajahi Karya', href: '/artworks' },
  { label: 'Tantangan', href: '/challenges' },
];

const GUEST_QUICK_LINKS = [
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

export default function Footer({ user = null }) {
  const quickLinks = user
    ? PUBLIC_QUICK_LINKS
    : [...PUBLIC_QUICK_LINKS, ...GUEST_QUICK_LINKS];

  return (
    <footer className="mt-auto border-t border-line bg-brand-900">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:gap-10 lg:gap-12">
          <div className="min-w-0">
            <Link href="/" className="inline-flex items-center">
              <ArtivaLogo size="md" />
            </Link>
            <h2 className="mt-3 text-lg font-semibold tracking-[-0.01em] text-ink">
              Ekosistem Kreatif ARTIVA
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-ink-soft">
              Ruang bertemu karya, ide, dan apresiasi yang menyatukan portofolio digital, interaksi komunitas, dan tantangan kreatif terkurasi.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6 md:grid-cols-[auto_auto] md:gap-8 lg:gap-10">
            <FooterLinkGroup
              id="footer-quick-links"
              title="Tautan Cepat"
              links={quickLinks}
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
            <HugeiconsIcon
              icon={GithubIcon}
              size={18}
              strokeWidth={1.8}
              aria-hidden="true"
            />
          </a>
        </div>
      </div>
    </footer>
  );
}
