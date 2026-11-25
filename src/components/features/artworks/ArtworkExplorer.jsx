'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import Alert from '@/components/ui/Alert';
import ArtworkShowcaseGallery from '@/components/features/artworks/ArtworkShowcaseGallery';
import ChipRow from '@/components/ui/Chip';
import EmptyState from '@/components/ui/EmptyState';
import SearchBar from '@/components/ui/SearchBar';
import { ArtworkGridSkeleton } from '@/components/ui/Skeleton';
import { apiFetch } from '@/lib/shared/api-client';

export default function ArtworkExplorer({
  initialArtworks = [],
  categories = [],
  initialQuery = '',
  initialCategory = 'all',
}) {
  const router = useRouter();
  const [artworks, setArtworks] = useState(initialArtworks);
  const [q, setQ] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory || 'all');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const chipItems = [
    { label: 'Semua karya', value: 'all' },
    ...categories.map((cat) => ({ label: cat.name, value: cat.slug })),
  ];

  const visibleArtworks = useMemo(
    () => artworks.filter((item) => Boolean(item.image_url)),
    [artworks]
  );

  const fetchArtworks = async ({ nextQ = q, nextCat = category }) => {
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
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <SearchBar
          value={q}
          onChange={setQ}
          onSubmit={(val) => {
            setQ(val);
            fetchArtworks({ nextQ: val, nextCat: category });
          }}
        />

        <div className="space-y-2">
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
        <ArtworkShowcaseGallery
          artworks={visibleArtworks}
          showCreatorInfo
          ariaLabel="Galeri lengkung interaktif karya komunitas ARTIVA"
        />
      )}
    </div>
  );
}
