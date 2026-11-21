'use client';

import AnimatedList from '@/components/effects/AnimatedList';
import EmptyState from '@/components/ui/EmptyState';
import { TableSkeleton } from '@/components/ui/Skeleton';

const PRIMARY_KEYS = new Set(['artwork', 'candidate', 'category', 'title', 'user']);

function getGridTemplate(columns) {
  return columns
    .map((col, idx) => {
      if (col.colWidth) return col.colWidth;
      if (col.key === 'id') return '64px';
      if (col.key === 'actions' || col.key === 'action') {
        return 'max-content';
      }
      if (col.key === 'status' || col.key === 'role') {
        return '116px';
      }
      if (PRIMARY_KEYS.has(col.key) || (idx === 0 && col.key !== 'id')) {
        return 'minmax(150px, 1.5fr)';
      }
      return 'minmax(90px, 1fr)';
    })
    .join(' ');
}

export default function DataTable({
  columns = [],
  rows = [],
  rowKey,
  loading = false,
  emptyTitle = 'Belum ada data',
  emptyDescription = 'Data akan muncul di sini saat tersedia.',
  authorityNote,
  maxHeight = 560,
  onRowSelect,
}) {
  if (loading) {
    return <TableSkeleton />;
  }

  if (!rows || rows.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  const gridTemplateColumns = getGridTemplate(columns);
  const items = rows.map((row, idx) => ({
    id: rowKey ? row[rowKey] : idx,
    row,
  }));

  return (
    <div className="space-y-3" style={{ ['--dt-cols']: gridTemplateColumns }}>
      {columns.length > 0 ? (
        <div
          className="animated-list__table-head text-[12px] font-semibold uppercase tracking-[0.06em] text-ink-soft"
          aria-hidden="true"
        >
          {columns.map((col) => (
            <div key={col.key} className={`min-w-0 truncate ${col.className || ''}`}>
              {col.label}
            </div>
          ))}
        </div>
      ) : null}

      <AnimatedList
        items={items}
        animation="pop"
        theme="dark"
        accentColor="#F2C94C"
        radius={18}
        gap={10}
        padding={12}
        maxHeight={maxHeight}
        selectOnHover
        enableArrowNavigation
        showScrollbar
        showGradients
        onItemSelect={
          onRowSelect ? (entry, index) => onRowSelect(entry.row, index) : undefined
        }
        renderItem={(entry) => {
          const { row } = entry;
          return (
            <div className="animated-list__table-row">
              {columns.map((col, colIdx) => {
                const isPrimary =
                  PRIMARY_KEYS.has(col.key) || (colIdx === 0 && col.key !== 'id');
                return (
                  <div
                    key={col.key}
                    className={`min-w-0 text-sm text-ink ${
                      isPrimary ? 'animated-list__table-primary' : 'shrink-0'
                    } ${col.cellClassName || ''}`}
                  >
                    {col.render ? col.render(row) : row[col.key]}
                  </div>
                );
              })}
            </div>
          );
        }}
      />

      {authorityNote ? (
        <div className="rounded-[18px] border border-brand-100 bg-brand-50 px-4 py-3 text-sm text-ink-soft">
          {authorityNote}
        </div>
      ) : null}
    </div>
  );
}
