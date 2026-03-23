'use client';

interface Props {
  page: number;
  totalPages: number;
  onPage: (p: number) => void;
}

export function Pagination({ page, totalPages, onPage }: Props) {
  if (totalPages <= 1) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.08)', flexShrink: 0 }}>
      <button disabled={page === 1} onClick={() => onPage(page - 1)}
        style={{ padding: '4px 12px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.06)', color: '#94A3B8', fontSize: 12, fontWeight: 500, cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.4 : 1 }}>
        ← Prev
      </button>
      <span style={{ fontSize: 12, color: '#475569' }}>{page} / {totalPages}</span>
      <button disabled={page === totalPages} onClick={() => onPage(page + 1)}
        style={{ padding: '4px 12px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.06)', color: '#94A3B8', fontSize: 12, fontWeight: 500, cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.4 : 1 }}>
        Next →
      </button>
    </div>
  );
}
