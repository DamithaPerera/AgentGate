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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 6 }}>
      {Object.values(cibaRequests).map(req => (
        <CIBACard key={req.requestId} request={req} onRespond={handleCibaRespond} />
      ))}

      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 5, minHeight: 0 }}>
        {feedEntries.length === 0 && Object.keys(cibaRequests).length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 16px', color: '#475569', fontSize: 13 }}>
            Waiting for events…
            {!isLoggedIn && <><br /><span style={{ fontSize: 12 }}>Click ▶ Run Demo to start</span></>}
          </div>
        ) : pagedEntries.map(entry => {
          const typeInfo = TYPE_LABELS[entry.type] ?? { label: entry.type, bg: '#F8FAFC', color: '#374151' };
          const decisionStyle = entry.decision ? DECISION_STYLES[entry.decision] : null;
          return (
            <div key={entry.id} className="feed-entry" style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 10, padding: '10px 12px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 999, background: typeInfo.bg, color: typeInfo.color, fontWeight: 600, flexShrink: 0 }}>{typeInfo.label}</span>
                    <span style={{ fontSize: 10, color: '#94A3B8', fontFamily: 'monospace' }}>{new Date(entry.timestamp).toLocaleTimeString()}</span>
                  </div>
                  {entry.agentName && (
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#0F172A', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{entry.agentName}</div>
                  )}
                  {entry.action && (
                    <div style={{ fontSize: 11, color: '#64748B', fontFamily: 'monospace', marginBottom: 2 }}>{entry.action}</div>
                  )}
                  {entry.tokenTTL && (
                    <div style={{ fontSize: 11, color: '#16A34A', fontWeight: 600 }}>TTL: {entry.tokenTTL}s</div>
                  )}
                </div>
                {decisionStyle && (
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 999, background: decisionStyle.bg, color: decisionStyle.color, flexShrink: 0 }}>
                    {decisionStyle.icon} {entry.decision}
                  </span>
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
