'use client';
import { useState, useEffect } from 'react';

export interface CIBARequest {
  requestId: string; agentId: string; agentName: string;
  action: string; resource: string; reason: string; expiresAt: string;
}

interface Props { request: CIBARequest; onRespond: (requestId: string, approved: boolean) => void; }

export function CIBACard({ request, onRespond }: Props) {
  const [secondsLeft, setSecondsLeft] = useState(() =>
    Math.max(0, Math.ceil((new Date(request.expiresAt).getTime() - Date.now()) / 1000))
  );
  const [responded, setResponded] = useState(false);

  useEffect(() => {
    if (responded || secondsLeft <= 0) return;
    const t = setInterval(() => setSecondsLeft(s => { if (s <= 1) { clearInterval(t); return 0; } return s - 1; }), 1000);
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
    <div className={`rounded border-2 p-3 transition-all ${!responded && !expired ? 'ciba-card' : ''}`}
      style={{
        background: responded || expired ? 'var(--color-bg-sunken)' : 'var(--color-warning-bg)',
        borderColor: responded || expired ? 'var(--color-border)' : 'var(--color-warning)',
        opacity: responded || expired ? 0.7 : 1,
      }}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <span style={{ color: 'var(--color-warning)' }}>⚠</span>
          <span className="text-xs font-semibold" style={{ color: 'var(--color-warning-text)' }}>Human Approval Required</span>
        </div>
        {!responded && !expired && (
          <span className="text-sm font-mono font-bold"
            style={{ color: secondsLeft <= 10 ? 'var(--color-danger)' : 'var(--color-warning-text)' }}>
            {secondsLeft}s
          </span>
        )}
        {expired && <span className="text-xs" style={{ color: 'var(--color-text-subtle)' }}>Expired</span>}
      </div>

      <div className="space-y-1 mb-3 text-xs">
        <div><span style={{ color: 'var(--color-text-low)' }}>Agent: </span>
          <span className="font-medium" style={{ color: 'var(--color-text-high)' }}>{request.agentName}</span></div>
        <div><span style={{ color: 'var(--color-text-low)' }}>Action: </span>
          <span className="font-mono" style={{ color: 'var(--color-text-high)' }}>{request.action}</span></div>
        <div><span style={{ color: 'var(--color-text-low)' }}>Resource: </span>
          <span style={{ color: 'var(--color-text-high)' }}>{request.resource}</span></div>
        <div className="italic" style={{ color: 'var(--color-text-medium)' }}>{request.reason}</div>
      </div>

      {!responded && !expired && (
        <div className="flex gap-2">
          <button onClick={() => handleRespond(true)}
            className="flex-1 text-white text-xs font-semibold py-1.5 rounded transition-opacity hover:opacity-90"
            style={{ background: 'var(--color-success)' }}>
            Approve
          </button>
          <button onClick={() => handleRespond(false)}
            className="flex-1 text-white text-xs font-semibold py-1.5 rounded transition-opacity hover:opacity-90"
            style={{ background: 'var(--color-danger)' }}>
            Deny
          </button>
        </div>
      )}
      {responded && <div className="text-xs text-center" style={{ color: 'var(--color-text-subtle)' }}>Responded</div>}
    </div>
  );
}
