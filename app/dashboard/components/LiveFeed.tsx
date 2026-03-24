'use client';
import { useState, useCallback } from 'react';
import type { AgentEvent } from '@/lib/types';
import { CIBACard, type CIBARequest } from './CIBACard';
import { Pagination } from './Pagination';
import { Badge, StatusDot, EmptyState } from './ui';

const PAGE_SIZE = 10;

interface FeedEntry {
  id: string; timestamp: string; type: string;
  agentName?: string; agentId?: string; action?: string;
  resource?: string; decision?: string; reason?: string; tokenTTL?: number;
}

interface Props { events: AgentEvent[]; isLoggedIn?: boolean; }

const DECISION_STYLES: Record<string, { bg: string; color: string; border: string; dot: string }> = {
  ALLOWED:       { bg: '#e7faf0', color: '#12b76a', border: '#12b76a33', dot: '#12b76a' },
  APPROVED_CIBA: { bg: '#e7faf0', color: '#12b76a', border: '#12b76a33', dot: '#12b76a' },
  DENIED:        { bg: '#fef2f2', color: '#ef4444', border: '#ef444433', dot: '#ef4444' },
  ESCALATED:     { bg: '#fefce8', color: '#f59e0b', border: '#f59e0b33', dot: '#f59e0b' },
  REVOKED:       { bg: '#fef2f2', color: '#ef4444', border: '#ef444433', dot: '#ef4444' },
};

const TYPE_LABELS: Record<string, { label: string; dot: string }> = {
  agent_registered: { label: 'Registered',   dot: '#3b6cff' },
  agent_revoked:    { label: 'Revoked',       dot: '#ef4444' },
  auth_request:     { label: 'Auth Request',  dot: '#9498b3' },
  ciba_approved:    { label: 'CIBA Approved', dot: '#12b76a' },
  ciba_denied:      { label: 'CIBA Denied',   dot: '#ef4444' },
  ciba_expired:     { label: 'CIBA Expired',  dot: '#f59e0b' },
  token_issued:     { label: 'Token Issued',  dot: '#12b76a' },
  revocation:       { label: 'Revocation',    dot: '#ef4444' },
  panic_revocation: { label: 'PANIC',         dot: '#ef4444' },
  audit_entry:      { label: 'Audit',         dot: '#8b5cf6' },
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
    <div className="flex flex-col h-full">
      {Object.values(cibaRequests).map(req => (
        <CIBACard key={req.requestId} request={req} onRespond={handleCibaRespond} />
      ))}

      <div className="flex-1 overflow-y-auto min-h-0">
        {feedEntries.length === 0 && Object.keys(cibaRequests).length === 0 ? (
          <EmptyState
            icon="⚡"
            message="Waiting for events…"
            hint={!isLoggedIn ? 'Click Run Demo to start' : undefined}
          />
        ) : pagedEntries.map((entry, idx) => {
          const typeInfo = TYPE_LABELS[entry.type] ?? { label: entry.type, dot: '#9498b3' };
          const decisionStyle = entry.decision ? DECISION_STYLES[entry.decision] : null;
          const isLast = idx === pagedEntries.length - 1;
          return (
            <div
              key={entry.id}
              className="feed-entry px-5 py-3.5 transition-colors hover:bg-[#eceef5]"
              style={{ borderBottom: isLast ? 'none' : '1px solid #e2e4ef' }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  {/* Type + time row */}
                  <div className="flex items-center gap-2 mb-1.5">
                    <StatusDot color={typeInfo.dot} size="sm" />
                    <span
                      className="text-[11px] font-medium text-[#5c6078]"
                      style={{ fontFamily: 'var(--font-ibm-plex-mono), IBM Plex Mono, monospace' }}
                    >
                      {typeInfo.label}
                    </span>
                    <span
                      className="text-[10px] text-[#9498b3]"
                      style={{ fontFamily: 'var(--font-ibm-plex-mono), IBM Plex Mono, monospace' }}
                    >
                      {new Date(entry.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  {/* Content */}
                  {entry.agentName && (
                    <div className="text-[12px] font-semibold text-[#1a1d2e] mb-0.5 truncate">{entry.agentName}</div>
                  )}
                  {entry.action && (
                    <div
                      className="text-[11px] text-[#5c6078] truncate"
                      style={{ fontFamily: 'var(--font-ibm-plex-mono), IBM Plex Mono, monospace' }}
                    >
                      {entry.action}
                    </div>
                  )}
                  {entry.tokenTTL && (
                    <div className="text-[11px] text-[#12b76a] font-semibold mt-0.5">TTL: {entry.tokenTTL}s</div>
                  )}
                </div>
                {decisionStyle && (
                  <Badge
                    style={{
                      background: decisionStyle.bg,
                      color: decisionStyle.color,
                      border: `1px solid ${decisionStyle.border}`,
                    }}
                  >
                    {entry.decision}
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
