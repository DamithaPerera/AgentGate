'use client';
import { useState, useCallback } from 'react';
import type { AgentEvent } from '@/lib/types';
import { CIBACard, type CIBARequest } from './CIBACard';
import { Pagination } from './Pagination';
import { Badge, EmptyState } from './ui';

const PAGE_SIZE = 5;

interface FeedEntry {
  id: string; timestamp: string; type: string;
  agentName?: string; agentId?: string; action?: string;
  resource?: string; decision?: string; reason?: string; tokenTTL?: number;
}

interface Props { events: AgentEvent[]; isLoggedIn?: boolean; }

const DECISION_STYLES: Record<string, { bg: string; color: string; icon: string }> = {
  ALLOWED:       { bg: '#F0FDF4', color: '#16A34A', icon: '✓' },
  APPROVED_CIBA: { bg: '#F0FDF4', color: '#16A34A', icon: '✓' },
  DENIED:        { bg: '#FFF1F2', color: '#DC2626', icon: '✗' },
  ESCALATED:     { bg: '#FFFBEB', color: '#D97706', icon: '⚠' },
  REVOKED:       { bg: '#FFF1F2', color: '#DC2626', icon: '⚡' },
};

const TYPE_LABELS: Record<string, { label: string; bg: string; color: string }> = {
  agent_registered: { label: '🤖 Registered',     bg: '#EFF6FF', color: '#1D4ED8' },
  agent_revoked:    { label: '⚡ Revoked',         bg: '#FFF1F2', color: '#DC2626' },
  auth_request:     { label: '🔒 Auth Request',    bg: '#F8FAFC', color: '#374151' },
  ciba_approved:    { label: '✓ CIBA Approved',    bg: '#F0FDF4', color: '#16A34A' },
  ciba_denied:      { label: '✗ CIBA Denied',      bg: '#FFF1F2', color: '#DC2626' },
  ciba_expired:     { label: '⏱ CIBA Expired',    bg: '#FFFBEB', color: '#D97706' },
  token_issued:     { label: '🎫 Token Issued',    bg: '#F0FDF4', color: '#15803D' },
  revocation:       { label: '⚡ Revocation',       bg: '#FFF1F2', color: '#DC2626' },
  panic_revocation: { label: '🚨 PANIC',            bg: '#FFF1F2', color: '#991B1B' },
  audit_entry:      { label: '📋 Audit',            bg: '#F5F3FF', color: '#7C3AED' },
};

export function LiveFeed({ events, isLoggedIn }: Props) {
  const [cibaRequests, setCibaRequests] = useState<Record<string, CIBARequest>>({});
  const [page, setPage] = useState(1);

  const handleCibaRespond = useCallback((requestId: string) => {
    setCibaRequests(prev => { const n = { ...prev }; delete n[requestId]; return n; });
  }, []);

  for (const event of events) {
    if (event.type === 'ciba_request') {
      const d = event.data as unknown as CIBARequest;
      if (!cibaRequests[d.requestId]) {
        setCibaRequests(prev => ({ ...prev, [d.requestId]: d }));
      }
    }
  }

  const feedEntries: FeedEntry[] = events
    .filter(e => e.type !== 'ciba_request')
    .map((e, i) => ({
      id: `${e.timestamp}-${i}`,
      timestamp: e.timestamp,
      type: e.type,
      agentName: (e.data.agentName as string) ?? (e.data.agentId as string),
      agentId: e.data.agentId as string,
      action: e.data.action as string,
      resource: e.data.resource as string,
      decision: e.data.decision as string,
      reason: e.data.reason as string,
      tokenTTL: e.data.tokenTTL as number,
    }))
    .slice(0, 200);

  const totalPages = Math.max(1, Math.ceil(feedEntries.length / PAGE_SIZE));
  const pagedEntries = feedEntries.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="flex flex-col h-full gap-1.5">
      {Object.values(cibaRequests).map(req => (
        <CIBACard key={req.requestId} request={req} onRespond={handleCibaRespond} />
      ))}

      <div className="flex-1 overflow-y-auto flex flex-col gap-[5px] min-h-0">
        {feedEntries.length === 0 && Object.keys(cibaRequests).length === 0 ? (
          <EmptyState
            message="Waiting for events…"
            hint={!isLoggedIn ? 'Click ▶ Run Demo to start' : undefined}
          />
        ) : pagedEntries.map(entry => {
          const typeInfo = TYPE_LABELS[entry.type] ?? { label: entry.type, bg: '#F8FAFC', color: '#374151' };
          const decisionStyle = entry.decision ? DECISION_STYLES[entry.decision] : null;
          return (
            <div key={entry.id} className="feed-entry bg-white border border-[#E2E8F0] rounded-[10px] px-3 py-2.5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Badge style={{ background: typeInfo.bg, color: typeInfo.color }}>
                      {typeInfo.label}
                    </Badge>
                    <span className="text-[10px] text-[#94A3B8] font-mono">{new Date(entry.timestamp).toLocaleTimeString()}</span>
                  </div>
                  {entry.agentName && (
                    <div className="text-xs font-semibold text-[#0F172A] mb-0.5 truncate">{entry.agentName}</div>
                  )}
                  {entry.action && (
                    <div className="text-[11px] text-[#64748B] font-mono mb-0.5">{entry.action}</div>
                  )}
                  {entry.tokenTTL && (
                    <div className="text-[11px] text-[#16A34A] font-semibold">TTL: {entry.tokenTTL}s</div>
                  )}
                </div>
                {decisionStyle && (
                  <Badge style={{ background: decisionStyle.bg, color: decisionStyle.color }} className="font-bold px-2 py-[3px]">
                    {decisionStyle.icon} {entry.decision}
                  </Badge>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Pagination page={page} totalPages={totalPages} onPage={setPage} />
    </div>
  );
}
