import Link from 'next/link';

// ── Types ─────────────────────────────────────────────────────────────────────

type HttpMethod = 'GET' | 'POST' | 'DELETE';

type Endpoint = {
  method: HttpMethod;
  path: string;
  description: string;
  authRequired: boolean;
  authNote?: string;
  requestBody?: string;
  response: string;
  curl: string;
};

type Section = { id: string; title: string; endpoints: Endpoint[] };

// ── Design tokens ─────────────────────────────────────────────────────────────

const METHOD_STYLES: Record<HttpMethod, string> = {
  GET:    'bg-[#e7faf0] text-[#12b76a]',
  POST:   'bg-[#ebf0ff] text-[#3b6cff]',
  DELETE: 'bg-[#fef2f2] text-[#ef4444]',
};

// ── Reusable components ───────────────────────────────────────────────────────

function MethodBadge({ method }: { method: HttpMethod }) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded-[6px] text-[11px] font-bold tracking-[0.04em] font-[family-name:var(--font-ibm-plex-mono)] ${METHOD_STYLES[method]}`}>
      {method}
    </span>
  );
}

function AuthBadge({ required, note }: { required: boolean; note?: string }) {
  if (!required) return (
    <span className="inline-block px-2 py-0.5 rounded-[6px] text-[11px] font-semibold bg-[#f6f7fb] text-[#9498b3] border border-[#e2e4ef]">
      {note ?? 'No auth required'}
    </span>
  );
  return (
    <span className="inline-block px-2 py-0.5 rounded-[6px] text-[11px] font-semibold bg-[#ebf0ff] text-[#3b6cff] border border-[#3b6cff33]">
      {note ? `Auth: ${note}` : 'Authorization: Bearer ag_live_...'}
    </span>
  );
}

function CodeBlock({ code, label }: { code: string; label: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[11px] font-bold text-[#9498b3] uppercase tracking-[0.06em] font-[family-name:var(--font-ibm-plex-mono)]">
        {label}
      </span>
      <pre className="bg-[#1e2535] text-[#e2e8f0] font-[family-name:var(--font-ibm-plex-mono)] text-[12px] leading-[1.7] px-[18px] py-4 rounded-[10px] overflow-x-auto m-0 border border-[#2a3447]">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function SectionHeading({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="text-[22px] font-extrabold text-[#1a1d2e] mb-5 tracking-[-0.01em]">
      {children}
    </h2>
  );
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white border border-[#e2e4ef] rounded-[14px] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,.04)] ${className}`}>
      {children}
    </div>
  );
}

function EndpointCard({ endpoint }: { endpoint: Endpoint }) {
  return (
    <Card>
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#e2e4ef] bg-[#f6f7fb] flex flex-col gap-2.5">
        <div className="flex items-center gap-2.5 flex-wrap">
          <MethodBadge method={endpoint.method} />
          <code className="font-[family-name:var(--font-ibm-plex-mono)] text-[14px] font-semibold text-[#1a1d2e]">
            {endpoint.path}
          </code>
        </div>
        <p className="m-0 text-[13px] text-[#5c6078] leading-relaxed">{endpoint.description}</p>
        <AuthBadge required={endpoint.authRequired} note={endpoint.authNote} />
      </div>
      {/* Body */}
      <div className="p-5 flex flex-col gap-4">
        {endpoint.requestBody && <CodeBlock label="Request Body" code={endpoint.requestBody} />}
        <CodeBlock label="Response" code={endpoint.response} />
        <CodeBlock label="cURL Example" code={endpoint.curl} />
      </div>
    </Card>
  );
}

function InfoCard({ variant, children }: { variant: 'blue' | 'purple' | 'yellow'; children: React.ReactNode }) {
  const styles = {
    blue:   'bg-[#ebf0ff] border-[#3b6cff33]',
    purple: 'bg-[#f3f0ff] border-[#8b5cf633]',
    yellow: 'bg-[#fffbeb] border-[#fde04733] text-[#92400e]',
  };
  return (
    <div className={`border rounded-[12px] p-[18px_20px] text-[13px] leading-relaxed ${styles[variant]}`}>
      {children}
    </div>
  );
}

function AuthMethodCard({ badge, badgeClass, title, children }: {
  badge: string; badgeClass: string; title: string; children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-[#e2e4ef] rounded-[12px] p-[18px_20px]">
      <div className="flex items-center gap-2.5 mb-2.5">
        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-[6px] ${badgeClass}`}>{badge}</span>
        <span className="text-[14px] font-semibold text-[#1a1d2e]">{title}</span>
      </div>
      {children}
    </div>
  );
}

function SidebarLink({ href, label, muted = false }: { href: string; label: string; muted?: boolean }) {
  return (
    <a
      href={href}
      className={`block text-[13px] px-2.5 py-[5px] rounded-[7px] no-underline transition-colors hover:bg-[#f0f1f7] ${
        muted ? 'font-medium text-[#5c6078]' : 'font-semibold text-[#1a1d2e]'
      }`}
    >
      {label}
    </a>
  );
}

// ── Data ──────────────────────────────────────────────────────────────────────

const sections: Section[] = [
  {
    id: 'agents',
    title: 'Agents',
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
        curl: `curl -X POST https://your-app.vercel.app/api/agents/register \\
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
        curl: `curl https://your-app.vercel.app/api/agents \\
  -H "Authorization: Bearer ag_live_..."`,
      },
      {
        method: 'POST',
        path: '/api/revoke/agent',
        description: 'Revoke a specific agent. Triggers cascade revocation — all downstream tokens for this agent are destroyed.',
        authRequired: true,
        requestBody: `{ "agentId": "agt_7x3k..." }`,
        response: `{ "success": true, "revokedTokens": 3, "agentId": "agt_7x3k..." }`,
        curl: `curl -X POST https://your-app.vercel.app/api/revoke/agent \\
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
        curl: `curl -X POST https://your-app.vercel.app/api/revoke/service \\
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
        curl: `curl -X POST https://your-app.vercel.app/api/revoke/panic \\
  -H "Authorization: Bearer ag_live_..."`,
      },
    ],
  },
  {
    id: 'authorization',
    title: 'Authorization',
    endpoints: [
      {
        method: 'POST',
        path: '/api/authorize',
        description: 'Request authorization for an agent action. The agent presents its JWT (obtained at registration), and AgentGate evaluates through all 5 gates: Identity → Intent → Policy → Consent → Token.',
        authRequired: false,
        authNote: 'Uses agent JWT (from /api/agents/register), not an API key.',
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
        curl: `curl -X POST https://your-app.vercel.app/api/authorize \\
  -H "Content-Type: application/json" \\
  -d '{"agentToken":"eyJ...","action":{"type":"read","operation":"list_emails","service":"gmail"},"resource":{"type":"email"}}'`,
      },
    ],
  },
  {
    id: 'audit',
    title: 'Audit',
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
        curl: `curl "https://your-app.vercel.app/api/audit?limit=50&offset=0" \\
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
        curl: `curl -X POST https://your-app.vercel.app/api/audit/verify \\
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
        curl: `curl "https://your-app.vercel.app/api/audit/export" \\
  -H "Authorization: Bearer ag_live_..." \\
  -o audit-export.json`,
      },
    ],
  },
  {
    id: 'policy',
    title: 'Policy',
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
        curl: `curl https://your-app.vercel.app/api/policy/rules`,
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
        curl: `curl -X POST https://your-app.vercel.app/api/policy/rules \\
  -H "Authorization: Bearer ag_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{"rules":[...]}'`,
      },
    ],
  },
  {
    id: 'keys',
    title: 'API Keys',
    endpoints: [
      {
        method: 'GET',
        path: '/api/keys',
        description: 'List your API keys. Returns display-safe fields only — the raw key is never returned after creation.',
        authRequired: true,
        authNote: 'Session (cookie) required.',
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
        curl: `curl https://your-app.vercel.app/api/keys \\
  -H "Cookie: appSession=..."`,
      },
      {
        method: 'POST',
        path: '/api/keys',
        description: 'Generate a new API key. The raw key is returned exactly once — store it securely.',
        authRequired: true,
        authNote: 'Session (cookie) required.',
        requestBody: `{ "name": "Production Agent" }`,
        response: `{
  "id": "key_abc123...",
  "name": "Production Agent",
  "key": "ag_live_ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefgh",
  "keyPrefix": "ag_live_ABCD..."
}`,
        curl: `curl -X POST https://your-app.vercel.app/api/keys \\
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
        curl: `curl -X DELETE https://your-app.vercel.app/api/keys/key_abc123... \\
  -H "Cookie: appSession=..."`,
      },
    ],
  },
];

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DocsPage() {
  return (
    <main className="min-h-screen bg-[#f6f7fb]" style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}>

      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-[#e2e4ef]">
        <div className="max-w-[1280px] mx-auto px-6 h-[60px] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Link href="/" className="flex items-center gap-2 no-underline">
              <div
                className="w-8 h-8 rounded-[8px] flex items-center justify-center text-white text-[11px] font-extrabold shrink-0"
                style={{
                  background: 'linear-gradient(135deg, #3b6cff, #8b5cf6)',
                  fontFamily: 'var(--font-ibm-plex-mono), IBM Plex Mono, monospace',
                  boxShadow: '0 2px 8px rgba(59,108,255,0.28)',
                }}
              >AG</div>
              <span className="font-bold text-[15px] text-[#1a1d2e]">AgentGate</span>
            </Link>
            <div className="w-px h-[18px] bg-[#e2e4ef]" />
            <span className="text-[13px] text-[#9498b3] font-medium">API Reference</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/docs" className="text-[13px] font-semibold text-[#3b6cff] no-underline">Docs</Link>
            <Link
              href="/dashboard"
              className="px-4 py-[7px] rounded-[8px] text-white font-semibold text-[13px] no-underline"
              style={{ background: 'linear-gradient(135deg, #3b6cff, #6b8fff)', boxShadow: '0 2px 8px rgba(59,108,255,0.28)' }}
            >
              Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* Layout */}
      <div className="max-w-[1280px] mx-auto flex gap-0 px-6">

        {/* Sidebar */}
        <aside className="w-[220px] shrink-0 sticky top-[60px] self-start h-[calc(100vh-60px)] overflow-y-auto py-8 pr-6">
          <div className="flex flex-col gap-0.5">
            <SidebarLink href="#introduction" label="Introduction" />
            <SidebarLink href="#authentication" label="Authentication" />
            <div className="h-2" />
            <span className="text-[10px] font-bold text-[#9498b3] uppercase tracking-[0.1em] px-2.5 py-0.5 font-[family-name:var(--font-ibm-plex-mono)]">
              Endpoints
            </span>
            {sections.map(s => (
              <SidebarLink key={s.id} href={`#${s.id}`} label={s.title} muted />
            ))}
          </div>
        </aside>

        {/* Content */}
        <div className="flex-1 min-w-0 py-10 pb-20 pl-10 border-l border-[#e2e4ef]">

          {/* Introduction */}
          <section id="introduction" className="mb-14">
            <div className="inline-flex items-center gap-2 bg-[#ebf0ff] border border-[#3b6cff33] rounded-full px-3.5 py-[5px] mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3b6cff] inline-block" />
              <span className="text-[#3b6cff] text-[12px] font-semibold">REST API · v1</span>
            </div>
            <h1 className="text-[32px] font-extrabold text-[#1a1d2e] mb-3.5 tracking-[-0.02em] leading-tight">
              AgentGate API Reference
            </h1>
            <p className="text-[15px] text-[#5c6078] leading-[1.75] max-w-[680px] mb-5">
              The AgentGate REST API lets you register AI agents, manage authorization policies,
              inspect the tamper-evident audit trail, and programmatically revoke access — all from your own code.
            </p>
            <div className="flex gap-2 flex-wrap">
              {['JSON responses', 'Bearer token auth', 'HTTPS only', 'OpenAPI coming soon'].map(b => (
                <span key={b} className="bg-white border border-[#e2e4ef] rounded-full px-3 py-[5px] text-[12px] font-medium text-[#5c6078]">
                  {b}
                </span>
              ))}
            </div>
          </section>

          {/* Authentication */}
          <section id="authentication" className="mb-14">
            <SectionHeading id="auth-heading">Authentication</SectionHeading>
            <p className="text-[14px] text-[#5c6078] leading-[1.75] mb-5">
              Most API endpoints require authentication. AgentGate supports two methods:
            </p>
            <div className="flex flex-col gap-3 mb-6">
              <AuthMethodCard badge="API KEY" badgeClass="bg-[#ebf0ff] text-[#3b6cff]" title="For programmatic / agent access">
                <p className="text-[13px] text-[#5c6078] mb-3 leading-relaxed">
                  Generate an API key from the{' '}
                  <Link href="/dashboard" className="text-[#3b6cff]">dashboard</Link> and include it in every request:
                </p>
                <pre className="bg-[#1e2535] text-[#e2e8f0] font-[family-name:var(--font-ibm-plex-mono)] text-[12px] leading-relaxed px-4 py-3 rounded-[8px] m-0 border border-[#2a3447] overflow-x-auto">
                  <code>Authorization: Bearer ag_live_ABCDEFGHIJKLMNOPQRSTUVWXYZabcde</code>
                </pre>
              </AuthMethodCard>

              <AuthMethodCard badge="SESSION" badgeClass="bg-[#f3f0ff] text-[#8b5cf6]" title="For dashboard / browser access">
                <p className="text-[13px] text-[#5c6078] leading-relaxed">
                  Log in via <Link href="/auth/login" className="text-[#3b6cff]">Auth0</Link>.
                  The session cookie is automatically sent from the dashboard.
                </p>
              </AuthMethodCard>
            </div>
            <InfoCard variant="yellow">
              <strong>Important:</strong> API keys are shown exactly once when created.
              Store them securely — they cannot be recovered. Revoke compromised keys immediately from the dashboard.
            </InfoCard>
          </section>

          {/* Endpoint sections */}
          {sections.map(section => (
            <section key={section.id} id={section.id} className="mb-14">
              <SectionHeading id={`${section.id}-heading`}>{section.title}</SectionHeading>
              <div className="flex flex-col gap-5">
                {section.endpoints.map((ep, i) => (
                  <EndpointCard key={i} endpoint={ep} />
                ))}
              </div>
            </section>
          ))}

          {/* Footer CTA */}
          <Card className="p-6 flex items-center gap-4">
            <div
              className="w-10 h-10 rounded-[10px] flex items-center justify-center text-white text-[12px] font-extrabold shrink-0"
              style={{
                background: 'linear-gradient(135deg, #3b6cff, #8b5cf6)',
                fontFamily: 'var(--font-ibm-plex-mono), IBM Plex Mono, monospace',
              }}
            >AG</div>
            <div>
              <div className="text-[14px] font-semibold text-[#1a1d2e] mb-1">
                Need help? Open the dashboard to explore live.
              </div>
              <div className="text-[13px] text-[#9498b3]">
                Run the built-in demo to see agents register, authorize, and get revoked in real-time.{' '}
                <Link href="/dashboard" className="text-[#3b6cff]">Open Dashboard →</Link>
              </div>
            </div>
          </Card>

        </div>
      </div>
    </main>
  );
}
