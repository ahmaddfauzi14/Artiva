'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArtworkShowcaseFrame,
  ArtworkSpotlightCard,
} from '@/components/features/artworks/ArtworkShowcaseGallery';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import Pagination from '@/components/ui/Pagination';
import ProfileCard from '@/components/effects/ProfileCard';
import TiltedCard from '@/components/effects/TiltedCard';
import { useToast } from '@/components/ui/Toast';
import { formatDateId } from '@/lib/shared/format';

function CreatorBackFace({
  creator,
  roleLabel,
  totalArtworks,
  safeWebsite,
  onFlipBack,
  onCopyLink,
}) {
  return (
    <div className="flex h-full w-full flex-col justify-between p-5 text-ink">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-[#F2C94C]">
              BIODATA &amp; KONTAK
            </p>
            <h2 className="mt-0.5 truncate text-lg font-semibold text-ink">
              {creator.display_name}
            </h2>
            <p className="truncate text-xs text-ink-soft">@{creator.username}</p>
          </div>
          <button
            type="button"
            onClick={onFlipBack}
            className="shrink-0 rounded-full border border-line bg-surface/80 px-3 py-1.5 text-xs font-semibold text-ink-soft transition-colors hover:border-[#F2C94C]/60 hover:text-ink"
          >
            ↺ Profil
          </button>
        </div>

        <div className="rounded-[16px] border border-line/80 bg-[#091326]/60 p-3.5">
          <p className="max-h-[100px] overflow-y-auto text-sm leading-relaxed text-ink-soft">
            {creator.bio || 'Kreator ini belum menambahkan biodata singkat.'}
          </p>
        </div>

        <dl className="space-y-2 border-t border-line pt-3 text-xs text-ink-soft">
          <div className="flex items-center justify-between gap-3">
            <dt className="text-ink-mute">Peran</dt>
            <dd className="font-semibold text-ink">{roleLabel}</dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-ink-mute">Karya</dt>
            <dd className="tabular-nums font-semibold text-ink">
              {totalArtworks} dipublikasikan
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-ink-mute">Bergabung</dt>
            <dd className="font-medium text-ink">
              {formatDateId(creator.created_at)}
            </dd>
          </div>
        </dl>
      </div>

      <div className="space-y-2 pt-3">
        {safeWebsite ? (
          <Button
            variant="primary"
            size="sm"
            href={safeWebsite}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full justify-center"
          >
            Kunjungi portofolio eksternal ↗
          </Button>
        ) : null}
        <Button
          variant="secondary"
          size="sm"
          onClick={onCopyLink}
          className="w-full justify-center"
        >
          Salin tautan profil @{creator.username}
        </Button>
      </div>
    </div>
  );
}

export default function CreatorProfile({ creator, artworks = [], meta }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [flipped, setFlipped] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const safeWebsite =
    creator.website && /^https?:\/\//i.test(creator.website)
      ? creator.website
      : null;

  const roleLabel =
    creator.role === 'curator' ? 'Kurator Terverifikasi' : 'Kreator ARTIVA';

  const activeArtwork =
    artworks.length > 0 ? artworks[activeIndex % artworks.length] : null;

  const handleCopyProfileLink = async () => {
    try {
      const url =
        typeof window !== 'undefined'
          ? `${window.location.origin}/creators/${creator.username}`
          : `/creators/${creator.username}`;
      await navigator.clipboard.writeText(url);
      showToast({
        title: 'Tautan profil disalin',
        message: `Profil @${creator.username} siap dibagikan.`,
        tone: 'success',
      });
    } catch {
      showToast({
        title: 'Tidak dapat menyalin otomatis',
        message: `Bagikan alamat /creators/${creator.username} secara manual.`,
        tone: 'warning',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-line pb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-brand-700">
            PORTOFOLIO KARYA
          </p>
          <h1 className="mt-1 text-[1.5rem] font-semibold leading-tight text-ink sm:text-[1.875rem]">
            Karya oleh {creator.display_name}
          </h1>
        </div>
        <span className="tabular-nums rounded-full border border-line bg-surface px-3.5 py-1.5 text-xs font-semibold text-ink-soft">
          {meta.total} karya dipublikasikan
        </span>
      </div>

      <div className="flex flex-col items-center gap-6 lg:flex-row lg:items-stretch lg:gap-7">
        {/* Kartu Profil 3D Kreator */}
        <aside className="flex w-full shrink-0 justify-center lg:w-[350px]">
          <div className="h-[26.5rem] w-[20rem] max-w-full sm:h-[28.5rem] sm:w-[21.875rem]">
            <TiltedCard
              altText={`Kartu profil ${creator.display_name}`}
              captionText={
                flipped
                  ? 'Klik kartu untuk kembali ke profil'
                  : 'Klik kartu atau Kontak untuk biodata'
              }
              containerWidth="100%"
              containerHeight="100%"
              imageWidth="100%"
              imageHeight="100%"
              rotateAmplitude={10}
              scaleOnHover={1.03}
              radius={26}
              glare={0.45}
              glareColor="#F2C94C"
              shadow={0.55}
              showTooltip
              flipped={flipped}
              onFlip={setFlipped}
              backContent={
                <CreatorBackFace
                  creator={creator}
                  roleLabel={roleLabel}
                  totalArtworks={meta.total}
                  safeWebsite={safeWebsite}
                  onFlipBack={() => setFlipped(false)}
                  onCopyLink={handleCopyProfileLink}
                />
              }
            >
              <ProfileCard
                name={creator.display_name}
                title={roleLabel}
                handle={creator.username}
                status={`${meta.total} karya dipublikasikan`}
                statusColor="#F2C94C"
                contactText="Kontak"
                avatarUrl={creator.avatar_url || ''}
                miniAvatarUrl={creator.avatar_url || ''}
                holo={0.8}
                glare={0.4}
                enableTilt={false}
                intro={false}
                parallax={8}
                radius={16}
                showUserInfo
                theme="dark"
                onContactClick={() => setFlipped(true)}
              />
            </TiltedCard>
          </div>
        </aside>

        {/* Galeri Lengkung Karya Kreator */}
        <section className="flex min-w-0 w-full flex-1 flex-col">
          {artworks.length === 0 ? (
            <div className="flex h-[24rem] items-center justify-center rounded-[26px] border border-line bg-surface/75 p-6 sm:h-[28.5rem]">
              <EmptyState
                title="Belum ada karya dipublikasikan"
                description="Kreator ini belum menampilkan karya publik di galeri ARTIVA."
              />
            </div>
          ) : (
            <div className="h-[24rem] w-full sm:h-[28.5rem]">
              <ArtworkShowcaseFrame
                artworks={artworks}
                fallbackCreatorName={creator.display_name}
                activeIndex={activeIndex}
                onActiveChange={setActiveIndex}
                ariaLabel={`Galeri lengkung karya ${creator.display_name}`}
                heightClass="flex-1"
                fillHeight
              />
            </div>
          )}
        </section>
      </div>

      <ArtworkSpotlightCard
        artwork={activeArtwork}
        fallbackCreatorName={creator.display_name}
        showCreatorInfo={false}
      />

      <Pagination
        page={meta.page}
        limit={meta.limit}
        total={meta.total}
        onPageChange={(nextPage) =>
          router.push(`/creators/${creator.username}?page=${nextPage}`)
        }
      />
    </div>
  );
}
