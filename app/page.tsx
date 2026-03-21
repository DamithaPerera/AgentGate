import Link from 'next/link';

export default function LandingPage() {
  return (
    <main className="min-h-screen" style={{ background: 'var(--color-bg-page)', color: 'var(--color-text-high)' }}>
      {/* Nav */}
      <nav style={{ background: 'var(--color-bg-surface)', borderBottom: '1px solid var(--color-border)' }}
        className="px-6 py-0 flex items-center justify-between h-14 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded flex items-center justify-center text-white font-bold text-sm"
            style={{ background: 'var(--color-brand)' }}>AG</div>
          <span className="font-semibold text-base tracking-tight" style={{ color: 'var(--color-text-high)' }}>AgentGate</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/auth/login"
            className="text-sm font-medium transition-colors"
            style={{ color: 'var(--color-text-medium)' }}>
            Log in
          </Link>
          <Link href="/dashboard"
            className="text-sm font-medium px-4 py-1.5 rounded text-white transition-opacity hover:opacity-90"
            style={{ background: 'var(--color-brand)' }}>
            Open Dashboard
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium mb-8"
          style={{ background: 'var(--color-brand-light)', color: 'var(--color-info-text)' }}>
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--color-brand)' }}></span>
          Built for NIST AI Agent Standards · IETF draft-klrc-aiagent-auth-00
        </div>

        <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-5 leading-tight"
          style={{ color: 'var(--color-text-high)' }}>
          The{' '}
          <span style={{ color: 'var(--color-brand)' }}>missing authorization layer</span>
          <br />
          for AI agents
        </h1>

        <p className="text-lg max-w-3xl mx-auto mb-10 leading-relaxed"
          style={{ color: 'var(--color-text-medium)' }}>
          AgentGate is a drop-in security middleware that gives every AI agent a
          cryptographic identity, evaluates every action against user-defined policies,
          escalates sensitive requests for human approval via CIBA, and produces a
          tamper-evident audit trail — all powered by Auth0 Token Vault.
        </p>

        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link href="/dashboard"
            className="text-white font-medium px-6 py-2.5 rounded text-sm transition-opacity hover:opacity-90"
            style={{ background: 'var(--color-brand)' }}>
            Open Dashboard
          </Link>
          <a href="https://github.com"
            className="font-medium px-6 py-2.5 rounded text-sm transition-colors border"
            style={{ color: 'var(--color-brand)', borderColor: 'var(--color-brand)', background: 'var(--color-bg-surface)' }}>
            View on GitHub
          </a>
        </div>
      </section>

      {/* Problem stat */}
      <section className="max-w-5xl mx-auto px-6 py-12">
        <div className="rounded-lg p-8 text-center border"
          style={{ background: 'var(--color-danger-bg)', borderColor: '#FFBDAD' }}>
          <div className="text-6xl font-bold mb-3" style={{ color: 'var(--color-danger)' }}>93%</div>
          <p className="text-lg font-semibold mb-2" style={{ color: 'var(--color-danger-text)' }}>
            of AI agent projects use unscoped API keys
          </p>
          <p style={{ color: 'var(--color-text-medium)' }}>
            No per-agent identity. No consent mechanism. No audit trail. No revocation.
            <br />
            NIST launched the AI Agent Standards Initiative in February 2026 because of this.
          </p>
        </div>
      </section>

      {/* Five Gates */}
      <section className="max-w-5xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold text-center mb-2" style={{ color: 'var(--color-text-high)' }}>The Five Gates</h2>
        <p className="text-center mb-10 text-sm" style={{ color: 'var(--color-text-medium)' }}>Every request. Every agent. No exceptions.</p>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {[
            { num: '1', name: 'Identity',  desc: 'Verify agent SPIFFE ID & OAuth token',                       bg: 'var(--color-info-bg)',    num_c: 'var(--color-info-text)' },
            { num: '2', name: 'Intent',    desc: 'Parse AuthZEN 4-tuple: who, what, where, context',            bg: 'var(--color-brand-light)', num_c: 'var(--color-brand)' },
            { num: '3', name: 'Policy',    desc: 'Evaluate rules → ALLOW / ESCALATE / DENY',                   bg: '#F3F0FF',                 num_c: '#5243AA' },
            { num: '4', name: 'Consent',   desc: 'Auth0 CIBA push notification for human approval',            bg: 'var(--color-warning-bg)', num_c: 'var(--color-warning-text)' },
            { num: '5', name: 'Token',     desc: 'Issue scoped, time-limited token from Token Vault',          bg: 'var(--color-success-bg)', num_c: 'var(--color-success-text)' },
          ].map((gate) => (
            <div key={gate.num} className="rounded-lg p-5 text-center border"
              style={{ background: gate.bg, borderColor: 'var(--color-border)' }}>
              <div className="text-3xl font-bold mb-2" style={{ color: gate.num_c }}>{gate.num}</div>
              <div className="font-semibold text-sm mb-1" style={{ color: 'var(--color-text-high)' }}>{gate.name}</div>
              <div className="text-xs" style={{ color: 'var(--color-text-medium)' }}>{gate.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 py-12" style={{ borderTop: '1px solid var(--color-border)' }}>
        <h2 className="text-2xl font-bold text-center mb-10" style={{ color: 'var(--color-text-high)' }}>What AgentGate Builds</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { icon: '🔑', title: 'Cryptographic Agent Identity',  desc: 'Every agent gets a SPIFFE ID and signed JWT. Anonymous agents are rejected before they touch any resource.' },
            { icon: '⚖️', title: 'OPA Policy Engine',             desc: 'AuthZEN 4-tuple evaluation (subject + action + resource + context) with natural language policy compilation.' },
            { icon: '📱', title: 'CIBA Human-in-the-Loop',        desc: 'Sensitive actions trigger Auth0 Guardian push notifications. Users approve or deny in real-time.' },
            { icon: '🏦', title: 'Auth0 Token Vault',             desc: 'Agents never see raw OAuth tokens. Token Vault issues scoped, time-limited credentials (TTL: 60s).' },
            { icon: '🔗', title: 'Hash-Chained Audit Trail',      desc: 'SHA-256 hash chain over every decision. Tamper-evident, exportable as JSON, verifiable in-dashboard.' },
            { icon: '⚡', title: 'Cascade Revocation',            desc: 'Revoke one agent, one service, or everything (PANIC). All downstream tokens destroyed instantly.' },
          ].map((f) => (
            <div key={f.title} className="rounded-lg p-5 border"
              style={{ background: 'var(--color-bg-surface)', borderColor: 'var(--color-border)' }}>
              <div className="text-2xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-sm mb-1.5" style={{ color: 'var(--color-text-high)' }}>{f.title}</h3>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-medium)' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Standards */}
      <section className="max-w-5xl mx-auto px-6 py-12" style={{ borderTop: '1px solid var(--color-border)' }}>
        <h2 className="text-xl font-bold text-center mb-6" style={{ color: 'var(--color-text-high)' }}>Built on Real Standards</h2>
        <div className="flex flex-wrap justify-center gap-2">
          {['Auth0 Token Vault','Auth0 CIBA + Guardian','IETF draft-klrc-aiagent-auth-00','NIST AI Agent Standards','AuthZEN (OpenID Foundation)','SPIFFE/WIMSE','OPA (CNCF Graduated)'].map(s => (
            <span key={s} className="rounded-full px-3 py-1 text-xs font-medium border"
              style={{ background: 'var(--color-bg-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text-medium)' }}>
              {s}
            </span>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-6 py-16 text-center">
        <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--color-text-high)' }}>Ready to see it in action?</h2>
        <p className="mb-8 text-sm" style={{ color: 'var(--color-text-medium)' }}>
          Click &quot;Run Demo&quot; in the dashboard to watch three agents register, request access, trigger CIBA, and get cascade-revoked in real-time.
        </p>
        <Link href="/dashboard"
          className="text-white font-medium px-8 py-3 rounded text-sm transition-opacity hover:opacity-90 inline-block"
          style={{ background: 'var(--color-brand)' }}>
          Open Dashboard →
        </Link>
      </section>

      {/* Footer */}
      <footer className="px-6 py-6 text-center text-xs" style={{ borderTop: '1px solid var(--color-border)', color: 'var(--color-text-subtle)' }}>
        <p>AgentGate · Built for the &quot;Authorized to Act: Auth0 for AI Agents&quot; Hackathon · Powered by Auth0 Token Vault</p>
        <p className="mt-1">The authorization layer the IETF left as &quot;TODO Security&quot;</p>
      </footer>
    </main>
  );
}
