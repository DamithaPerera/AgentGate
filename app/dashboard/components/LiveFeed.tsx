'use client';
import { useState, useCallback } from 'react';
import type { AgentEvent } from '@/lib/types';
import { CIBACard, type CIBARequest } from './CIBACard';
import { Pagination } from './Pagination';

const PAGE_SIZE = 5;

interface FeedEntry {
  id: string; timestamp: string; type: string;
  agentName?: string; agentId?: string; action?: string;
  resource?: string; decision?: string; reason?: string; tokenTTL?: number;
}

interface Props { events: AgentEvent[]; isLoggedIn?: boolean; }

function DecisionBadge({ decision }: { decision?: string }) {
  if (!decision) return null;
  const map: Record<string, { bg: string; color: string }> = {
    ALLOWED:      { bg: 'var(--color-success-bg)',  color: 'var(--color-success-text)' },
    APPROVED_CIBA:{ bg: 'var(--color-success-bg)',  color: 'var(--color-success-text)' },
    DENIED:       { bg: 'var(--color-danger-bg)',   color: 'var(--color-danger-text)' },
    ESCALATED:    { bg: 'var(--color-warning-bg)',  color: 'var(--color-warning-text)' },
    REVOKED:      { bg: 'var(--color-danger-bg)',   color: 'var(--color-danger-text)' },
  };
  const icons: Record<string, string> = { ALLOWED:'✓', APPROVED_CIBA:'✓', DENIED:'✗', ESCALATED:'⚠', REVOKED:'⚡' };
  const s = map[decision] ?? { bg: 'var(--color-bg-sunken)', color: 'var(--color-text-medium)' };
  return (
    <span className="text-xs px-2 py-0.5 rounded font-semibold flex-shrink-0"
      style={{ background: s.bg, color: s.color }}>
      {icons[decision] ?? '·'} {decision}
    </span>
  );
}

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

  const typeLabel: Record<string, string> = {
    agent_registered: '🤖 Registered',  agent_revoked: '⚡ Revoked',
    auth_request: '🔒 Auth',            ciba_approved: '✓ CIBA Approved',
    ciba_denied: '✗ CIBA Denied',       ciba_expired: '⏱ CIBA Expired',
    token_issued: '🎫 Token',           revocation: '⚡ Revocation',
    panic_revocation: '🚨 PANIC',       audit_entry: '📋 Audit',
  };

  return (
    <div className="flex flex-col h-full gap-2 overflow-y-auto min-h-0">
      {Object.values(cibaRequests).map(req => (
        <CIBACard key={req.requestId} request={req} onRespond={handleCibaRespond} />
      ))}

      {feedEntries.length === 0 && Object.keys(cibaRequests).length === 0 ? (
        <div className="text-xs text-center py-8" style={{ color: 'var(--color-text-subtle)' }}>
          Waiting for events…
          {!isLoggedIn && <><br /><span>Click ▶ Run Demo to start</span></>}
        </div>
      ) : (
        pagedEntries.map(entry => (
          <div key={entry.id} className="feed-entry rounded p-3 border"
            style={{ background: 'var(--color-bg-page)', borderColor: 'var(--color-border)' }}>
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono" style={{ color: 'var(--color-text-subtle)' }}>
                    {new Date(entry.timestamp).toLocaleTimeString()}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--color-text-medium)' }}>
                    {typeLabel[entry.type] ?? entry.type}
                  </span>
                </div>
                {entry.agentName && (
                  <div className="text-sm mt-1 font-medium truncate" style={{ color: 'var(--color-text-high)' }}>
                    {entry.agentName}
                  </div>
                )}
                {entry.action && (
                  <div className="text-xs font-mono mt-0.5" style={{ color: 'var(--color-text-medium)' }}>{entry.action}</div>
                )}
                {entry.reason && entry.type !== 'audit_entry' && (
                  <div className="text-xs mt-1 truncate" style={{ color: 'var(--color-text-low)' }}>{entry.reason}</div>
                )}
                {entry.tokenTTL && (
                  <div className="text-xs mt-0.5 font-medium" style={{ color: 'var(--color-success-text)' }}>
                    Token TTL: {entry.tokenTTL}s
                  </div>
                )}
              </div>
              <DecisionBadge decision={entry.decision} />
            </div>
          </div>
        ))
      )}
      <Pagination page={page} totalPages={totalPages} onPage={setPage} />
    </div>
  );
}
