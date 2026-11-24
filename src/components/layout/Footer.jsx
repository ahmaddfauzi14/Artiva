import Link from 'next/link';
import ArtivaLogo from '@/components/layout/ArtivaLogo';

const GITHUB_REPO_URL = 'https://github.com/ahmaddfauzi14/Artiva';

const CAPABILITIES = [
  {
    title: 'Showcase Portofolio',
    description:
      'Pamerkan karya seni digital dengan filter kategori, pencarian kata kunci, tag, dan inspektur tampilan penuh.',
  },
  {
    title: 'Apresiasi Komunitas',
    description:
      'Terhubung dengan sesama kreator lewat fitur suka, simpan favorit, dan komentar langsung pada setiap karya.',
  },
  {
    title: 'Tantangan Terkurasi',
    description:
      'Ikuti kompetisi kreatif menggunakan karya portofolio yang sudah terbit tanpa perlu mengunggah ulang file.',
  },
  {
    title: 'Kurasi Transparan',
    description:
      'Penyelenggara terverifikasi meninjau karya peserta dan menetapkan 1 sampai 3 pemenang resmi.',
  },
];

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

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-line bg-brand-900">
      <div className="mx-auto max-w-6xl px-5 pb-10 pt-14 md:px-8 lg:pt-16">
        {/* Zona Atas: Ringkasan Ekosistem + 2 Kolom Navigasi */}
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-[minmax(0,2.35fr)_minmax(0,1fr)_minmax(0,1fr)] lg:gap-x-12">
          <div className="min-w-0 sm:col-span-2 lg:col-span-1">
            <h2 className="text-xl font-semibold tracking-[-0.01em] text-ink">
              Ekosistem Kreatif ARTIVA
            </h2>
            <p className="mt-2.5 max-w-xl text-sm leading-relaxed text-ink-soft">
              Ruang bertemu karya, ide, dan apresiasi yang menyatukan portofolio digital, interaksi komunitas, dan tantangan kreatif terkurasi dalam satu platform.
            </p>

            <ul
              role="list"
              className="mt-8 grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2"
            >
              {CAPABILITIES.map((item) => (
                <li key={item.title} className="min-w-0">
                  <h3 className="text-[15px] font-semibold text-ink">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-mute">
                    {item.description}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          <nav aria-labelledby="footer-quick-links" className="min-w-0">
            <h3
              id="footer-quick-links"
              className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-mute"
            >
              Tautan Cepat
            </h3>
            <ul className="mt-3 space-y-0.5">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-flex min-h-[44px] items-center text-[15px] font-medium text-ink transition-colors hover:text-brand-700 hover:underline underline-offset-4"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-labelledby="footer-about-links" className="min-w-0">
            <h3
              id="footer-about-links"
              className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-mute"
            >
              Tentang
            </h3>
            <ul className="mt-3 space-y-0.5">
              {ABOUT_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-flex min-h-[44px] items-center text-[15px] font-medium text-ink transition-colors hover:text-brand-700 hover:underline underline-offset-4"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Zona Bawah: Brand, Tautan Legal, Hak Cipta, & GitHub */}
        <div className="mt-14 flex flex-col gap-6 border-t border-line/80 pt-8 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-7">
            <Link
              href="/"
              className="inline-flex min-h-[44px] shrink-0 items-center self-start sm:self-auto"
            >
              <ArtivaLogo size="sm" />
            </Link>

            <div className="min-w-0 space-y-1">
              <nav aria-label="Legal">
                <ul className="wrap-balance flex items-center gap-x-2.5 gap-y-1 text-xs font-medium text-ink">
                  {LEGAL_LINKS.map((link, index) => (
                    <li key={link.href} className="inline-flex items-center gap-2.5">
                      {index > 0 ? (
                        <span
                          aria-hidden="true"
                          className="select-none text-line"
                        >
                          |
                        </span>
                      ) : null}
                      <Link
                        href={link.href}
                        className="inline-flex min-h-[44px] items-center transition-colors hover:text-brand-700 hover:underline underline-offset-4 sm:-my-2"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
              <p className="text-xs leading-relaxed text-ink-mute">
                © 2026 ARTIVA. Seluruh hak cipta dilindungi.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <a
              href={GITHUB_REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Repositori GitHub ARTIVA (buka di tab baru)"
              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-line/80 bg-surface/70 text-ink transition-colors hover:border-brand-700/70 hover:bg-brand-50 hover:text-brand-700"
            >
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Catatan Mikro Kepemilikan Karya */}
        <div className="mt-6 border-t border-line/50 pt-5">
          <p className="max-w-3xl text-xs leading-relaxed text-ink-mute">
            Seluruh karya yang dipublikasikan tetap menjadi hak cipta masing-masing kreator. Informasi pelaporan konten dan moderasi tersedia pada halaman{' '}
            <Link
              href="/terms"
              className="text-ink-soft underline decoration-line underline-offset-4 transition-colors hover:text-brand-700 hover:decoration-brand-700"
            >
              Ketentuan Penggunaan
            </Link>
            .
          </p>
        </div>
      </div>
    </footer>
  );
}
