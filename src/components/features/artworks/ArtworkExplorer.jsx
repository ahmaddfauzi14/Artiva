'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import ChipRow from '@/components/ui/Chip';
import CircularGallery from '@/components/effects/CircularGallery';
import EmptyState from '@/components/ui/EmptyState';
import { useMotion } from '@/components/effects/MotionContext';
import SearchBar from '@/components/ui/SearchBar';
import { ArtworkGridSkeleton } from '@/components/ui/Skeleton';
import { apiFetch } from '@/lib/shared/api-client';
import { formatDateId } from '@/lib/shared/format';

export default function ArtworkExplorer({
  initialArtworks = [],
  categories = [],
  initialQuery = '',
  initialCategory = 'all',
}) {
  const router = useRouter();
  const { isMotionActive } = useMotion();
  const [artworks, setArtworks] = useState(initialArtworks);
  const [q, setQ] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory || 'all');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  const chipItems = [
    { label: 'Semua karya', value: 'all' },
    ...categories.map((cat) => ({ label: cat.name, value: cat.slug })),
  ];

  const visibleArtworks = useMemo(
    () => artworks.filter((item) => Boolean(item.image_url)),
    [artworks]
  );

  const galleryItems = useMemo(
    () =>
      visibleArtworks.map((art) => {
        const creator = art.creator?.display_name || 'Kreator ARTIVA';
        const catName = art.category?.name || 'Karya';
        const rawDesc = (art.description || '').trim();
        const shortDesc =
          rawDesc.length > 110 ? `${rawDesc.slice(0, 110).trimEnd()}…` : rawDesc;
        const summary = shortDesc
          ? `${shortDesc} · Oleh ${creator} (${catName})`
          : `Oleh ${creator} · ${catName} · ${art.like_count ?? 0} suka · ${art.comment_count ?? 0} komentar`;
        return {
          image: art.image_url,
          text: art.title,
          description: summary,
          alt: `${art.title} oleh ${creator}`,
        };
      }),
    [visibleArtworks]
  );

  const activeArtwork =
    visibleArtworks[activeIndex % Math.max(visibleArtworks.length, 1)] || null;

  const fetchArtworks = async ({
    nextQ = q,
    nextCat = category,
  }) => {
    setLoading(true);
    setErrorMsg('');

    const params = new URLSearchParams();
    if (nextQ.trim()) params.set('q', nextQ.trim());
    if (nextCat && nextCat !== 'all') params.set('category', nextCat);

    const urlQuery = params.toString();
    router.replace(urlQuery ? `/artworks?${urlQuery}` : '/artworks', {
      scroll: false,
    });

    try {
      params.set('all', '1');
      const res = await apiFetch(`/api/artworks?${params.toString()}`);
      setArtworks(res.data.artworks || []);
      setActiveIndex(0);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <SearchBar
        value={q}
        onChange={setQ}
        onSubmit={(val) => {
          setQ(val);
          fetchArtworks({ nextQ: val, nextCat: category });
        }}
      />

      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-brand-700">
          BUKA RUANG UNTUK SETIAP KARYA
        </p>
        <ChipRow
          items={chipItems}
          activeValue={category}
          onSelect={(slug) => {
            setCategory(slug);
            fetchArtworks({ nextQ: q, nextCat: slug });
          }}
        />
      </div>

      {errorMsg ? (
        <Alert tone="danger" title="Gagal memuat karya">
          {errorMsg}
        </Alert>
      ) : null}

      {loading ? (
        <ArtworkGridSkeleton count={8} />
      ) : visibleArtworks.length === 0 ? (
        <EmptyState
          title="Belum ada karya yang sesuai"
          description="Coba ubah kata kunci pencarian atau pilih kategori lain untuk menemukan inspirasi."
          actionLabel="Tampilkan semua karya"
          onAction={() => {
            setQ('');
            setCategory('all');
            fetchArtworks({ nextQ: '', nextCat: 'all' });
          }}
        />
      ) : (
        <div className="space-y-5">
          {/* Galeri Lengkung 3D WebGL */}
          <div className="edge-glow relative overflow-hidden rounded-[28px] border border-line bg-brand-900/65 shadow-glass">
            <div className="h-[380px] w-full sm:h-[440px] lg:h-[480px]">
              <CircularGallery
                items={galleryItems}
                bend={3}
                itemSize={1.12}
                textColor="#F7F3E6"
                borderRadius={0.05}
                font="600 28px Poppins, sans-serif"
                scrollEase={isMotionActive ? 0.05 : 1}
                wave={isMotionActive ? 1 : 0}
                openOnClick
                intro={isMotionActive}
                onActiveChange={(index) => setActiveIndex(index)}
                onItemClick={(_item, index) => setActiveIndex(index)}
                aria-label="Galeri lengkung interaktif karya komunitas ARTIVA"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line/70 px-5 py-3 text-xs text-ink-soft">
              <span>
                Seret, gulir, atau gunakan tombol panah untuk menjelajah · Klik karya untuk membuka tampilan penuh
              </span>
              <span className="tabular-nums font-semibold text-brand-700">
                {String((activeIndex % visibleArtworks.length) + 1).padStart(2, '0')} /{' '}
                {String(visibleArtworks.length).padStart(2, '0')}
              </span>
            </div>
          </div>

          {/* Detail Karya Aktif / Terpilih */}
          {activeArtwork ? (
            <article className="spotlight-surface flex flex-col justify-between gap-6 rounded-[28px] border border-line bg-surface p-6 shadow-card sm:p-8 lg:flex-row lg:items-center">
              <div className="min-w-0 flex-1 space-y-3">
                <div className="flex flex-wrap items-center gap-2.5 text-xs font-semibold">
                  <span className="rounded-full bg-brand-50 px-3 py-1 text-brand-700">
                    {activeArtwork.category?.name || 'Karya'}
                  </span>
                  <span className="text-ink-mute">
                    {formatDateId(activeArtwork.created_at)}
                  </span>
                  <span className="tabular-nums text-ink-soft">
                    · {activeArtwork.like_count ?? 0} suka ·{' '}
                    {activeArtwork.comment_count ?? 0} komentar
                  </span>
                </div>

                <div className="space-y-1">
                  <h2 className="text-2xl font-semibold text-ink sm:text-[28px]">
                    {activeArtwork.title}
                  </h2>
                  <p className="text-sm text-ink-soft">
                    Oleh{' '}
                    <Link
                      href={`/creators/${activeArtwork.creator?.username}`}
                      className="font-semibold text-brand-700 hover:underline"
                    >
                      {activeArtwork.creator?.display_name || 'Kreator ARTIVA'}
                    </Link>
                  </p>
                </div>

                <p className="max-w-3xl text-base leading-relaxed text-ink-soft">
                  {activeArtwork.description ||
                    'Belum ada deskripsi cerita untuk karya ini.'}
                </p>
              </div>

              <div className="flex shrink-0 flex-wrap items-center gap-3">
                {activeArtwork.creator?.username ? (
                  <Button
                    variant="secondary"
                    href={`/creators/${activeArtwork.creator.username}`}
                  >
                    Kontak kreator →
                  </Button>
                ) : null}
                <Button
                  variant="primary"
                  href={`/artworks/${activeArtwork.artwork_id}`}
                >
                  Lihat detail &amp; apresiasi →
                </Button>
              </div>
            </article>
          ) : null}
        </div>
      )}
    </div>
  );
}
