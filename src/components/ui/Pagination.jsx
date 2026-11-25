'use client';

export default function Pagination({ page, limit, total, onPageChange }) {
  const totalPages = Math.max(1, Math.ceil((total || 0) / (limit || 12)));
  if (totalPages <= 1) return null;

  const pages = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);
  for (let p = start; p <= end; p += 1) {
    pages.push(p);
  }

  return (
    <nav
      aria-label="Navigasi halaman"
      className="flex flex-wrap items-center justify-between gap-4 pt-4"
    >
      <p className="tabular-nums text-sm text-ink-mute">
        Halaman {page} dari {totalPages}
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="min-h-[44px] rounded-full border border-line bg-surface px-4 text-sm font-semibold text-ink shadow-card-sm transition-colors hover:border-brand-200 hover:bg-brand-50 disabled:pointer-events-none disabled:opacity-45"
        >
          Sebelumnya
        </button>

        {start > 1 ? (
          <>
            <button
              type="button"
              onClick={() => onPageChange(1)}
              className="tabular-nums min-h-[44px] min-w-[44px] rounded-full border border-line bg-surface px-3 text-sm font-semibold text-ink hover:bg-brand-50"
            >
              1
            </button>
            {start > 2 ? (
              <span className="px-1 text-sm text-ink-mute" aria-hidden="true">
                …
              </span>
            ) : null}
          </>
        ) : null}

        {pages.map((p) => {
          const isActive = p === page;
          return (
            <button
              key={p}
              type="button"
              aria-current={isActive ? 'page' : undefined}
              onClick={() => onPageChange(p)}
              className={`tabular-nums min-h-[44px] min-w-[44px] rounded-full px-3 text-sm font-semibold transition-colors ${
                isActive
                  ? 'bg-brand-600 text-white shadow-btn'
                  : 'border border-line bg-surface text-ink hover:bg-brand-50'
              }`}
            >
              {p}
            </button>
          );
        })}

        {end < totalPages ? (
          <>
            {end < totalPages - 1 ? (
              <span className="px-1 text-sm text-ink-mute" aria-hidden="true">
                …
              </span>
            ) : null}
            <button
              type="button"
              onClick={() => onPageChange(totalPages)}
              className="tabular-nums min-h-[44px] min-w-[44px] rounded-full border border-line bg-surface px-3 text-sm font-semibold text-ink hover:bg-brand-50"
            >
              {totalPages}
            </button>
          </>
        ) : null}

        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="min-h-[44px] rounded-full border border-line bg-surface px-4 text-sm font-semibold text-ink shadow-card-sm transition-colors hover:border-brand-200 hover:bg-brand-50 disabled:pointer-events-none disabled:opacity-45"
        >
          Berikutnya
        </button>
      </div>
    </nav>
  );
}
