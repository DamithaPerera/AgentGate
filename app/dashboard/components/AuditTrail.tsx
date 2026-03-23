'use client';
import { useState } from 'react';
import type { AuditEntry } from '@/lib/types';
import { Pagination } from './Pagination';

const PAGE_SIZE = 5;

interface Props {
  entries: AuditEntry[];
  onExport: () => void;
  onVerify: () => Promise<{ valid: boolean; message: string }>;
}

const DECISION_STYLES: Record<string, { bg: string; color: string; dot: string }> = {
  ALLOWED:    { bg: '#F0FDF4', color: '#16A34A', dot: '#16A34A' },
  REGISTERED: { bg: '#EFF6FF', color: '#1D4ED8', dot: '#1D4ED8' },
  DENIED:     { bg: '#FFF1F2', color: '#DC2626', dot: '#DC2626' },
  REVOKED:    { bg: '#FFF1F2', color: '#DC2626', dot: '#DC2626' },
  ESCALATED:  { bg: '#FFFBEB', color: '#D97706', dot: '#D97706' },
  PENDING:    { bg: '#FFFBEB', color: '#D97706', dot: '#D97706' },
  EXPIRED:    { bg: '#F8FAFC', color: '#64748B', dot: '#94A3B8' },
};

export function AuditTrail({ entries, onExport, onVerify }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);
  const [verifyResult, setVerifyResult] = useState<{ valid: boolean; message: string } | null>(null);

  const filtered = entries.filter(e => {
    if (!filter) return true;
    const q = filter.toLowerCase();
    return e.type.toLowerCase().includes(q) || e.agentId.toLowerCase().includes(q) ||
      e.action.toLowerCase().includes(q) || e.decision.toLowerCase().includes(q) || e.reason.toLowerCase().includes(q);
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pagedEntries = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleVerify = async () => {
    const result = await onVerify();
    setVerifyResult(result);
    setTimeout(() => setVerifyResult(null), 5000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 8 }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
        <input type="text" placeholder="Filter entries…" value={filter}
          onChange={e => { setFilter(e.target.value); setPage(1); }}
          style={{ flex: 1, borderRadius: 8, padding: '7px 12px', fontSize: 12, border: '1px solid #E2E8F0', background: '#fff', color: '#0F172A', outline: 'none', minWidth: 0 }} />
        <button onClick={handleVerify}
          style={{ padding: '7px 12px', borderRadius: 8, border: '1px solid #E2E8F0', background: '#fff', color: '#374151', fontSize: 12, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap' }}>
          Verify
        </button>
        <button onClick={onExport}
          style={{ padding: '7px 12px', borderRadius: 8, border: '1px solid #E2E8F0', background: '#fff', color: '#374151', fontSize: 12, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap' }}>
          Export
        </button>
      </div>

      {verifyResult && (
        <div style={{ fontSize: 12, padding: '7px 12px', borderRadius: 8, fontWeight: 600, background: verifyResult.valid ? '#F0FDF4' : '#FFF1F2', color: verifyResult.valid ? '#16A34A' : '#DC2626', border: `1px solid ${verifyResult.valid ? '#BBF7D0' : '#FECDD3'}`, flexShrink: 0 }}>
          {verifyResult.valid ? '✓' : '✗'} {verifyResult.message}
        </div>
      )}

      {/* Entries */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 5, minHeight: 0 }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 16px', color: '#94A3B8', fontSize: 13 }}>
            {filter ? 'No matching entries' : 'No audit entries yet'}
          </div>
        ) : pagedEntries.map(entry => {
          const ds = DECISION_STYLES[entry.decision] ?? { bg: '#F8FAFC', color: '#64748B', dot: '#94A3B8' };
          const isOpen = expanded === entry.id;
          return (
            <div key={entry.id} style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 10, overflow: 'hidden' }}>
              <button style={{ width: '100%', textAlign: 'left', padding: '10px 12px', background: 'transparent', border: 'none', cursor: 'pointer' }}
                onClick={() => setExpanded(isOpen ? null : entry.id)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 10, fontFamily: 'monospace', color: '#94A3B8', flexShrink: 0, minWidth: 24 }}>#{entry.sequenceNumber}</span>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: ds.dot, display: 'inline-block', flexShrink: 0 }} />
                  <span style={{ fontSize: 10, fontFamily: 'monospace', color: '#94A3B8', flexShrink: 0 }}>{new Date(entry.timestamp).toLocaleTimeString()}</span>
                  <span style={{ fontSize: 12, fontWeight: 500, color: '#374151', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{entry.type}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: ds.bg, color: ds.color, flexShrink: 0 }}>{entry.decision}</span>
                  <span style={{ fontSize: 10, color: '#94A3B8' }}>{isOpen ? '▲' : '▼'}</span>
                </div>
                <div style={{ display: 'flex', gap: 6, marginTop: 4, marginLeft: 32 }}>
                  <span style={{ fontSize: 10, fontFamily: 'monospace', color: '#64748B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{entry.action}</span>
                  {entry.resource && <span style={{ fontSize: 10, color: '#CBD5E1' }}>→ {entry.resource}</span>}
                </div>
              </button>

              {isOpen && (
                <div style={{ padding: '10px 12px', borderTop: '1px solid #F1F5F9', background: '#F8FAFC' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 16px', marginBottom: 8 }}>
                    {[
                      ['Agent', entry.agentId],
                      ['Policy', entry.policyId ?? '—'],
                      ['User', entry.userId],
                      ...(entry.tokenTTL ? [['TTL', `${entry.tokenTTL}s`]] : []),
                    ].map(([label, val]) => (
                      <div key={label} style={{ fontSize: 11 }}>
                        <span style={{ color: '#94A3B8' }}>{label}: </span>
                        <span style={{ color: '#0F172A', fontFamily: 'monospace' }}>{val}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize: 12, color: '#64748B', fontStyle: 'italic', marginBottom: 8 }}>{entry.reason}</div>
                  {entry.tokenScopes && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
                      {entry.tokenScopes.map(s => (
                        <span key={s} style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: '#EFF6FF', color: '#1D4ED8', fontFamily: 'monospace', border: '1px solid #BFDBFE' }}>{s}</span>
                      ))}
                    </div>
                  )}
                  <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: 6 }}>
                    <div style={{ fontSize: 10, fontFamily: 'monospace', color: '#94A3B8', wordBreak: 'break-all' }}>hash: {entry.hash.substring(0, 20)}…</div>
                    <div style={{ fontSize: 10, fontFamily: 'monospace', color: '#CBD5E1', wordBreak: 'break-all' }}>prev: {entry.previousHash.substring(0, 20)}…</div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Pagination page={page} totalPages={totalPages} onPage={setPage} />
    </div>
  );
}
