import Button from '@/components/ui/Button';
import Footer from '@/components/layout/Footer';
import Navbar from '@/components/layout/Navbar';
import PageHeader from '@/components/layout/PageHeader';
import { getPublicViewer } from '@/lib/auth/page-guards';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Kontak & Dukungan · ARTIVA',
  description:
    'Saluran resmi untuk pelaporan bug, diskusi pengembangan melalui GitHub, moderasi karya, dan verifikasi Kurator ARTIVA.',
};

const GITHUB_REPO_URL = 'https://github.com/ahmaddfauzi14/Artiva';

export default async function ContactPage() {
  const user = await getPublicViewer();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={user} />

      <main className="mx-auto w-full max-w-5xl flex-1 space-y-10 px-5 py-10 md:px-8 lg:py-12">
        <PageHeader
          eyebrow="DUKUNGAN PLATFORM"
          title="Kontak & Dukungan"
          subtitle="Temukan saluran resmi untuk melaporkan kendala teknis, menyampaikan masukan pengembangan, atau menggunakan fitur moderasi di dalam ARTIVA."
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <section className="flex flex-col justify-between gap-6 rounded-[28px] border border-line bg-surface p-6 shadow-card">
            <div className="space-y-2.5">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-brand-700">
                KODE SUMBER &amp; MASUKAN
              </p>
              <h2 className="text-xl font-semibold text-ink">
                Repositori GitHub ARTIVA
              </h2>
              <p className="text-sm leading-relaxed text-ink-soft">
                Laporkan bug, usulkan peningkatan fitur, atau pelajari arsitektur proyek ARTIVA langsung di repositori resmi GitHub.
              </p>
            </div>
            <div>
              <a
                href={GITHUB_REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-grad-primary px-5 py-2.5 text-sm font-semibold text-white shadow-btn transition-all duration-150 hover:-translate-y-0.5 hover:brightness-110"
              >
                Buka GitHub ARTIVA
              </a>
            </div>
          </section>

          <section className="flex flex-col justify-between gap-6 rounded-[28px] border border-line bg-surface p-6 shadow-card">
            <div className="space-y-2.5">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-brand-700">
                MODERASI KONTEN
              </p>
              <h2 className="text-xl font-semibold text-ink">
                Laporkan Karya Bermasalah
              </h2>
              <p className="text-sm leading-relaxed text-ink-soft">
                Untuk karya yang diduga melanggar hak cipta atau ketentuan komunitas, gunakan tombol lapor pada halaman detail karya agar langsung masuk ke antrean peninjauan Admin.
              </p>
            </div>
            <div>
              <Button variant="secondary" href="/artworks">
                Buka Galeri Karya
              </Button>
            </div>
          </section>

          <section className="flex flex-col justify-between gap-6 rounded-[28px] border border-line bg-surface p-6 shadow-card">
            <div className="space-y-2.5">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-brand-700">
                PENYELENGGARA TANTANGAN
              </p>
              <h2 className="text-xl font-semibold text-ink">
                Verifikasi Akun Kurator
              </h2>
              <p className="text-sm leading-relaxed text-ink-soft">
                Ingin menyelenggarakan tantangan kreatif terkurasi di ARTIVA? Ajukan pendaftaran Kurator untuk ditinjau dan diverifikasi oleh Admin.
              </p>
            </div>
            <div>
              <Button variant="secondary" href="/register/curator">
                Ajukan Sebagai Kurator
              </Button>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
