'use client';
import { useState, useEffect } from 'react';

export interface CIBARequest {
  requestId: string;
  agentId: string;
  agentName: string;
  action: string;
  resource: string;
  reason: string;
  expiresAt: string;
}

interface Props {
  request: CIBARequest;
  onRespond: (requestId: string, approved: boolean) => void;
}

export function CIBACard({ request, onRespond }: Props) {
  const [secondsLeft, setSecondsLeft] = useState(() => {
    const ms = new Date(request.expiresAt).getTime() - Date.now();
    return Math.max(0, Math.ceil(ms / 1000));
  });
  const [responded, setResponded] = useState(false);

  useEffect(() => {
    if (responded || secondsLeft <= 0) return;
    const t = setInterval(() => {
      setSecondsLeft(s => {
        if (s <= 1) { clearInterval(t); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [responded, secondsLeft]);

  const handleRespond = async (approved: boolean) => {
    setResponded(true);
    await fetch('/api/consent/respond', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId: request.requestId, approved }),
    });
    onRespond(request.requestId, approved);
  };

  const expired = secondsLeft <= 0 && !responded;

  return (
    <div className={`rounded-lg border-2 p-4 transition-all ${
      responded ? 'border-slate-700 opacity-60' :
      expired ? 'border-slate-700 opacity-50' :
      'ciba-card border-amber-500'
    }`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-amber-400">⚠</span>
          <span className="text-sm font-semibold text-amber-300">Human Approval Required</span>
        </div>
        {!responded && !expired && (
          <span className={`text-sm font-mono font-bold ${secondsLeft <= 10 ? 'text-red-400' : 'text-amber-400'}`}>
            {secondsLeft}s
          </span>
        )}
        {expired && <span className="text-xs text-slate-500">Expired</span>}
      </div>

      <div className="space-y-1.5 mb-3">
        <div className="text-sm">
          <span className="text-slate-400">Agent: </span>
          <span className="text-slate-200 font-medium">{request.agentName}</span>
        </div>
        <div className="text-sm">
          <span className="text-slate-400">Action: </span>
          <span className="text-slate-200 font-mono">{request.action}</span>
        </div>
        <div className="text-sm">
          <span className="text-slate-400">Resource: </span>
          <span className="text-slate-200">{request.resource}</span>
        </div>
        <div className="text-xs text-slate-500 italic">{request.reason}</div>
      </div>

      {!responded && !expired && (
        <div className="flex gap-2">
          <button
            onClick={() => handleRespond(true)}
            className="flex-1 bg-emerald-700 hover:bg-emerald-600 text-white text-sm py-2 rounded-lg font-medium transition-colors"
          >
            Approve
          </button>
          <button
            onClick={() => handleRespond(false)}
            className="flex-1 bg-red-800 hover:bg-red-700 text-white text-sm py-2 rounded-lg font-medium transition-colors"
          >
            Deny
          </button>
        </div>
      )}

      {responded && (
        <div className="text-center text-sm text-slate-400">Responded</div>
      )}
    </div>
  );
}
