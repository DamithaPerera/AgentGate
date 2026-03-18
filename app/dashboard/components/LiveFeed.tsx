'use client';
import { useState, useCallback } from 'react';
import type { AgentEvent } from '@/lib/types';
import { CIBACard, type CIBARequest } from './CIBACard';

interface FeedEntry {
  id: string;
  timestamp: string;
  type: string;
  agentName?: string;
  agentId?: string;
  action?: string;
  resource?: string;
  decision?: string;
  reason?: string;
  tokenTTL?: number;
}

interface Props {
  events: AgentEvent[];
}

function DecisionBadge({ decision }: { decision?: string }) {
  if (!decision) return null;
  const styles: Record<string, string> = {
    ALLOWED: 'bg-emerald-900/60 text-emerald-300 border-emerald-700/50',
    APPROVED_CIBA: 'bg-emerald-900/60 text-emerald-300 border-emerald-700/50',
    DENIED: 'bg-red-900/60 text-red-300 border-red-700/50',
    ESCALATED: 'bg-amber-900/60 text-amber-300 border-amber-700/50',
    REVOKED: 'bg-red-900/60 text-red-300 border-red-700/50',
  };
  const icons: Record<string, string> = {
    ALLOWED: '✓',
    APPROVED_CIBA: '✓',
    DENIED: '✗',
    ESCALATED: '⚠',
    REVOKED: '⚡',
  };
  const style = styles[decision] ?? 'bg-slate-800 text-slate-300 border-slate-700';
  return (
    <span className={`text-xs px-2 py-0.5 rounded border font-medium ${style}`}>
      {icons[decision] ?? '?'} {decision}
    </span>
  );
}

export function LiveFeed({ events }: Props) {
  const [cibaRequests, setCibaRequests] = useState<Record<string, CIBARequest>>({});

  const handleCibaRespond = useCallback((requestId: string) => {
    setCibaRequests(prev => {
      const next = { ...prev };
      delete next[requestId];
      return next;
    });
  }, []);

  // Process events to extract CIBA requests
  const activeCibaIds = new Set<string>();
  for (const event of events) {
    if (event.type === 'ciba_request') {
      const d = event.data as unknown as CIBARequest;
      activeCibaIds.add(d.requestId);
      if (!cibaRequests[d.requestId]) {
        setCibaRequests(prev => ({ ...prev, [d.requestId]: d }));
      }
    }
  }

  // Convert events to feed entries
  const feedEntries: FeedEntry[] = events
    .filter(e => e.type !== 'ciba_request') // shown as cards
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
    .slice(0, 50);

  const typeLabel: Record<string, string> = {
    agent_registered: '🤖 Registered',
    agent_revoked: '⚡ Revoked',
    auth_request: '🔒 Auth',
    ciba_approved: '✓ CIBA Approved',
    ciba_denied: '✗ CIBA Denied',
    ciba_expired: '⏱ CIBA Expired',
    token_issued: '🎫 Token',
    revocation: '⚡ Revocation',
    panic_revocation: '🚨 PANIC',
    audit_entry: '📋 Audit',
  };

  return (
    <div className="flex flex-col h-full gap-3 overflow-y-auto min-h-0">
      {/* Active CIBA cards */}
      {Object.values(cibaRequests).map(req => (
        <CIBACard key={req.requestId} request={req} onRespond={handleCibaRespond} />
      ))}

      {/* Feed entries */}
      {feedEntries.length === 0 && Object.keys(cibaRequests).length === 0 ? (
        <div className="text-slate-500 text-sm text-center py-8">
          Waiting for events...
          <br />
          <span className="text-xs">Click &quot;Run Demo&quot; to start</span>
        </div>
      ) : (
        feedEntries.map(entry => (
          <div
            key={entry.id}
            className="feed-entry rounded-lg bg-[#0d1829] border border-[#1e3a5f] p-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-slate-500 font-mono">
                    {new Date(entry.timestamp).toLocaleTimeString()}
                  </span>
                  <span className="text-xs text-slate-400">
                    {typeLabel[entry.type] ?? entry.type}
                  </span>
                </div>
                {entry.agentName && (
                  <div className="text-sm mt-1 font-medium truncate">{entry.agentName}</div>
                )}
                {entry.action && (
                  <div className="text-xs text-slate-400 font-mono mt-0.5">{entry.action}</div>
                )}
                {entry.reason && entry.type !== 'audit_entry' && (
                  <div className="text-xs text-slate-500 mt-1 truncate">{entry.reason}</div>
                )}
                {entry.tokenTTL && (
                  <div className="text-xs text-teal-500 mt-0.5">Token TTL: {entry.tokenTTL}s</div>
                )}
              </div>
              <DecisionBadge decision={entry.decision} />
            </div>
          </div>
        ))
      )}
    </div>
  );
}
