import { ArtworkGridSkeleton } from '@/components/ui/Skeleton';

export default function MemberSectionLoading() {
  return (
    <div className="space-y-8" aria-busy="true" aria-label="Memuat halaman member">
      <div className="space-y-3">
        <div className="skeleton-shimmer h-4 w-32 rounded-full" />
        <div className="skeleton-shimmer h-9 w-64 rounded-full" />
        <div className="skeleton-shimmer h-5 w-full max-w-xl rounded-full" />
      </div>
      <ArtworkGridSkeleton count={4} />
    </div>
  );
}
