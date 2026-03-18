import Link from 'next/link';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#080f1a] text-slate-100">
      {/* Nav */}
      <nav className="border-b border-[#1e3a5f] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-teal-700 rounded-lg flex items-center justify-center text-white font-bold text-sm">AG</div>
          <span className="font-semibold text-lg tracking-tight">AgentGate</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/api/auth/login" className="text-sm text-slate-400 hover:text-slate-100 transition-colors">
            Login
          </Link>
          <Link href="/dashboard" className="bg-teal-700 hover:bg-teal-600 text-white text-sm px-4 py-2 rounded-lg transition-colors font-medium">
            Open Dashboard
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 bg-[#0d1829] border border-[#1e3a5f] rounded-full px-4 py-1.5 text-sm text-teal-400 mb-8">
          <span className="w-2 h-2 bg-teal-400 rounded-full animate-pulse"></span>
          Built for NIST AI Agent Standards · IETF draft-klrc-aiagent-auth-00
        </div>

        <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 leading-tight">
          The{' '}
          <span className="text-teal-400">missing authorization layer</span>
          <br />
          for AI agents
        </h1>

        <p className="text-xl text-slate-400 max-w-3xl mx-auto mb-10 leading-relaxed">
          AgentGate is a drop-in security middleware that gives every AI agent a
          cryptographic identity, evaluates every action against user-defined policies,
          escalates sensitive requests for human approval via CIBA, and produces a
          tamper-evident audit trail — all powered by Auth0 Token Vault.
        </p>

        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link
            href="/dashboard"
            className="bg-teal-700 hover:bg-teal-600 text-white px-8 py-3 rounded-lg font-medium text-lg transition-colors"
          >
            Open Dashboard
          </Link>
          <a
            href="https://github.com"
            className="border border-[#1e3a5f] hover:border-teal-700 text-slate-300 px-8 py-3 rounded-lg font-medium text-lg transition-colors"
          >
            View on GitHub
          </a>
        </div>
      </section>

      {/* Problem stat */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="bg-[#0d1829] border border-red-900/50 rounded-xl p-8 text-center">
          <div className="text-6xl font-bold text-red-400 mb-3">93%</div>
          <p className="text-xl text-slate-300 font-medium mb-2">
            of AI agent projects use unscoped API keys
          </p>
          <p className="text-slate-400">
            No per-agent identity. No consent mechanism. No audit trail. No revocation.
            <br />
            NIST launched the AI Agent Standards Initiative in February 2026 because of this.
          </p>
        </div>
      </section>

      {/* Five Gates */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-3">The Five Gates</h2>
        <p className="text-slate-400 text-center mb-12">Every request. Every agent. No exceptions.</p>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[
            { num: '1', name: 'Identity', desc: 'Verify agent SPIFFE ID & OAuth token', color: 'border-blue-700/50 text-blue-400' },
            { num: '2', name: 'Intent', desc: 'Parse AuthZEN 4-tuple: who, what, where, context', color: 'border-teal-700/50 text-teal-400' },
            { num: '3', name: 'Policy', desc: 'Evaluate against OPA/Rego rules → ALLOW / ESCALATE / DENY', color: 'border-purple-700/50 text-purple-400' },
            { num: '4', name: 'Consent', desc: 'Auth0 CIBA push notification for human approval', color: 'border-amber-700/50 text-amber-400' },
            { num: '5', name: 'Token', desc: 'Issue scoped, time-limited token from Token Vault', color: 'border-emerald-700/50 text-emerald-400' },
          ].map((gate) => (
            <div key={gate.num} className={`bg-[#0d1829] border ${gate.color.split(' ')[0]} rounded-xl p-5 text-center`}>
              <div className={`text-3xl font-bold mb-2 ${gate.color.split(' ')[1]}`}>{gate.num}</div>
              <div className="font-semibold mb-2">{gate.name}</div>
              <div className="text-xs text-slate-400">{gate.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">What AgentGate Builds</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: '🔑',
              title: 'Cryptographic Agent Identity',
              desc: 'Every agent gets a SPIFFE ID and signed JWT. Anonymous agents are rejected before they touch any resource.',
            },
            {
              icon: '⚖️',
              title: 'OPA Policy Engine',
              desc: 'AuthZEN 4-tuple evaluation (subject + action + resource + context) with natural language policy compilation.',
            },
            {
              icon: '📱',
              title: 'CIBA Human-in-the-Loop',
              desc: 'Sensitive actions trigger Auth0 Guardian push notifications. Users approve or deny in real-time.',
            },
            {
              icon: '🏦',
              title: 'Auth0 Token Vault',
              desc: 'Agents never see raw OAuth tokens. Token Vault issues scoped, time-limited credentials (TTL: 60s).',
            },
            {
              icon: '🔗',
              title: 'Hash-Chained Audit Trail',
              desc: 'SHA-256 hash chain over every decision. Tamper-evident, exportable as JSON, verifiable in-dashboard.',
            },
            {
              icon: '⚡',
              title: 'Cascade Revocation',
              desc: 'Revoke one agent, one service, or everything (PANIC). All downstream tokens destroyed instantly.',
            },
          ].map((f) => (
            <div key={f.title} className="bg-[#0d1829] border border-[#1e3a5f] rounded-xl p-6">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Standards */}
      <section className="max-w-5xl mx-auto px-6 py-16 border-t border-[#1e3a5f]">
        <h2 className="text-2xl font-bold text-center mb-8">Built on Real Standards</h2>
        <div className="flex flex-wrap justify-center gap-4">
          {[
            'Auth0 Token Vault',
            'Auth0 CIBA + Guardian',
            'IETF draft-klrc-aiagent-auth-00',
            'NIST AI Agent Standards',
            'AuthZEN (OpenID Foundation)',
            'SPIFFE/WIMSE',
            'OPA (CNCF Graduated)',
          ].map(s => (
            <span key={s} className="bg-[#0d1829] border border-[#1e3a5f] rounded-full px-4 py-2 text-sm text-slate-300">
              {s}
            </span>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to see it in action?</h2>
        <p className="text-slate-400 mb-8">
          Click &quot;Run Demo&quot; in the dashboard to watch three agents — CrewAI, LangGraph, and a custom script —
          register, request access, trigger CIBA, and get cascade-revoked in real-time.
        </p>
        <Link
          href="/dashboard"
          className="bg-teal-700 hover:bg-teal-600 text-white px-10 py-4 rounded-lg font-medium text-lg transition-colors inline-block"
        >
          Open Dashboard →
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1e3a5f] px-6 py-8 text-center text-sm text-slate-500">
        <p>AgentGate · Built for the &quot;Authorized to Act: Auth0 for AI Agents&quot; Hackathon · Powered by Auth0 Token Vault</p>
        <p className="mt-1">The authorization layer the IETF left as &quot;TODO Security&quot;</p>
      </footer>
    </main>
  );
}
