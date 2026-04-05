import Link from 'next/link';
import { CopyButton } from './CopyButton';
import { DocsSidebar } from './DocsSidebar';
import { EndpointCard } from './EndpointCard';
import type { Endpoint } from './EndpointCard';
import { ScrollToTop } from '../ScrollToTop';

// ── Section data ───────────────────────────────────────────────────────────────

type Section = { id: string; title: string; icon: string; endpoints: Endpoint[] };

const sections: Section[] = [
  {
    id: 'agents',
    title: 'Agents',
    icon: '🤖',
    endpoints: [
      {
        method: 'POST',
        path: '/api/agents/register',
        description: 'Register a new agent. Returns the agent record and a signed JWT for the agent to use in subsequent authorization requests.',
        authRequired: true,
        requestBody: `{
  "name": "My Research Agent",
  "framework": "crewai",
  "capabilities": ["github.read", "gmail.send"],
  "trustLevel": 2
}`,
        response: `{
  "agent": {
    "id": "agt_7x3k...",
    "spiffeId": "spiffe://agentgate/agt_7x3k...",
    "name": "My Research Agent",
    "framework": "crewai",
    "capabilities": ["github.read", "gmail.send"],
    "trustLevel": 2,
    "status": "active",
    "registeredAt": "2025-04-01T12:00:00Z"
  },
  "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
}`,
        curl: `curl -X POST https://agent-gate-theta.vercel.app/api/agents/register \\
  -H "Authorization: Bearer ag_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{"name":"My Research Agent","framework":"crewai","capabilities":["github.read"],"trustLevel":2}'`,
      },
      {
        method: 'GET',
        path: '/api/agents',
        description: 'List all registered agents including their status, trust level, and last activity.',
        authRequired: true,
        response: `{
  "agents": [
    {
      "id": "agt_7x3k...",
      "name": "My Research Agent",
      "framework": "crewai",
      "status": "active",
      "trustLevel": 2,
      "lastActivity": "2025-04-01T12:05:00Z"
    }
  ]
}`,
        curl: `curl https://agent-gate-theta.vercel.app/api/agents \\
  -H "Authorization: Bearer ag_live_..."`,
      },
      {
        method: 'POST',
        path: '/api/revoke/agent',
        description: 'Revoke a specific agent. Triggers cascade revocation — all downstream tokens for this agent are destroyed.',
        authRequired: true,
        requestBody: `{ "agentId": "agt_7x3k..." }`,
        response: `{ "success": true, "revokedTokens": 3, "agentId": "agt_7x3k..." }`,
        curl: `curl -X POST https://agent-gate-theta.vercel.app/api/revoke/agent \\
  -H "Authorization: Bearer ag_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{"agentId":"agt_7x3k..."}'`,
      },
      {
        method: 'POST',
        path: '/api/revoke/service',
        description: 'Revoke all agents that have capabilities for a given service (e.g. "github", "gmail").',
        authRequired: true,
        requestBody: `{ "service": "github" }`,
        response: `{ "success": true, "revokedAgents": 2, "service": "github" }`,
        curl: `curl -X POST https://agent-gate-theta.vercel.app/api/revoke/service \\
  -H "Authorization: Bearer ag_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{"service":"github"}'`,
      },
      {
        method: 'POST',
        path: '/api/revoke/panic',
        description: 'Emergency: revoke ALL active agents immediately. Use with caution — this destroys every active agent token.',
        authRequired: true,
        response: `{ "success": true, "revokedAgents": 7, "revokedTokens": 24 }`,
        curl: `curl -X POST https://agent-gate-theta.vercel.app/api/revoke/panic \\
  -H "Authorization: Bearer ag_live_..."`,
      },
    ],
  },
  {
    id: 'authorization',
    title: 'Authorization',
    icon: '⚡',
    endpoints: [
      {
        method: 'POST',
        path: '/api/authorize',
        description: 'Request authorization for an agent action. The agent presents its JWT (from /api/agents/register), and AgentGate evaluates through all 5 gates: Identity → Intent → Policy → Consent → Token.',
        authRequired: false,
        authNote: 'Agent JWT (from register), not an API key.',
        requestBody: `{
  "agentToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "action": {
    "type": "write",
    "operation": "send_email",
    "service": "gmail"
  },
  "resource": { "type": "email" },
  "context": { "recipientExternal": false }
}`,
        response: `{
  "allowed": true,
  "decision": "ALLOWED",
  "token": { "token": "eyJ...", "scopes": ["gmail.write"], "ttl": 60 },
  "reason": "Auto-approved: Allow reads by trusted agents",
  "gates": {
    "identity": "pass",
    "intent": "parsed",
    "policy": "ALLOW",
    "consent": "skipped",
    "token": "issued"
  }
}`,
        curl: `curl -X POST https://agent-gate-theta.vercel.app/api/authorize \\
  -H "Content-Type: application/json" \\
  -d '{"agentToken":"eyJ...","action":{"type":"read","operation":"list_emails","service":"gmail"},"resource":{"type":"email"}}'`,
      },
    ],
  },
  {
    id: 'audit',
    title: 'Audit',
    icon: '🔗',
    endpoints: [
      {
        method: 'GET',
        path: '/api/audit',
        description: 'Retrieve audit log entries with pagination. Each entry includes a SHA-256 hash linking to the previous entry — forming a tamper-evident chain.',
        authRequired: true,
        response: `{
  "entries": [
    {
      "id": "aud_x9k...",
      "timestamp": "2025-04-01T12:05:00Z",
      "sequenceNumber": 42,
      "type": "TOKEN_ISSUED",
      "agentId": "agt_7x3k...",
      "action": "gmail.write:send_email",
      "resource": "email",
      "decision": "ALLOWED",
      "hash": "a3f9c2...",
      "previousHash": "7b2d14..."
    }
  ]
}`,
        curl: `curl "https://agent-gate-theta.vercel.app/api/audit?limit=50&offset=0" \\
  -H "Authorization: Bearer ag_live_..."`,
      },
      {
        method: 'POST',
        path: '/api/audit/verify',
        description: "Verify the integrity of the audit hash chain. Checks every entry's hash against the previous entry to detect tampering.",
        authRequired: true,
        response: `{
  "valid": true,
  "entriesChecked": 42,
  "firstEntry": "aud_001...",
  "lastEntry": "aud_042..."
}`,
        curl: `curl -X POST https://agent-gate-theta.vercel.app/api/audit/verify \\
  -H "Authorization: Bearer ag_live_..."`,
      },
      {
        method: 'GET',
        path: '/api/audit/export',
        description: 'Export the full audit log as a JSON file download.',
        authRequired: true,
        response: `// Returns: application/json file download
// Content-Disposition: attachment; filename="audit-export-2025-04-01.json"
[{ "id": "aud_x9k...", "timestamp": "...", ... }]`,
        curl: `curl "https://agent-gate-theta.vercel.app/api/audit/export" \\
  -H "Authorization: Bearer ag_live_..." \\
  -o audit-export.json`,
      },
    ],
  },
  {
    id: 'policy',
    title: 'Policy',
    icon: '⚙️',
    endpoints: [
      {
        method: 'GET',
        path: '/api/policy/rules',
        description: 'Get all policy rules. Rules are evaluated in priority order: DENY → ESCALATE → ALLOW. First matching rule wins.',
        authRequired: false,
        response: `{
  "rules": [
    {
      "id": "allow-read-trusted",
      "name": "Allow reads by trusted agents",
      "condition": { "actionTypes": ["read"], "minTrustLevel": 2 },
      "decision": "ALLOW",
      "enabled": true
    }
  ]
}`,
        curl: `curl https://agent-gate-theta.vercel.app/api/policy/rules`,
      },
      {
        method: 'POST',
        path: '/api/policy/rules',
        description: 'Save (replace) all policy rules. Sends the complete array.',
        authRequired: true,
        requestBody: `{
  "rules": [
    {
      "id": "my-rule",
      "name": "Block all deletes",
      "description": "Deny all delete operations",
      "condition": { "actionTypes": ["delete"] },
      "decision": "DENY",
      "enabled": true
    }
  ]
}`,
        response: `{ "success": true, "count": 1 }`,
        curl: `curl -X POST https://agent-gate-theta.vercel.app/api/policy/rules \\
  -H "Authorization: Bearer ag_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{"rules":[...]}'`,
      },
    ],
  },
  {
    id: 'keys',
    title: 'API Keys',
    icon: '🔑',
    endpoints: [
      {
        method: 'GET',
        path: '/api/keys',
        description: 'List your API keys. Returns display-safe fields only — the raw key is never returned after creation.',
        authRequired: true,
        authNote: 'Session cookie required.',
        response: `{
  "keys": [
    {
      "id": "key_abc123...",
      "name": "Production Agent",
      "keyPrefix": "ag_live_ABCD...",
      "createdAt": "2025-04-01T10:00:00Z",
      "lastUsedAt": "2025-04-01T12:05:00Z",
      "isActive": true
    }
  ]
}`,
        curl: `curl https://agent-gate-theta.vercel.app/api/keys \\
  -H "Cookie: appSession=..."`,
      },
      {
        method: 'POST',
        path: '/api/keys',
        description: 'Generate a new API key. The raw key is returned exactly once — store it securely.',
        authRequired: true,
        authNote: 'Session cookie required.',
        requestBody: `{ "name": "Production Agent" }`,
        response: `{
  "id": "key_abc123...",
  "name": "Production Agent",
  "key": "ag_live_ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefgh",
  "keyPrefix": "ag_live_ABCD..."
}`,
        curl: `curl -X POST https://agent-gate-theta.vercel.app/api/keys \\
  -H "Cookie: appSession=..." \\
  -H "Content-Type: application/json" \\
  -d '{"name":"Production Agent"}'`,
      },
      {
        method: 'DELETE',
        path: '/api/keys/[id]',
        description: 'Revoke an API key immediately. Future requests using it return 401.',
        authRequired: true,
        authNote: 'Session required. You can only revoke your own keys.',
        response: `{ "success": true }`,
        curl: `curl -X DELETE https://agent-gate-theta.vercel.app/api/keys/key_abc123... \\
  -H "Cookie: appSession=..."`,
      },
    ],
  },
];

// ── Server-only components ─────────────────────────────────────────────────────

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white border border-[#e2e4ef] rounded-[14px] overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.04)] ${className}`}>
      {children}
    </div>
  );
}

function InfoCard({
  variant,
  icon,
  children,
}: {
  variant: 'blue' | 'purple' | 'yellow' | 'green';
  icon?: string;
  children: React.ReactNode;
}) {
  const styles = {
    blue:   'bg-[#ebf0ff] border-[#3b6cff22] text-[#1e40af]',
    purple: 'bg-[#f3f0ff] border-[#8b5cf622] text-[#5b21b6]',
    yellow: 'bg-[#fffbeb] border-[#fde04730] text-[#92400e]',
    green:  'bg-[#e7faf0] border-[#12b76a22] text-[#065f46]',
  };
  return (
    <div className={`border rounded-[12px] p-4 text-[13px] leading-relaxed flex gap-3 ${styles[variant]}`}>
      {icon && <span className="text-[18px] shrink-0 mt-0.5">{icon}</span>}
      <div>{children}</div>
    </div>
  );
}

function SectionHeading({
  id,
  icon,
  badge,
  children,
}: {
  id: string;
  icon?: string;
  badge?: string | number;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 mb-6">
      {icon && (
        <div className="w-9 h-9 rounded-[10px] bg-[#f0f1f7] flex items-center justify-center text-[18px] shrink-0 border border-[#e2e4ef]">
          {icon}
        </div>
      )}
      <div className="flex items-center gap-2.5 flex-wrap">
        <h2 id={id} className="text-[20px] font-extrabold text-[#1a1d2e] tracking-[-0.01em] m-0 leading-tight">
          {children}
        </h2>
        {badge !== undefined && (
          <span
            className="text-[10px] font-bold px-2 py-[3px] rounded-full"
            style={{
              background: '#f0f1f7',
              color: '#9498b3',
              fontFamily: 'IBM Plex Mono, monospace',
              border: '1px solid #e2e4ef',
            }}
          >
            {badge} endpoint{Number(badge) !== 1 ? 's' : ''}
          </span>
        )}
      </div>
    </div>
  );
}

// ── Divider ────────────────────────────────────────────────────────────────────

function SectionDivider() {
  return <div className="border-t border-[#e2e4ef] mb-10" />;
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DocsPage() {
  const BASE_URL = 'https://agent-gate-theta.vercel.app';

  const gates = [
    { label: 'Identity', color: '#3b6cff', bg: '#ebf0ff' },
    { label: 'Intent',   color: '#8b5cf6', bg: '#f3f0ff' },
    { label: 'Policy',   color: '#f97316', bg: '#fff7ed' },
    { label: 'Consent',  color: '#f59e0b', bg: '#fffbeb' },
    { label: 'Token',    color: '#12b76a', bg: '#e7faf0' },
  ];

  return (
    <main
      className="min-h-screen bg-[#f6f7fb]"
      style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}
    >
      {/* ── Nav ───────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-[#e2e4ef]">
        <div className="max-w-[1300px] mx-auto px-4 md:px-6 h-[60px] flex items-center justify-between gap-3">

          {/* Left */}
          <div className="flex items-center gap-2.5">
            <Link href="/" className="flex items-center gap-2 no-underline">
              <div
                className="w-8 h-8 rounded-[8px] flex items-center justify-center text-white text-[11px] font-extrabold shrink-0"
                style={{
                  background: 'linear-gradient(135deg, #3b6cff, #8b5cf6)',
                  fontFamily: 'IBM Plex Mono, monospace',
                  boxShadow: '0 2px 8px rgba(59,108,255,0.28)',
                }}
              >AG</div>
              <span className="font-bold text-[15px] text-[#1a1d2e]">AgentGate</span>
            </Link>
            <div className="w-px h-[18px] bg-[#e2e4ef]" />
            <span className="text-[13px] text-[#9498b3] font-medium hidden sm:inline">API Reference</span>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2">
            <a
              href="https://github.com/DamithaPerera/AgentGate"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3 py-[6px] rounded-[8px] text-[13px] font-medium text-[#5c6078] no-underline border border-[#e2e4ef] bg-white hover:bg-[#f6f7fb] transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
              </svg>
              GitHub
            </a>
            <Link
              href="/dashboard"
              className="px-4 py-[7px] rounded-[8px] text-white font-semibold text-[13px] no-underline"
              style={{ background: 'linear-gradient(135deg, #3b6cff, #6b8fff)', boxShadow: '0 2px 8px rgba(59,108,255,0.25)' }}
            >
              Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Layout ────────────────────────────────────────────────────── */}
      <div className="max-w-[1300px] mx-auto flex px-0 md:px-6">

        {/* Sidebar */}
        <DocsSidebar />

        {/* Content */}
        <div className="flex-1 min-w-0 py-8 md:py-12 pb-24 px-4 md:pl-10 md:pr-0 md:border-l border-[#e2e4ef]">

          {/* ── Introduction ──────────────────────────────────────────── */}
          <section id="introduction" className="mb-14">

            {/* Version badge */}
            <div className="inline-flex items-center gap-2 bg-[#ebf0ff] border border-[#3b6cff22] rounded-full px-3.5 py-[5px] mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3b6cff] inline-block" />
              <span className="text-[#3b6cff] text-[12px] font-semibold" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>
                REST API · v1
              </span>
            </div>

            <h1 className="text-[30px] md:text-[36px] font-extrabold text-[#1a1d2e] mb-3.5 tracking-[-0.02em] leading-tight">
              AgentGate API Reference
            </h1>
            <p className="text-[15px] text-[#5c6078] leading-[1.75] max-w-[640px] mb-6">
              Register AI agents, evaluate authorization requests through a 5-gate pipeline,
              inspect a tamper-evident audit trail, and programmatically revoke access — all from your own code.
            </p>

            {/* Base URL */}
            <div
              className="rounded-[12px] mb-6 flex items-center justify-between gap-4 px-5 py-4"
              style={{ background: '#0d1117', border: '1px solid #21262d' }}
            >
              <div>
                <span
                  className="text-[10px] font-bold text-[#6e7681] uppercase tracking-[0.1em] block mb-1"
                  style={{ fontFamily: 'IBM Plex Mono, monospace' }}
                >
                  Base URL
                </span>
                <code
                  className="text-[14px] font-semibold"
                  style={{ color: '#58a6ff', fontFamily: 'IBM Plex Mono, monospace' }}
                >
                  {BASE_URL}
                </code>
              </div>
              <CopyButton text={BASE_URL} />
            </div>

            {/* 5-gate pipeline */}
            <div className="mb-6">
              <p className="text-[12px] font-bold text-[#9498b3] uppercase tracking-[0.08em] mb-3" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>
                Authorization Pipeline
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                {gates.map((gate, i) => (
                  <div key={gate.label} className="flex items-center gap-2">
                    <span
                      className="inline-flex items-center px-3 py-1.5 rounded-[8px] text-[12px] font-semibold"
                      style={{ background: gate.bg, color: gate.color, border: `1px solid ${gate.color}22` }}
                    >
                      {gate.label}
                    </span>
                    {i < gates.length - 1 && (
                      <span className="text-[#d0d3e2] text-[14px]">→</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Feature chips */}
            <div className="flex gap-2 flex-wrap">
              {['JSON responses', 'Bearer token auth', 'HTTPS only', 'SHA-256 audit chain', 'SPIFFE IDs'].map(b => (
                <span
                  key={b}
                  className="bg-white border border-[#e2e4ef] rounded-full px-3 py-[5px] text-[12px] font-medium text-[#5c6078]"
                >
                  {b}
                </span>
              ))}
            </div>
          </section>

          <SectionDivider />

          {/* ── TypeScript SDK ────────────────────────────────────────── */}
          <section id="sdk" className="mb-14">
            <SectionHeading id="sdk-heading" icon="📦">TypeScript SDK</SectionHeading>
            <p className="text-[14px] text-[#5c6078] leading-[1.75] mb-5">
              The official SDK wraps the REST API — one import, one call. Full TypeScript types included, zero runtime dependencies.
            </p>

            {/* Install */}
            <div
              className="rounded-[12px] mb-5 flex items-center justify-between gap-4 px-5 py-4"
              style={{ background: '#0d1117', border: '1px solid #21262d' }}
            >
              <code className="text-[14px]" style={{ color: '#86efac', fontFamily: 'IBM Plex Mono, monospace' }}>
                npm install @damitha-perera/agentgate
              </code>
              <CopyButton text="npm install @damitha-perera/agentgate" />
            </div>

            {/* Quick start */}
            <Card className="mb-5">
              <div className="px-5 py-3.5 border-b border-[#e2e4ef] bg-[#f6f7fb] flex items-center justify-between">
                <span className="text-[12px] font-bold text-[#5c6078] uppercase tracking-[0.06em]" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>
                  Quick Start
                </span>
                <span className="text-[11px] font-medium text-[#9498b3] bg-[#ebf0ff] text-[#3b6cff] px-2 py-0.5 rounded-[6px]" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>
                  TypeScript
                </span>
              </div>
              <div className="p-5">
                <div className="relative">
                  <div className="absolute top-3 right-3 z-10">
                    <CopyButton text={`import { AgentGate } from '@damitha-perera/agentgate';

const gate = new AgentGate({
  baseUrl: '${BASE_URL}',
  apiKey: process.env.AGENTGATE_API_KEY!,
});

// 1. Register your agent once — store the token
const agent = await gate.register({
  name: 'my-crewai-agent',
  framework: 'crewai',
  capabilities: ['gmail.read', 'github.write'],
  trustLevel: 1,
});

// 2. Authorize before every action
const result = await gate.authorize({
  agentToken: agent.token,
  action: { type: 'read', operation: 'list_emails', service: 'gmail' },
  resource: { type: 'email' },
  context: { recipientExternal: false },
});

if (!result.allowed) throw new Error(result.reason);
console.log(result.decision); // 'ALLOWED' | 'DENIED' | 'ESCALATED'`} />
                  </div>
                  <pre
                    className="m-0 overflow-x-auto text-[12.5px] leading-[1.8] rounded-[10px]"
                    style={{
                      background: '#0d1117',
                      color: '#e6edf3',
                      padding: '16px 20px',
                      paddingRight: 90,
                      border: '1px solid #21262d',
                      fontFamily: 'IBM Plex Mono, monospace',
                    }}
                  >{`import { AgentGate } from '@damitha-perera/agentgate';

const gate = new AgentGate({
  baseUrl: '${BASE_URL}',
  apiKey: process.env.AGENTGATE_API_KEY!,
});

// 1. Register your agent once — store the token
const agent = await gate.register({
  name: 'my-crewai-agent',
  framework: 'crewai',
  capabilities: ['gmail.read', 'github.write'],
  trustLevel: 1,
});

// 2. Authorize before every action
const result = await gate.authorize({
  agentToken: agent.token,
  action: { type: 'read', operation: 'list_emails', service: 'gmail' },
  resource: { type: 'email' },
  context: { recipientExternal: false },
});

if (!result.allowed) throw new Error(result.reason);
console.log(result.decision); // 'ALLOWED' | 'DENIED' | 'ESCALATED'`}</pre>
                </div>
              </div>
            </Card>

            {/* SDK methods */}
            <Card className="mb-5">
              <div className="px-5 py-3.5 border-b border-[#e2e4ef] bg-[#f6f7fb]">
                <span className="text-[12px] font-bold text-[#5c6078] uppercase tracking-[0.06em]" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>
                  SDK Methods
                </span>
              </div>
              <div className="divide-y divide-[#f0f1f7]">
                {[
                  { method: 'gate.register(opts)',    returns: 'Promise<RegisteredAgent>',  desc: 'Register a new agent, get identity token' },
                  { method: 'gate.authorize(opts)',   returns: 'Promise<AuthorizeResult>',  desc: 'Run the 5-gate pipeline, get decision + scoped token' },
                  { method: 'gate.revokeAgent(id)',   returns: 'Promise<RevokeResult>',     desc: 'Revoke a specific agent by ID' },
                  { method: 'gate.revokeService(svc)',returns: 'Promise<RevokeResult>',     desc: 'Revoke all agents for a service' },
                  { method: 'gate.panic()',            returns: 'Promise<RevokeResult>',     desc: 'Emergency — revoke all agents immediately' },
                ].map(row => (
                  <div key={row.method} className="px-5 py-3 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                    <code className="text-[12px] text-[#3b6cff] shrink-0 whitespace-nowrap" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>{row.method}</code>
                    <code className="text-[11px] text-[#9498b3] shrink-0 hidden md:block" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>{row.returns}</code>
                    <span className="text-[13px] text-[#5c6078]">{row.desc}</span>
                  </div>
                ))}
              </div>
            </Card>

            <InfoCard variant="blue" icon="📦">
              <strong className="text-[#1e40af]">npm:</strong>{' '}
              <a
                href="https://www.npmjs.com/package/@damitha-perera/agentgate"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold underline"
                style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 12 }}
              >
                @damitha-perera/agentgate
              </a>
              {' '}— TypeScript types included, zero runtime dependencies, ESM + CJS.
            </InfoCard>
          </section>

          <SectionDivider />

          {/* ── Authentication ────────────────────────────────────────── */}
          <section id="authentication" className="mb-14">
            <SectionHeading id="auth-heading" icon="🔐">Authentication</SectionHeading>
            <p className="text-[14px] text-[#5c6078] leading-[1.75] mb-5">
              Most endpoints require authentication. AgentGate supports two methods:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
              {/* API Key */}
              <div className="bg-white border border-[#e2e4ef] rounded-[12px] p-5">
                <div className="flex items-center gap-2.5 mb-3">
                  <span className="text-[11px] font-bold px-2.5 py-[3px] rounded-[6px] bg-[#ebf0ff] text-[#3b6cff]" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>
                    API KEY
                  </span>
                  <span className="text-[14px] font-semibold text-[#1a1d2e]">For agents &amp; automation</span>
                </div>
                <p className="text-[13px] text-[#5c6078] mb-3 leading-relaxed">
                  Generate an API key from the{' '}
                  <Link href="/dashboard" className="text-[#3b6cff] underline">dashboard</Link> and include it in every request:
                </p>
                <pre
                  className="m-0 overflow-x-auto text-[11.5px] rounded-[8px] p-3"
                  style={{ background: '#0d1117', color: '#58a6ff', border: '1px solid #21262d', fontFamily: 'IBM Plex Mono, monospace' }}
                >
                  {`Authorization: Bearer ag_live_...`}
                </pre>
              </div>

              {/* Session */}
              <div className="bg-white border border-[#e2e4ef] rounded-[12px] p-5">
                <div className="flex items-center gap-2.5 mb-3">
                  <span className="text-[11px] font-bold px-2.5 py-[3px] rounded-[6px] bg-[#f3f0ff] text-[#8b5cf6]" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>
                    SESSION
                  </span>
                  <span className="text-[14px] font-semibold text-[#1a1d2e]">For the dashboard</span>
                </div>
                <p className="text-[13px] text-[#5c6078] mb-3 leading-relaxed">
                  Log in via{' '}
                  <Link href="/auth/login" className="text-[#3b6cff] underline">Auth0</Link>.
                  The session cookie is automatically sent by the browser from the dashboard UI.
                </p>
                <pre
                  className="m-0 overflow-x-auto text-[11.5px] rounded-[8px] p-3"
                  style={{ background: '#0d1117', color: '#a5b4fc', border: '1px solid #21262d', fontFamily: 'IBM Plex Mono, monospace' }}
                >
                  {`Cookie: appSession=...`}
                </pre>
              </div>
            </div>

            <InfoCard variant="yellow" icon="⚠️">
              <strong>Important:</strong> API keys are shown exactly once at creation. Store them securely — they cannot be recovered.
              Revoke compromised keys immediately from the{' '}
              <Link href="/dashboard" className="underline font-medium">dashboard</Link>.
            </InfoCard>
          </section>

          <SectionDivider />

          {/* ── Endpoint sections ─────────────────────────────────────── */}
          {sections.map((section, si) => (
            <section key={section.id} id={section.id} className="mb-14">
              <SectionHeading
                id={`${section.id}-heading`}
                icon={section.icon}
                badge={section.endpoints.length}
              >
                {section.title}
              </SectionHeading>

              <div className="flex flex-col gap-5">
                {section.endpoints.map((ep, i) => (
                  <EndpointCard key={i} endpoint={ep} />
                ))}
              </div>

              {si < sections.length - 1 && <div className="mt-10" />}
            </section>
          ))}

          <SectionDivider />

          {/* ── Footer CTA ────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-[10px] flex items-center justify-center text-white text-[12px] font-extrabold shrink-0" style={{ background: 'linear-gradient(135deg, #3b6cff, #8b5cf6)', fontFamily: 'IBM Plex Mono, monospace' }}>
                AG
              </div>
              <div>
                <div className="text-[14px] font-semibold text-[#1a1d2e] mb-1">Try it live</div>
                <div className="text-[13px] text-[#9498b3] mb-3">
                  Run the built-in demo to see agents authorize and get revoked in real-time.
                </div>
                <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#3b6cff] no-underline">
                  Open Dashboard →
                </Link>
              </div>
            </Card>

            <Card className="p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-[10px] bg-[#f6f7fb] flex items-center justify-center text-[20px] shrink-0 border border-[#e2e4ef]">
                📦
              </div>
              <div>
                <div className="text-[14px] font-semibold text-[#1a1d2e] mb-1">TypeScript SDK</div>
                <div className="text-[13px] text-[#9498b3] mb-3">
                  Zero dependencies. Full types. Works with CrewAI, LangGraph, AutoGen, and any HTTP client.
                </div>
                <a
                  href="https://www.npmjs.com/package/@damitha-perera/agentgate"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#3b6cff] no-underline"
                >
                  View on npm →
                </a>
              </div>
            </Card>
          </div>

        </div>
      </div>
      <ScrollToTop />
    </main>
  );
}
