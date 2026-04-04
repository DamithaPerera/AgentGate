'use client';
import { useState } from 'react';
import { CopyButton } from './CopyButton';

// ── Types ─────────────────────────────────────────────────────────────────────

export type HttpMethod = 'GET' | 'POST' | 'DELETE';

export type Endpoint = {
  method: HttpMethod;
  path: string;
  description: string;
  authRequired: boolean;
  authNote?: string;
  requestBody?: string;
  response: string;
  curl: string;
};

// ── Design tokens ─────────────────────────────────────────────────────────────

const METHOD = {
  GET:    { text: '#12b76a', accent: '#12b76a', bg: '#f0fdf4', tabBg: '#e7faf0' },
  POST:   { text: '#3b6cff', accent: '#3b6cff', bg: '#f0f4ff', tabBg: '#ebf0ff' },
  DELETE: { text: '#ef4444', accent: '#ef4444', bg: '#fff5f5', tabBg: '#fef2f2' },
} satisfies Record<HttpMethod, { text: string; accent: string; bg: string; tabBg: string }>;

// ── Sub-components ────────────────────────────────────────────────────────────

function MethodPill({ method }: { method: HttpMethod }) {
  const c = METHOD[method];
  return (
    <span
      className="inline-flex items-center px-2.5 py-[3px] rounded-[6px] text-[11px] font-bold tracking-[0.06em] shrink-0"
      style={{ background: `${c.accent}18`, color: c.text, fontFamily: 'IBM Plex Mono, monospace' }}
    >
      {method}
    </span>
  );
}

function AuthChip({ required, note }: { required: boolean; note?: string }) {
  if (!required) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-[3px] rounded-[6px] text-[11px] font-medium bg-[#f6f7fb] text-[#9498b3] border border-[#e2e4ef]">
        Public
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-[3px] rounded-[6px] text-[11px] font-semibold bg-[#ebf0ff] text-[#3b6cff] border border-[#3b6cff25]">
      🔒 {note ?? 'Bearer ag_live_...'}
    </span>
  );
}

function CodePane({ code, copyable }: { code: string; copyable?: boolean }) {
  return (
    <div className="relative group">
      {copyable && (
        <div className="absolute top-3 right-3 z-10">
          <CopyButton text={code} />
        </div>
      )}
      <pre
        className="m-0 overflow-x-auto text-[12.5px] leading-[1.8] rounded-[10px]"
        style={{
          background: '#0d1117',
          color: '#e6edf3',
          padding: '16px 20px',
          paddingRight: copyable ? '90px' : '20px',
          border: '1px solid #21262d',
          fontFamily: 'IBM Plex Mono, monospace',
        }}
      >
        <code>{code}</code>
      </pre>
    </div>
  );
}

// ── EndpointCard ──────────────────────────────────────────────────────────────

export function EndpointCard({ endpoint }: { endpoint: Endpoint }) {
  const c = METHOD[endpoint.method];

  const tabs = [
    ...(endpoint.requestBody ? [{ id: 'body', label: 'Body', icon: '📤' }] : []),
    { id: 'response', label: 'Response', icon: '📥' },
    { id: 'curl', label: 'cURL', icon: '⚡' },
  ];
  const [activeTab, setActiveTab] = useState(tabs[0].id);

  const codeMap: Record<string, string> = {
    body: endpoint.requestBody ?? '',
    response: endpoint.response,
    curl: endpoint.curl,
  };

  return (
    <div
      className="bg-white rounded-[14px] overflow-hidden"
      style={{
        borderLeft: `4px solid ${c.accent}`,
        border: `1px solid ${c.accent}22`,
        borderLeftWidth: 4,
        boxShadow: `0 1px 4px ${c.accent}0a, 0 4px 16px rgba(0,0,0,0.04)`,
      }}
    >
      {/* Header */}
      <div
        className="px-5 py-4"
        style={{ background: c.bg, borderBottom: `1px solid ${c.accent}18` }}
      >
        <div className="flex items-start justify-between gap-3 flex-wrap mb-2.5">
          <div className="flex items-center gap-2.5 flex-wrap">
            <MethodPill method={endpoint.method} />
            <code
              className="text-[14px] font-semibold text-[#1a1d2e]"
              style={{ fontFamily: 'IBM Plex Mono, monospace' }}
            >
              {endpoint.path}
            </code>
          </div>
          <AuthChip required={endpoint.authRequired} note={endpoint.authNote} />
        </div>
        <p className="m-0 text-[13px] text-[#5c6078] leading-[1.65]">
          {endpoint.description}
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-[#e2e4ef] bg-[#f6f7fb] px-1">
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-1.5 px-4 py-2.5 text-[12px] font-semibold bg-transparent border-0 cursor-pointer transition-colors shrink-0"
              style={{
                color: isActive ? c.text : '#9498b3',
                borderBottom: `2px solid ${isActive ? c.accent : 'transparent'}`,
                marginBottom: -1,
                fontFamily: 'IBM Plex Mono, monospace',
              }}
            >
              <span className="text-[11px]">{tab.icon}</span>
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Code pane */}
      <div className="p-5">
        <CodePane
          code={codeMap[activeTab] ?? ''}
          copyable
        />
      </div>
    </div>
  );
}
