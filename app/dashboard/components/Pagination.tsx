'use client';

interface Props {
  page: number;
  totalPages: number;
  onPage: (p: number) => void;
}

export function Pagination({ page, totalPages, onPage }: Props) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between px-4 py-2.5 border-t border-[#e2e4ef] shrink-0">
      <button
        disabled={page === 1}
        onClick={() => onPage(page - 1)}
        className="px-3 py-1.5 rounded-[8px] border border-[#e2e4ef] bg-[#f0f1f7] text-[#5c6078] text-[11px] font-medium hover:bg-[#eceef5] transition-colors"
        style={{
          cursor: page === 1 ? 'not-allowed' : 'pointer',
          opacity: page === 1 ? 0.4 : 1,
          fontFamily: 'var(--font-ibm-plex-mono), IBM Plex Mono, monospace',
        }}
      >
        ← Prev
      </button>
      <span
        className="text-[11px] text-[#9498b3]"
        style={{ fontFamily: 'var(--font-ibm-plex-mono), IBM Plex Mono, monospace' }}
      >
        {page} / {totalPages}
      </span>
      <button
        disabled={page === totalPages}
        onClick={() => onPage(page + 1)}
        className="px-3 py-1.5 rounded-[8px] border border-[#e2e4ef] bg-[#f0f1f7] text-[#5c6078] text-[11px] font-medium hover:bg-[#eceef5] transition-colors"
        style={{
          cursor: page === totalPages ? 'not-allowed' : 'pointer',
          opacity: page === totalPages ? 0.4 : 1,
          fontFamily: 'var(--font-ibm-plex-mono), IBM Plex Mono, monospace',
        }}
      >
        Next →
      </button>
    </div>
  );
}
