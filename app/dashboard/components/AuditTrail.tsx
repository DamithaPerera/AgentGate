'use client';
import { useState } from 'react';
import type { AuditEntry } from '@/lib/types';
import { Pagination } from './Pagination';
import { Badge, StatusDot, FilterInput, EmptyState, StatusBanner } from './ui';

const PAGE_SIZE = 5;

interface Props {
  entries: AuditEntry[];
  onExport: () => void;
  onVerify: () => Promise<{ valid: boolean; message: string }>;
}

const DECISION_STYLES: Record<string, { bg: string; color: string; border: string; dot: string }> = {
  ALLOWED:    { bg: '#e7faf0', color: '#12b76a', border: '#12b76a33', dot: '#12b76a' },
  REGISTERED: { bg: '#ebf0ff', color: '#3b6cff', border: '#3b6cff33', dot: '#3b6cff' },
  DENIED:     { bg: '#fef2f2', color: '#ef4444', border: '#ef444433', dot: '#ef4444' },
  REVOKED:    { bg: '#fef2f2', color: '#ef4444', border: '#ef444433', dot: '#ef4444' },
  ESCALATED:  { bg: '#fefce8', color: '#f59e0b', border: '#f59e0b33', dot: '#f59e0b' },
  PENDING:    { bg: '#fefce8', color: '#f59e0b', border: '#f59e0b33', dot: '#f59e0b' },
  EXPIRED:    { bg: '#f0f1f7', color: '#9498b3', border: '#e2e4ef',   dot: '#9498b3' },
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
    <div className="flex flex-col h-full">
      {/* Filter toolbar — inside panel body at top */}
      <div className="px-4 py-3 border-b border-[#e2e4ef] flex gap-2 shrink-0">
        <FilterInput
          value={filter}
          onChange={v => { setFilter(v); setPage(1); }}
          placeholder="Filter entries…"
        />
        <button
          onClick={handleVerify}
          className="px-3 py-[7px] rounded-[10px] border border-[#e2e4ef] bg-[#f0f1f7] text-[#5c6078] text-[11px] font-medium cursor-pointer whitespace-nowrap hover:bg-[#eceef5] transition-colors"
        >
          Verify
        </button>
        <button
          onClick={onExport}
          className="px-3 py-[7px] rounded-[10px] border border-[#e2e4ef] bg-[#f0f1f7] text-[#5c6078] text-[11px] font-medium cursor-pointer whitespace-nowrap hover:bg-[#eceef5] transition-colors"
        >
          Export
        </button>
      </div>

      {verifyResult && (
        <div className="px-4 pt-2 shrink-0">
          <StatusBanner type={verifyResult.valid ? 'success' : 'error'} text={verifyResult.message} />
        </div>
      )}

      {/* Entries */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {filtered.length === 0 ? (
          <EmptyState
            message={filter ? 'No matching entries' : 'No audit entries yet'}
          />
        ) : pagedEntries.map((entry, idx) => {
          const ds = DECISION_STYLES[entry.decision] ?? { bg: '#f0f1f7', color: '#9498b3', border: '#e2e4ef', dot: '#9498b3' };
          const isOpen = expanded === entry.id;
          const isLast = idx === pagedEntries.length - 1;
          return (
            <div
              key={entry.id}
              style={{ borderBottom: isLast ? 'none' : '1px solid #e2e4ef' }}
            >
              <button
                className="w-full text-left px-5 py-3.5 bg-transparent border-none cursor-pointer hover:bg-[#eceef5] transition-colors"
                onClick={() => setExpanded(isOpen ? null : entry.id)}
              >
                {/* Main row */}
                <div className="flex items-center gap-2.5">
                  <span
                    className="text-[10px] text-[#9498b3] shrink-0 min-w-[28px]"
                    style={{ fontFamily: 'var(--font-ibm-plex-mono), IBM Plex Mono, monospace' }}
                  >
                    #{entry.sequenceNumber}
                  </span>
                  <StatusDot color={ds.dot} />
                  <span
                    className="text-[11px] font-medium text-[#5c6078] flex-1 truncate"
                    style={{ fontFamily: 'var(--font-ibm-plex-mono), IBM Plex Mono, monospace' }}
                  >
                    {entry.type}
                  </span>
                  <span
                    className="text-[10px] text-[#9498b3] shrink-0"
                    style={{ fontFamily: 'var(--font-ibm-plex-mono), IBM Plex Mono, monospace' }}
                  >
                    {new Date(entry.timestamp).toLocaleTimeString()}
                  </span>
                  <Badge style={{ background: ds.bg, color: ds.color, border: `1px solid ${ds.border}` }}>
                    {entry.decision}
                  </Badge>
                  <span className="text-[10px] text-[#9498b3] shrink-0">{isOpen ? '▲' : '▼'}</span>
                </div>
                {/* Detail sub-row */}
                <div className="flex gap-1.5 mt-1 ml-[52px]">
                  <span
                    className="text-[10px] text-[#9498b3] truncate"
                    style={{ fontFamily: 'var(--font-ibm-plex-mono), IBM Plex Mono, monospace' }}
                  >
                    {entry.action}
                  </span>
                  {entry.resource && (
                    <span
                      className="text-[10px] text-[#d0d3e2]"
                      style={{ fontFamily: 'var(--font-ibm-plex-mono), IBM Plex Mono, monospace' }}
                    >
                      → {entry.resource}
                    </span>
                  )}
                </div>
              </button>

              {isOpen && (
                <div className="px-5 py-3.5 border-t border-[#e2e4ef] bg-[#f6f7fb]">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mb-2.5">
                    {[
                      ['Agent', entry.agentId],
                      ['Policy', entry.policyId ?? '—'],
                      ['User', entry.userId],
                      ...(entry.tokenTTL ? [['TTL', `${entry.tokenTTL}s`]] : []),
                    ].map(([label, val]) => (
                      <div key={label} className="text-[11px]">
                        <span className="text-[#9498b3]">{label}: </span>
                        <span
                          className="text-[#1a1d2e]"
                          style={{ fontFamily: 'var(--font-ibm-plex-mono), IBM Plex Mono, monospace' }}
                        >
                          {val}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="text-[11px] text-[#5c6078] italic mb-2.5">{entry.reason}</div>
                  {entry.tokenScopes && (
                    <div className="flex flex-wrap gap-1 mb-2.5">
                      {entry.tokenScopes.map(s => (
                        <span
                          key={s}
                          className="text-[10px] px-[6px] py-[2px] rounded-[6px] bg-[#f0f1f7] text-[#5c6078] border border-[#e2e4ef]"
                          style={{ fontFamily: 'var(--font-ibm-plex-mono), IBM Plex Mono, monospace' }}
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="border-t border-[#e2e4ef] pt-2">
                    <div
                      className="text-[10px] text-[#9498b3] break-all"
                      style={{ fontFamily: 'var(--font-ibm-plex-mono), IBM Plex Mono, monospace' }}
                    >
                      hash: {entry.hash.substring(0, 20)}…
                    </div>
                    <div
                      className="text-[10px] text-[#d0d3e2] break-all"
                      style={{ fontFamily: 'var(--font-ibm-plex-mono), IBM Plex Mono, monospace' }}
                    >
                      prev: {entry.previousHash.substring(0, 20)}…
                    </div>
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
