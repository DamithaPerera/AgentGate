'use client';

interface Props {
  page: number;
  totalPages: number;
  onPage: (p: number) => void;
}

export function Pagination({ page, totalPages, onPage }: Props) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between pt-2 flex-shrink-0" style={{ borderTop: '1px solid var(--color-border)' }}>
      <button
        disabled={page === 1}
        onClick={() => onPage(page - 1)}
        className="text-xs px-3 py-1 rounded border transition-opacity disabled:opacity-30"
        style={{ background: 'var(--color-bg-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text-medium)' }}>
        ← Prev
      </button>
      <span className="text-xs" style={{ color: 'var(--color-text-low)' }}>
        {page} / {totalPages}
      </span>
      <button
        disabled={page === totalPages}
        onClick={() => onPage(page + 1)}
        className="text-xs px-3 py-1 rounded border transition-opacity disabled:opacity-30"
        style={{ background: 'var(--color-bg-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text-medium)' }}>
        Next →
      </button>
    </div>
  );
}
