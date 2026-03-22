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

function DecisionDot({ decision }: { decision: string }) {
  const c: Record<string, string> = {
    ALLOWED: 'var(--color-success)', DENIED: 'var(--color-danger)',
    ESCALATED: 'var(--color-warning)', REVOKED: 'var(--color-danger)',
    EXPIRED: 'var(--color-text-subtle)', REGISTERED: 'var(--color-brand)', PENDING: 'var(--color-warning)',
  };
  return <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: c[decision] ?? 'var(--color-text-subtle)' }} />;
}

function decisionColor(d: string) {
  if (d === 'ALLOWED' || d === 'REGISTERED') return 'var(--color-success-text)';
  if (d === 'DENIED' || d === 'REVOKED') return 'var(--color-danger-text)';
  return 'var(--color-warning-text)';
}

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
    <div className="flex flex-col h-full gap-2">
      {/* Toolbar */}
      <div className="flex gap-2 flex-shrink-0">
        <input type="text" placeholder="Filter entries…" value={filter}
          onChange={e => { setFilter(e.target.value); setPage(1); }}
          className="flex-1 rounded px-3 py-1.5 text-xs border focus:outline-none"
          style={{ background: 'var(--color-bg-page)', borderColor: 'var(--color-border)',
            color: 'var(--color-text-high)' }} />
        <button onClick={handleVerify}
          className="text-xs font-medium px-3 py-1.5 rounded border transition-colors hover:opacity-80"
          style={{ background: 'var(--color-bg-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text-medium)' }}>
          Verify
        </button>
        <button onClick={onExport}
          className="text-xs font-medium px-3 py-1.5 rounded border transition-colors hover:opacity-80"
          style={{ background: 'var(--color-bg-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text-medium)' }}>
          Export
        </button>
      </div>

      {/* Verify banner */}
      {verifyResult && (
        <div className="rounded px-3 py-2 text-xs font-medium border"
          style={{
            background: verifyResult.valid ? 'var(--color-success-bg)' : 'var(--color-danger-bg)',
            color: verifyResult.valid ? 'var(--color-success-text)' : 'var(--color-danger-text)',
            borderColor: verifyResult.valid ? '#ABF5D1' : '#FFBDAD',
          }}>
          {verifyResult.valid ? '✓' : '✗'} {verifyResult.message}
        </div>
      )}

      {/* Entries */}
      <div className="flex-1 overflow-y-auto space-y-1.5 min-h-0">
        {filtered.length === 0 ? (
          <div className="text-xs text-center py-8" style={{ color: 'var(--color-text-subtle)' }}>
            {filter ? 'No matching entries' : 'No audit entries yet'}
          </div>
        ) : pagedEntries.map(entry => (
          <div key={entry.id} className="rounded border overflow-hidden"
            style={{ background: 'var(--color-bg-surface)', borderColor: 'var(--color-border)' }}>
            <button className="w-full text-left p-2.5 transition-colors hover:opacity-80"
              style={{ background: 'inherit' }}
              onClick={() => setExpanded(expanded === entry.id ? null : entry.id)}>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono w-6 flex-shrink-0" style={{ color: 'var(--color-text-subtle)' }}>
                  #{entry.sequenceNumber}
                </span>
                <DecisionDot decision={entry.decision} />
                <span className="text-xs font-mono flex-shrink-0" style={{ color: 'var(--color-text-subtle)' }}>
                  {new Date(entry.timestamp).toLocaleTimeString()}
                </span>
                <span className="text-xs font-medium truncate flex-1" style={{ color: 'var(--color-text-medium)' }}>
                  {entry.type}
                </span>
                <span className="text-xs font-semibold flex-shrink-0" style={{ color: decisionColor(entry.decision) }}>
                  {entry.decision}
                </span>
              </div>
              <div className="flex items-center gap-1 mt-0.5 ml-8">
                <span className="text-xs font-mono truncate" style={{ color: 'var(--color-text-low)' }}>{entry.action}</span>
                {entry.resource && <span className="text-xs" style={{ color: 'var(--color-border-bold)' }}>→</span>}
                <span className="text-xs truncate" style={{ color: 'var(--color-text-low)' }}>{entry.resource}</span>
              </div>
            </button>

            {expanded === entry.id && (
              <div className="px-3 pb-3 pt-2 space-y-2"
                style={{ borderTop: '1px solid var(--color-border)', background: 'var(--color-bg-sunken)' }}>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                  <div><span style={{ color: 'var(--color-text-low)' }}>Agent:</span>{' '}
                    <span className="font-mono" style={{ color: 'var(--color-text-high)' }}>{entry.agentId}</span></div>
                  <div><span style={{ color: 'var(--color-text-low)' }}>Policy:</span>{' '}
                    <span style={{ color: 'var(--color-text-high)' }}>{entry.policyId ?? '—'}</span></div>
                  <div><span style={{ color: 'var(--color-text-low)' }}>User:</span>{' '}
                    <span className="font-mono" style={{ color: 'var(--color-text-high)' }}>{entry.userId}</span></div>
                  {entry.tokenTTL && (
                    <div><span style={{ color: 'var(--color-text-low)' }}>TTL:</span>{' '}
                      <span className="font-semibold" style={{ color: 'var(--color-success-text)' }}>{entry.tokenTTL}s</span></div>
                  )}
                </div>
                <div className="text-xs italic" style={{ color: 'var(--color-text-medium)' }}>{entry.reason}</div>
                {entry.tokenScopes && (
                  <div className="flex gap-1 flex-wrap">
                    {entry.tokenScopes.map(s => (
                      <span key={s} className="text-xs px-1.5 py-0.5 rounded font-mono"
                        style={{ background: 'var(--color-brand-light)', color: 'var(--color-info-text)' }}>{s}</span>
                    ))}
                  </div>
                )}
                <div className="pt-1 space-y-0.5" style={{ borderTop: '1px solid var(--color-border)' }}>
                  <div className="text-xs font-mono break-all" style={{ color: 'var(--color-text-subtle)' }}>
                    hash: {entry.hash.substring(0, 20)}…
                  </div>
                  <div className="text-xs font-mono break-all" style={{ color: 'var(--color-border-bold)' }}>
                    prev: {entry.previousHash.substring(0, 20)}…
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      <Pagination page={page} totalPages={totalPages} onPage={setPage} />
    </div>
  );
}
