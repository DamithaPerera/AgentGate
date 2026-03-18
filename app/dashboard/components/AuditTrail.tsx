'use client';
import { useState } from 'react';
import type { AuditEntry } from '@/lib/types';

interface Props {
  entries: AuditEntry[];
  onExport: () => void;
  onVerify: () => Promise<{ valid: boolean; message: string }>;
}

function DecisionDot({ decision }: { decision: string }) {
  const colors: Record<string, string> = {
    ALLOWED: 'bg-emerald-400',
    DENIED: 'bg-red-400',
    ESCALATED: 'bg-amber-400',
    REVOKED: 'bg-red-500',
    EXPIRED: 'bg-slate-500',
    REGISTERED: 'bg-blue-400',
    PENDING: 'bg-amber-400',
  };
  return <span className={`w-2 h-2 rounded-full flex-shrink-0 ${colors[decision] ?? 'bg-slate-500'}`} />;
}

export function AuditTrail({ entries, onExport, onVerify }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filter, setFilter] = useState('');
  const [verifyResult, setVerifyResult] = useState<{ valid: boolean; message: string } | null>(null);

  const filtered = entries.filter(e => {
    if (!filter) return true;
    const q = filter.toLowerCase();
    return (
      e.type.toLowerCase().includes(q) ||
      e.agentId.toLowerCase().includes(q) ||
      e.action.toLowerCase().includes(q) ||
      e.decision.toLowerCase().includes(q) ||
      e.reason.toLowerCase().includes(q)
    );
  });

  const handleVerify = async () => {
    const result = await onVerify();
    setVerifyResult(result);
    setTimeout(() => setVerifyResult(null), 5000);
  };

  return (
    <div className="flex flex-col h-full gap-3">
      {/* Toolbar */}
      <div className="flex gap-2 flex-shrink-0">
        <input
          type="text"
          placeholder="Filter entries..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="flex-1 bg-[#0a1520] border border-[#1e3a5f] rounded-lg px-3 py-1.5 text-sm text-slate-300 placeholder-slate-600 focus:outline-none focus:border-teal-700"
        />
        <button
          onClick={handleVerify}
          className="text-xs border border-[#1e3a5f] hover:border-teal-700 text-slate-400 hover:text-teal-400 px-3 py-1.5 rounded-lg transition-colors"
        >
          Verify
        </button>
        <button
          onClick={onExport}
          className="text-xs border border-[#1e3a5f] hover:border-teal-700 text-slate-400 hover:text-teal-400 px-3 py-1.5 rounded-lg transition-colors"
        >
          Export
        </button>
      </div>

      {/* Verify result banner */}
      {verifyResult && (
        <div className={`rounded-lg px-3 py-2 text-sm ${verifyResult.valid ? 'bg-emerald-900/40 text-emerald-300' : 'bg-red-900/40 text-red-300'}`}>
          {verifyResult.valid ? '✓' : '✗'} {verifyResult.message}
        </div>
      )}

      {/* Entries */}
      <div className="flex-1 overflow-y-auto space-y-1.5 min-h-0">
        {filtered.length === 0 ? (
          <div className="text-slate-500 text-sm text-center py-8">
            {filter ? 'No matching entries' : 'No audit entries yet'}
          </div>
        ) : (
          filtered.map((entry) => (
            <div
              key={entry.id}
              className="rounded-lg bg-[#0d1829] border border-[#1e3a5f] overflow-hidden"
            >
              <button
                className="w-full text-left p-3 hover:bg-[#0a1a2e] transition-colors"
                onClick={() => setExpanded(expanded === entry.id ? null : entry.id)}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-600 font-mono w-6 flex-shrink-0">#{entry.sequenceNumber}</span>
                  <DecisionDot decision={entry.decision} />
                  <span className="text-xs text-slate-400 font-mono flex-shrink-0">
                    {new Date(entry.timestamp).toLocaleTimeString()}
                  </span>
                  <span className="text-xs font-medium text-slate-300 truncate flex-1">
                    {entry.type}
                  </span>
                  <span className={`text-xs flex-shrink-0 ${entry.decision === 'ALLOWED' || entry.decision === 'REGISTERED' ? 'text-emerald-400' : entry.decision === 'DENIED' || entry.decision === 'REVOKED' ? 'text-red-400' : 'text-amber-400'}`}>
                    {entry.decision}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1 ml-8">
                  <span className="text-xs text-slate-500 font-mono truncate">{entry.action}</span>
                  {entry.resource && <span className="text-xs text-slate-600">→</span>}
                  <span className="text-xs text-slate-500 truncate">{entry.resource}</span>
                </div>
              </button>

              {expanded === entry.id && (
                <div className="px-3 pb-3 border-t border-[#1e3a5f] pt-2 space-y-2">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                    <div><span className="text-slate-500">Agent:</span> <span className="text-slate-300 font-mono">{entry.agentId}</span></div>
                    <div><span className="text-slate-500">Policy:</span> <span className="text-slate-300">{entry.policyId ?? '—'}</span></div>
                    <div><span className="text-slate-500">User:</span> <span className="text-slate-300 font-mono">{entry.userId}</span></div>
                    {entry.tokenTTL && <div><span className="text-slate-500">TTL:</span> <span className="text-emerald-400">{entry.tokenTTL}s</span></div>}
                  </div>
                  <div className="text-xs text-slate-400 italic">{entry.reason}</div>
                  {entry.tokenScopes && (
                    <div className="flex gap-1 flex-wrap">
                      {entry.tokenScopes.map(s => (
                        <span key={s} className="text-xs bg-teal-900/40 text-teal-400 px-2 py-0.5 rounded">{s}</span>
                      ))}
                    </div>
                  )}
                  <div className="pt-1 border-t border-[#1e3a5f]">
                    <div className="text-xs text-slate-600 break-all font-mono">
                      hash: {entry.hash.substring(0, 16)}...
                    </div>
                    <div className="text-xs text-slate-700 break-all font-mono">
                      prev: {entry.previousHash.substring(0, 16)}...
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
