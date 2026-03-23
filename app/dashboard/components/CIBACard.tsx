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
  const urgent = secondsLeft <= 10 && !responded && !expired;

  if (responded) {
    return (
      <div className="rounded-[10px] border border-[#e2e4ef] bg-[#f0f1f7] px-4 py-3 text-center text-xs text-[#9498b3]">
        Response recorded
      </div>
    );
  }

  if (expired) {
    return (
      <div className="rounded-[10px] border border-[#e2e4ef] bg-[#f0f1f7] px-4 py-3 text-center text-xs text-[#9498b3]">
        Request expired
      </div>
    );
  }

  return (
    <div className={`rounded-[12px] border-2 bg-[#fefce8] p-4 shadow-[0_4px_16px_rgba(0,0,0,.06)] transition-all ${urgent ? 'border-[#ef4444]' : 'border-[#f59e0b]'}`}>

      {/* Top row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-base">⚠️</span>
          <span className="text-sm font-bold text-[#1a1d2e]">Human Approval Required</span>
        </div>
        <span
          className={`font-[family-name:var(--font-ibm-plex-mono)] text-sm font-bold tabular-nums px-2 py-0.5 rounded-md ${
            urgent
              ? 'bg-[#fef2f2] text-[#ef4444]'
              : 'bg-[#fefce8] text-[#f59e0b]'
          }`}>
          {secondsLeft}s
        </span>
      </div>

      {/* Details */}
      <div className="space-y-1.5 mb-4 text-[13px]">
        <div className="flex items-center gap-1.5">
          <span className="text-[#9498b3] w-16 shrink-0">Agent</span>
          <span className="font-semibold text-[#1a1d2e]">{request.agentName}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[#9498b3] w-16 shrink-0">Action</span>
          <span className="font-[family-name:var(--font-ibm-plex-mono)] text-xs font-medium text-[#1a1d2e] bg-[#f0f1f7] px-2 py-0.5 rounded border border-[#e2e4ef]">
            {request.action}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[#9498b3] w-16 shrink-0">Resource</span>
          <span className="text-[#1a1d2e] font-medium">{request.resource}</span>
        </div>
        <p className="text-xs italic text-[#5c6078] mt-1 leading-relaxed">{request.reason}</p>
      </div>

      {/* Buttons */}
      <div className="flex gap-2.5">
        <button
          onClick={() => handleRespond(true)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-[8px] bg-[#12b76a] text-white text-sm font-bold hover:bg-[#0ea860] transition-colors shadow-[0_2px_8px_rgba(18,183,106,.3)]">
          ✓ Approve
        </button>
        <button
          onClick={() => handleRespond(false)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-[8px] bg-[#ef4444] text-white text-sm font-bold hover:bg-[#dc2626] transition-colors shadow-[0_2px_8px_rgba(239,68,68,.3)]">
          ✗ Deny
        </button>
      </div>
    </div>
  );
}
