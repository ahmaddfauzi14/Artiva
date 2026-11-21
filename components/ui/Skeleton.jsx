export function ArtworkCardSkeleton() {
  return (
    <div className="rounded-[28px] bg-surface p-3 shadow-card-sm">
      <div className="skeleton-shimmer aspect-[4/5] w-full rounded-[14px]" />
      <div className="mt-3 space-y-2 px-1 pb-1">
        <div className="skeleton-shimmer h-5 w-3/4 rounded-full" />
        <div className="skeleton-shimmer h-4 w-1/2 rounded-full" />
      </div>
    </div>
  );
}

export function ArtworkGridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, idx) => (
        <ArtworkCardSkeleton key={idx} />
      ))}
    </div>
  );
}

export function ChallengeCardSkeleton() {
  return (
    <div className="rounded-[28px] bg-surface p-6 shadow-card-sm">
      <div className="flex flex-col gap-4 md:flex-row">
        <div className="skeleton-shimmer h-44 w-full rounded-[18px] md:w-1/3" />
        <div className="flex-1 space-y-3 py-2">
          <div className="skeleton-shimmer h-6 w-28 rounded-full" />
          <div className="skeleton-shimmer h-8 w-2/3 rounded-full" />
          <div className="skeleton-shimmer h-4 w-full rounded-full" />
          <div className="skeleton-shimmer h-10 w-44 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }) {
  return (
    <div className="space-y-3 rounded-[28px] bg-surface p-5 shadow-card-sm">
      <div className="skeleton-shimmer h-10 w-full rounded-[14px]" />
      {Array.from({ length: rows }).map((_, idx) => (
        <div key={idx} className="skeleton-shimmer h-14 w-full rounded-[14px]" />
      ))}
    </div>
  );
}
