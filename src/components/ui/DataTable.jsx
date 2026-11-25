'use client';

import { useId, useRef } from 'react';
import EmptyState from '@/components/ui/EmptyState';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { formatNumberId } from '@/lib/shared/format';

export default function DataTable({
  title,
  tabs,
  activeTab,
  onTabChange,
  headerActions,
  columns = [],
  rows = [],
  rowKey,
  loading = false,
  emptyTitle = 'Belum ada data',
  emptyDescription = 'Data akan muncul di sini saat tersedia.',
  authorityNote,
  maxHeight = null,
  onRowSelect,
}) {
  const headingId = useId();
  const tabRefs = useRef([]);

  const hasHeader = Boolean(title || (tabs && tabs.length > 0) || headerActions);
  const hasTabs = Boolean(tabs && tabs.length > 0);

  const handleTabKeyDown = (index) => (event) => {
    if (!hasTabs || !onTabChange) return;
    let nextIndex = null;
    if (event.key === 'ArrowRight') {
      nextIndex = (index + 1) % tabs.length;
    } else if (event.key === 'ArrowLeft') {
      nextIndex = (index - 1 + tabs.length) % tabs.length;
    } else if (event.key === 'Home') {
      nextIndex = 0;
    } else if (event.key === 'End') {
      nextIndex = tabs.length - 1;
    }

    if (nextIndex !== null) {
      event.preventDefault();
      const nextTab = tabs[nextIndex];
      onTabChange(nextTab.value);
      tabRefs.current[nextIndex]?.focus();
    }
  };

  const renderBody = () => {
    if (loading) {
      return <TableSkeleton />;
    }

    if (!rows || rows.length === 0) {
      return <EmptyState title={emptyTitle} description={emptyDescription} />;
    }

    return (
      <div
        tabIndex={0}
        role="region"
        aria-labelledby={title ? headingId : undefined}
        aria-label={title ? undefined : 'Tabel data'}
        style={maxHeight ? { maxHeight: `${maxHeight}px` } : undefined}
        className="admin-table-wrap no-scrollbar focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700"
      >
        <table>
          {columns.length > 0 ? (
            <thead>
              <tr className="border-b border-line text-left text-xs font-semibold uppercase tracking-[0.06em] text-ink-mute">
                {columns.map((col, idx) => (
                  <th
                    key={col.key}
                    scope="col"
                    className={`pb-3 ${
                      idx < columns.length - 1 ? 'pr-4' : ''
                    } ${col.className || ''}`}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
          ) : null}

          <tbody className="divide-y divide-line/60 text-sm">
            {rows.map((row, rowIdx) => {
              const key = rowKey ? row[rowKey] : rowIdx;
              const interactive = typeof onRowSelect === 'function';
              return (
                <tr
                  key={key}
                  onClick={interactive ? () => onRowSelect(row, rowIdx) : undefined}
                  className={`transition-colors hover:bg-brand-50/35 ${
                    interactive ? 'cursor-pointer' : ''
                  }`}
                >
                  {columns.map((col, colIdx) => {
                    const content = col.render ? col.render(row) : row[col.key];
                    const padRight = colIdx < columns.length - 1 ? 'pr-4' : '';

                    if (colIdx === 0) {
                      return (
                        <th
                          key={col.key}
                          scope="row"
                          data-label={col.key === 'id' ? col.label : undefined}
                          className={`py-2.5 ${padRight} text-left font-semibold text-ink align-middle ${
                            col.cellClassName || ''
                          }`}
                        >
                          {content}
                        </th>
                      );
                    }

                    return (
                      <td
                        key={col.key}
                        data-label={col.label}
                        className={`py-2.5 ${padRight} text-ink-soft align-middle ${
                          col.cellClassName || ''
                        }`}
                      >
                        {content}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <section
      aria-labelledby={title ? headingId : undefined}
      className="overflow-hidden rounded-[22px] border border-line bg-surface/90 shadow-card-sm"
    >
      {hasHeader ? (
        <div className="flex flex-col gap-3 border-b border-line/80 px-4 py-3.5 sm:px-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {title ? (
              <h2 id={headingId} className="text-lg font-semibold text-ink">
                {title}
              </h2>
            ) : null}

            {hasTabs ? (
              <div
                role="tablist"
                aria-label={title ? `Filter ${title}` : 'Filter tabel'}
                className="no-scrollbar flex flex-nowrap items-center gap-4 overflow-x-auto"
              >
                {tabs.map((tab, index) => {
                  const selected = activeTab === tab.value;
                  return (
                    <button
                      key={String(tab.value)}
                      ref={(el) => {
                        tabRefs.current[index] = el;
                      }}
                      type="button"
                      role="tab"
                      aria-selected={selected}
                      tabIndex={selected ? 0 : -1}
                      onClick={() => onTabChange?.(tab.value)}
                      onKeyDown={handleTabKeyDown(index)}
                      className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap border-b-2 pb-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 ${
                        selected
                          ? 'border-brand-700 text-brand-700'
                          : 'border-transparent text-ink-mute hover:text-ink'
                      }`}
                    >
                      <span>{tab.label}</span>
                      {typeof tab.count === 'number' ? (
                        <span
                          className={`tabular-nums rounded-full px-1.5 py-0.5 text-[0.6875rem] leading-none ${
                            selected
                              ? 'bg-brand-700/15 text-brand-700'
                              : 'bg-brand-50 text-ink-mute'
                          }`}
                        >
                          {formatNumberId(tab.count)}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>

          {headerActions ? (
            <div className="w-full lg:w-auto lg:shrink-0">{headerActions}</div>
          ) : null}
        </div>
      ) : null}

      <div
        role={hasTabs ? 'tabpanel' : undefined}
        className="p-4 sm:p-5"
      >
        {renderBody()}
      </div>

      {authorityNote ? (
        <div className="border-t border-line/70 bg-brand-50/45 px-4 py-2.5 text-xs text-ink-soft sm:px-5">
          {authorityNote}
        </div>
      ) : null}
    </section>
  );
}
