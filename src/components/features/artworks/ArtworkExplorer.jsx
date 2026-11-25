'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useRef, useState } from 'react';
import Alert from '@/components/ui/Alert';
import ArtworkShowcaseGallery from '@/components/features/artworks/ArtworkShowcaseGallery';
import ChipRow from '@/components/ui/Chip';
import EmptyState from '@/components/ui/EmptyState';
import SearchBar from '@/components/ui/SearchBar';
import Select from '@/components/ui/Select';
import { ArtworkGridSkeleton } from '@/components/ui/Skeleton';
import { apiFetch } from '@/lib/shared/api-client';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Terbaru' },
  { value: 'popular', label: 'Populer (Suka terbanyak)' },
];

export default function ArtworkExplorer({
  initialArtworks = [],
  categories = [],
  initialQuery = '',
  initialCategory = 'all',
  initialSort = 'newest',
}) {
  const router = useRouter();
  const [artworks, setArtworks] = useState(initialArtworks);
  const [q, setQ] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory || 'all');
  const [sort, setSort] = useState(
    initialSort === 'popular' ? 'popular' : 'newest'
  );
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const requestIdRef = useRef(0);

  const chipItems = [
    { label: 'Semua karya', value: 'all' },
    ...categories.map((cat) => ({ label: cat.name, value: cat.slug })),
  ];

  const visibleArtworks = useMemo(
    () => artworks.filter((item) => Boolean(item.image_url)),
    [artworks]
  );

  const fetchArtworks = async ({
    nextQ = q,
    nextCat = category,
    nextSort = sort,
  }) => {
    const reqId = ++requestIdRef.current;
    setLoading(true);
    setErrorMsg('');

    const params = new URLSearchParams();
    if (nextQ.trim()) params.set('q', nextQ.trim());
    if (nextCat && nextCat !== 'all') params.set('category', nextCat);
    if (nextSort === 'popular') params.set('sort', 'popular');

    const urlQuery = params.toString();
    router.replace(urlQuery ? `/artworks?${urlQuery}` : '/artworks', {
      scroll: false,
    });

    try {
      params.set('all', '1');
      const res = await apiFetch(`/api/artworks?${params.toString()}`);
      if (reqId !== requestIdRef.current) return;

      const nextArtworks = res.data.artworks || [];
      setArtworks(nextArtworks);
      const count = nextArtworks.filter((item) => Boolean(item.image_url)).length;
      const sortLabel =
        nextSort === 'popular' ? 'paling populer' : 'terbaru';
      setStatusMessage(
        `Menampilkan ${count} karya diurutkan berdasarkan ${sortLabel}.`
      );
    } catch (err) {
      if (reqId !== requestIdRef.current) return;
      setErrorMsg(err.message);
    } finally {
      if (reqId === requestIdRef.current) {
        setLoading(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <SearchBar
            value={q}
            onChange={setQ}
            onSubmit={(val) => {
              setQ(val);
              fetchArtworks({ nextQ: val, nextCat: category, nextSort: sort });
            }}
            className="md:flex-1 md:max-w-2xl"
          />

          <div className="flex items-center gap-2.5 self-start md:self-auto">
            <span
              id="artwork-sort-label"
              className="shrink-0 text-xs font-semibold uppercase tracking-[0.06em] text-ink-soft"
            >
              Urutkan
            </span>
            <div className="min-w-[205px]">
              <Select
                size="sm"
                align="end"
                ariaLabelledBy="artwork-sort-label"
                value={sort}
                options={SORT_OPTIONS}
                onValueChange={(nextSort) => {
                  if (!nextSort || nextSort === sort) return;
                  setSort(nextSort);
                  fetchArtworks({ nextQ: q, nextCat: category, nextSort });
                }}
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-brand-700">
            BUKA RUANG UNTUK SETIAP KARYA
          </p>
          <ChipRow
            items={chipItems}
            activeValue={category}
            onSelect={(slug) => {
              setCategory(slug);
              fetchArtworks({ nextQ: q, nextCat: slug, nextSort: sort });
            }}
          />
        </div>
      </div>

      <p role="status" className="sr-only">
        {statusMessage}
      </p>

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
            setSort('newest');
            fetchArtworks({ nextQ: '', nextCat: 'all', nextSort: 'newest' });
          }}
        />
      ) : (
        <ArtworkShowcaseGallery
          artworks={visibleArtworks}
          showCreatorInfo
          ariaLabel="Galeri lengkung interaktif karya komunitas ARTIVA"
        />
      )}
    </div>
  );
}
