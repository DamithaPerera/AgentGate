'use client';

interface Props {
  page: number;
  totalPages: number;
  onPage: (p: number) => void;
}

export function Pagination({ page, totalPages, onPage }: Props) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between pt-2 border-t border-white/[0.08] shrink-0">
      <button disabled={page === 1} onClick={() => onPage(page - 1)}
        className="px-3 py-1 rounded-md border border-white/10 bg-white/[0.06] text-[#94A3B8] text-xs font-medium"
        style={{
          cursor: page === 1 ? 'not-allowed' : 'pointer',
          opacity: page === 1 ? 0.4 : 1,
        }}>
        ← Prev
      </button>
      <span className="text-xs text-[#475569]">{page} / {totalPages}</span>
      <button disabled={page === totalPages} onClick={() => onPage(page + 1)}
        className="px-3 py-1 rounded-md border border-white/10 bg-white/[0.06] text-[#94A3B8] text-xs font-medium"
        style={{
          cursor: page === totalPages ? 'not-allowed' : 'pointer',
          opacity: page === totalPages ? 0.4 : 1,
        }}>
        Next →
      </button>
    </div>
  );
}
