import Button from '@/components/ui/Button';
import ChallengeExplorer from '@/components/features/challenges/ChallengeExplorer';
import Footer from '@/components/layout/Footer';
import Navbar from '@/components/layout/Navbar';
import StepCard from '@/components/cards/StepCard';
import WinnerPodium from '@/components/cards/WinnerPodium';
import { getPublicViewer } from '@/lib/auth/page-guards';
import {
  listLatestAnnouncedWinners,
  listPublicChallenges,
} from '@/lib/repositories/challenges';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Tantangan Kreatif · ARTIVA',
};

export default async function ChallengesPage({ searchParams }) {
  const user = await getPublicViewer();

  const sp = await searchParams;
  const status = sp?.status || '';
  const q = sp?.q || '';
  const page = Math.max(1, Number(sp?.page || '1') || 1);

  const [result, openChallengesData, latestWinnersData] = await Promise.all([
    listPublicChallenges({ status, q, page, limit: 12 }),
    listPublicChallenges({ status: 'open', limit: 1 }),
    listLatestAnnouncedWinners(),
  ]);

  const totalChallenges = result.meta?.total ?? result.items.length;
  const openCount = openChallengesData.meta?.total ?? 0;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={user} />

      <main className="mx-auto w-full max-w-[90rem] flex-1 space-y-12 px-4 py-10 sm:px-6 md:space-y-14 md:px-8">
        {/* Hero Seimbang */}
        <section className="edge-glow grid grid-cols-1 items-center gap-6 rounded-[28px] bg-grad-hero p-6 shadow-glass sm:p-8 lg:grid-cols-12 lg:p-10">
          <div className="space-y-3 lg:col-span-8">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-brand-700">
              TANTANGAN TERKURASI
            </p>
            <h1 className="text-[2rem] font-semibold leading-tight text-ink sm:text-[2.5rem]">
              Tunjukkan karyamu dalam tantangan komunitas.
            </h1>
            <p className="max-w-2xl text-base text-ink-soft">
              Kirimkan karya terbaik dari portofoliomu ke tantangan yang dikelola Kurator terverifikasi tanpa perlu mengunggah file berulang kali.
            </p>
          </div>

          <div className="flex flex-col justify-between gap-4 rounded-[20px] border border-line bg-surface/80 p-5 shadow-card-sm lg:col-span-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-[14px] border border-line/70 bg-canvas/70 px-3 py-2.5">
                <p className="tabular-nums text-2xl font-semibold text-brand-700">
                  {openCount}
                </p>
                <p className="text-xs text-ink-soft">Sedang terbuka</p>
              </div>
              <div className="rounded-[14px] border border-line/70 bg-canvas/70 px-3 py-2.5">
                <p className="tabular-nums text-2xl font-semibold text-ink">
                  {totalChallenges}
                </p>
                <p className="text-xs text-ink-soft">Total tantangan</p>
              </div>
            </div>

            <Button
              variant="primary"
              href={
                user?.role === 'curator'
                  ? user.status === 'active'
                    ? '/curator/challenges/new'
                    : '/curator/verification'
                  : user?.role === 'member'
                    ? '/me/artworks'
                    : '/register/member'
              }
              className="w-full"
            >
              {user?.role === 'curator'
                ? user.status === 'active'
                  ? 'Buat tantangan →'
                  : 'Status verifikasi →'
                : user?.role === 'member'
                  ? 'Siapkan karya saya →'
                  : 'Gabung sebagai Member →'}
            </Button>
          </div>
        </section>

        {/* Daftar Tantangan */}
        <ChallengeExplorer
          initialChallenges={result.items}
          initialMeta={result.meta}
          initialStatus={status}
          initialQuery={q}
        />

        {/* Langkah Ikut Tantangan (sejajar subgrid di desktop) */}
        <section className="space-y-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-brand-700">
              ALUR PARTISIPASI
            </p>
            <h2 className="mt-1 text-[1.5rem] font-semibold text-ink sm:text-[1.875rem]">
              Giliran idemu mengambil tempat.
            </h2>
          </div>

          <div className="subgrid-step-row gap-6 lg:pb-3">
            <StepCard
              index={0}
              stagger
              number="01"
              tint="lavender"
              title="Siapkan karya Published"
              description="Pastikan karya yang ingin diikutsertakan sudah diunggah dan berstatus Dipublikasikan."
            />
            <StepCard
              index={1}
              stagger
              number="02"
              tint="mint"
              title="Pilih tantangan terbuka"
              description="Periksa periode serta kecocokan kategori jika tantangan menetapkan kategori tertentu."
            />
            <StepCard
              index={2}
              stagger
              number="03"
              tint="peach"
              title="Kirim & pantau kurasi"
              description="Kirim karya dengan satu klik; kamu masih bisa menariknya selama tantangan masih terbuka."
            />
          </div>
        </section>

        {/* Sorotan Pemenang */}
        {latestWinnersData.winners.length > 0 ? (
          <section className="space-y-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-brand-700">
                APRESIASI UNTUK KREATIVITAS
              </p>
              <h2 className="mt-1 text-[1.5rem] font-semibold text-ink sm:text-[1.875rem]">
                Karya yang mencuri perhatian.
              </h2>
            </div>
            <WinnerPodium winners={latestWinnersData.winners} />
          </section>
        ) : null}

        {/* FAQ (3 kartu sejajar) */}
        <section className="space-y-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-brand-700">
              PERTANYAAN UMUM
            </p>
            <h2 className="mt-1 text-[1.5rem] font-semibold text-ink sm:text-[1.875rem]">
              Ruang mencoba, bukan ruang ragu.
            </h2>
          </div>
          <div className="auto-grid-wide gap-6">
            <div className="flex flex-col justify-between rounded-[28px] bg-tint-lavender p-6 shadow-tint-lavender">
              <h3 className="text-lg font-semibold text-ink">
                Siapa yang bisa ikut?
              </h3>
              <p className="mt-2 text-base text-ink-soft">
                Seluruh pengguna dengan peran Member aktif dapat mendaftarkan karyanya ke tantangan berstatus Terbuka.
              </p>
            </div>
            <div className="flex flex-col justify-between rounded-[28px] bg-tint-mint p-6 shadow-tint-mint">
              <h3 className="text-lg font-semibold text-ink">
                Karya seperti apa yang eligible?
              </h3>
              <p className="mt-2 text-base text-ink-soft">
                Karya harus milikmu sendiri, berstatus Dipublikasikan, dan berada pada kategori yang sesuai bila tantangan menentukan kategori.
              </p>
            </div>
            <div className="flex flex-col justify-between rounded-[28px] bg-tint-peach p-6 shadow-tint-peach">
              <h3 className="text-lg font-semibold text-ink">
                Kapan boleh didaftarkan atau ditarik?
              </h3>
              <p className="mt-2 text-base text-ink-soft">
                Pendaftaran maupun penarikan submission dapat dilakukan kapan saja selama tanggal tantangan masih berlangsung.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
