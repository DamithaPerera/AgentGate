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
    <div className="flex flex-col h-full gap-2">
      {/* Toolbar */}
      <div className="flex gap-1.5 shrink-0">
        <FilterInput
          value={filter}
          onChange={v => { setFilter(v); setPage(1); }}
          placeholder="Filter entries…"
        />
        <button onClick={handleVerify}
          className="px-3 py-[7px] rounded-lg border border-[#E2E8F0] bg-white text-[#374151] text-xs font-medium cursor-pointer whitespace-nowrap">
          Verify
        </button>
        <button onClick={onExport}
          className="px-3 py-[7px] rounded-lg border border-[#E2E8F0] bg-white text-[#374151] text-xs font-medium cursor-pointer whitespace-nowrap">
          Export
        </button>
      </div>

      {verifyResult && (
        <StatusBanner type={verifyResult.valid ? 'success' : 'error'} text={verifyResult.message} />
      )}

      {/* Entries */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-[5px] min-h-0">
        {filtered.length === 0 ? (
          <EmptyState
            message={filter ? 'No matching entries' : 'No audit entries yet'}
          />
        ) : pagedEntries.map(entry => {
          const ds = DECISION_STYLES[entry.decision] ?? { bg: '#F8FAFC', color: '#64748B', dot: '#94A3B8' };
          const isOpen = expanded === entry.id;
          return (
            <div key={entry.id} className="bg-white border border-[#E2E8F0] rounded-[10px] overflow-hidden">
              <button className="w-full text-left px-3 py-2.5 bg-transparent border-none cursor-pointer"
                onClick={() => setExpanded(isOpen ? null : entry.id)}>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-[#94A3B8] shrink-0 min-w-[24px]">#{entry.sequenceNumber}</span>
                  <StatusDot color={ds.dot} />
                  <span className="text-[10px] font-mono text-[#94A3B8] shrink-0">{new Date(entry.timestamp).toLocaleTimeString()}</span>
                  <span className="text-xs font-medium text-[#374151] flex-1 truncate">{entry.type}</span>
                  <Badge style={{ background: ds.bg, color: ds.color }} className="font-bold px-2 py-0.5">
                    {entry.decision}
                  </Badge>
                  <span className="text-[10px] text-[#94A3B8]">{isOpen ? '▲' : '▼'}</span>
                </div>
                <div className="flex gap-1.5 mt-1 ml-8">
                  <span className="text-[10px] font-mono text-[#64748B] truncate">{entry.action}</span>
                  {entry.resource && <span className="text-[10px] text-[#CBD5E1]">→ {entry.resource}</span>}
                </div>
              </button>

              {isOpen && (
                <div className="px-3 py-2.5 border-t border-[#F1F5F9] bg-[#F8FAFC]">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 mb-2">
                    {[
                      ['Agent', entry.agentId],
                      ['Policy', entry.policyId ?? '—'],
                      ['User', entry.userId],
                      ...(entry.tokenTTL ? [['TTL', `${entry.tokenTTL}s`]] : []),
                    ].map(([label, val]) => (
                      <div key={label} className="text-[11px]">
                        <span className="text-[#94A3B8]">{label}: </span>
                        <span className="text-[#0F172A] font-mono">{val}</span>
                      </div>
                    ))}
                  </div>
                  <div className="text-xs text-[#64748B] italic mb-2">{entry.reason}</div>
                  {entry.tokenScopes && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {entry.tokenScopes.map(s => (
                        <span key={s} className="text-[10px] px-1.5 py-0.5 rounded bg-[#EFF6FF] text-[#1D4ED8] font-mono border border-[#BFDBFE]">{s}</span>
                      ))}
                    </div>
                  )}
                  <div className="border-t border-[#E2E8F0] pt-1.5">
                    <div className="text-[10px] font-mono text-[#94A3B8] break-all">hash: {entry.hash.substring(0, 20)}…</div>
                    <div className="text-[10px] font-mono text-[#CBD5E1] break-all">prev: {entry.previousHash.substring(0, 20)}…</div>
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
