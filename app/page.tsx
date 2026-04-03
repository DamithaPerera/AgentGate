import Link from 'next/link';

export default function LandingPage() {
  return (
    <main className="min-h-screen" style={{ fontFamily: 'Inter, -apple-system, sans-serif' }}>

      {/* ── Navigation ──────────────────────────────────────────── */}
      <nav style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #E2E8F0', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: 'linear-gradient(135deg, #3b6cff, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 14, boxShadow: '0 2px 8px rgba(59,108,255,0.28)' }}>AG</div>
            <span style={{ fontWeight: 700, fontSize: 18, color: '#0F172A' }}>AgentGate</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Link href="/docs" style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: 'transparent', color: '#2D3748', fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>
              Docs
            </Link>
            <a href="https://github.com/DamithaPerera/AgentGate" target="_blank" rel="noopener noreferrer" style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: 'transparent', color: '#2D3748', fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>
              GitHub
            </a>
            <Link href="/auth/login?returnTo=/dashboard" style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #E2E8F0', background: 'transparent', color: '#2D3748', fontWeight: 600, fontSize: 14, textDecoration: 'none', transition: 'background 0.2s' }}>
              Log in
            </Link>
            <Link href="/dashboard" style={{ padding: '8px 20px', borderRadius: 8, background: 'linear-gradient(135deg, #3b6cff, #8b5cf6)', color: '#fff', fontWeight: 600, fontSize: 14, textDecoration: 'none', boxShadow: '0 2px 12px rgba(59,108,255,0.35)' }}>
              Open Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────── */}
      <section style={{ background: 'linear-gradient(160deg, #0A0F1E 0%, #0F1E3D 50%, #0A1628 100%)', padding: '120px 24px 100px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        {/* Glow orbs */}
        <div style={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,108,255,0.25) 0%, transparent 70%)', top: -200, left: '10%', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)', top: -100, right: '5%', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,108,255,0.15) 0%, transparent 70%)', bottom: -100, left: '40%', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 820, margin: '0 auto' }} className="animate-fade-in-up">
          <div className="animate-fade-in-up" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(59,108,255,0.15)', border: '1px solid rgba(139,92,246,0.35)', borderRadius: 999, padding: '6px 16px', marginBottom: 32 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#36B37E', display: 'inline-block', boxShadow: '0 0 8px #36B37E' }} className="animate-pulse" />
            <span style={{ color: '#93C5FD', fontSize: 13, fontWeight: 500 }}>Built for NIST AI Agent Standards · IETF draft-klrc-aiagent-auth-00</span>
          </div>

          <h1 className="animate-fade-in-up delay-100" style={{ fontSize: 'clamp(36px, 6vw, 64px)', fontWeight: 800, lineHeight: 1.1, color: '#fff', marginBottom: 24, letterSpacing: '-0.02em' }}>
            The{' '}
            <span style={{ background: 'linear-gradient(135deg, #60A5FA, #818CF8, #38BDF8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              missing authorization layer
            </span>
            <br />for AI agents
          </h1>

          <p className="animate-fade-in-up delay-200" style={{ fontSize: 18, color: '#94A3B8', maxWidth: 620, margin: '0 auto 40px', lineHeight: 1.75 }}>
            Drop-in security middleware that gives every AI agent a cryptographic identity, evaluates every action against policies, and produces a tamper-evident audit trail — powered by Auth0.
          </p>

          <div className="animate-fade-in-up delay-300" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
            <Link href="/dashboard" style={{ padding: '14px 32px', borderRadius: 10, background: 'linear-gradient(135deg, #3b6cff, #8b5cf6)', color: '#fff', fontWeight: 700, fontSize: 15, textDecoration: 'none', boxShadow: '0 4px 24px rgba(59,108,255,0.5)', transition: 'transform 0.2s, box-shadow 0.2s', display: 'inline-block' }}
              className="hover:scale-105">
              Open Dashboard →
            </Link>
            <Link href="/auth/login?returnTo=/dashboard" style={{ padding: '14px 28px', borderRadius: 10, background: 'rgba(255,255,255,0.08)', color: '#fff', fontWeight: 600, fontSize: 15, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.15)', transition: 'background 0.2s', display: 'inline-block' }}>
              Sign in free
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats strip ─────────────────────────────────────────── */}
      <section style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', padding: '40px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 32, textAlign: 'center' }}>
          {[
            { value: '93%', label: 'of AI agent projects have no authorization layer', color: '#E11D48' },
            { value: '< 1ms', label: 'authorization overhead per request', color: '#3b6cff' },
            { value: '5 Gates', label: 'every request passes through before execution', color: '#9333EA' },
            { value: '100%', label: 'tamper-evident audit trail coverage', color: '#16A34A' },
          ].map((s, i) => (
            <div key={i} className={`animate-fade-in-up delay-${(i + 1) * 100}`}>
              <div style={{ fontSize: 32, fontWeight: 800, color: s.color, marginBottom: 6 }}>{s.value}</div>
              <div style={{ fontSize: 13, color: '#64748B', lineHeight: 1.5 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Five Gates ──────────────────────────────────────────── */}
      <section style={{ background: '#fff', padding: '100px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div className="animate-fade-in-up" style={{ display: 'inline-block', background: '#EFF6FF', color: '#1D4ED8', fontWeight: 600, fontSize: 13, padding: '4px 14px', borderRadius: 999, marginBottom: 16 }}>The Five Gates</div>
            <h2 className="animate-fade-in-up delay-100" style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, color: '#0F172A', marginBottom: 12, letterSpacing: '-0.02em' }}>Every request. Every agent. No exceptions.</h2>
            <p className="animate-fade-in-up delay-200" style={{ color: '#64748B', fontSize: 16, maxWidth: 520, margin: '0 auto' }}>A five-layer protocol that runs in under 1ms, invisible to agents but enforced on every call.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            {[
              { num: '1', name: 'Identity',  desc: 'Verify agent SPIFFE ID & OAuth token',                  bg: '#EFF6FF', num_c: '#1D4ED8', border: '#BFDBFE', icon: '🔐', delay: 'delay-100' },
              { num: '2', name: 'Intent',    desc: 'Parse AuthZEN 4-tuple: who, what, where, context',       bg: '#FDF4FF', num_c: '#9333EA', border: '#E9D5FF', icon: '🎯', delay: 'delay-200' },
              { num: '3', name: 'Policy',    desc: 'Evaluate rules → ALLOW / ESCALATE / DENY',              bg: '#FFF7ED', num_c: '#EA580C', border: '#FED7AA', icon: '⚖️', delay: 'delay-300' },
              { num: '4', name: 'Consent',   desc: 'Auth0 CIBA push notification for human approval',       bg: '#FFF1F2', num_c: '#E11D48', border: '#FECDD3', icon: '📱', delay: 'delay-400' },
              { num: '5', name: 'Token',     desc: 'Issue scoped, time-limited token from Token Vault',     bg: '#F0FDF4', num_c: '#16A34A', border: '#BBF7D0', icon: '🎫', delay: 'delay-500' },
            ].map((gate) => (
              <div key={gate.num} className={`gate-card animate-fade-in-up ${gate.delay}`}
                style={{ background: gate.bg, border: `1px solid ${gate.border}`, borderRadius: 16, padding: '28px 20px', textAlign: 'center', cursor: 'default' }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{gate.icon}</div>
                <div style={{ fontSize: 36, fontWeight: 900, color: gate.num_c, lineHeight: 1, marginBottom: 8 }}>{gate.num}</div>
                <div style={{ fontWeight: 700, fontSize: 15, color: '#0F172A', marginBottom: 8 }}>{gate.name}</div>
                <div style={{ fontSize: 13, color: '#64748B', lineHeight: 1.6 }}>{gate.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features — dark section ──────────────────────────────── */}
      <section style={{ background: 'linear-gradient(160deg, #0A0F1E 0%, #0F1E3D 100%)', padding: '100px 24px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,82,204,0.15) 0%, transparent 70%)', top: -100, right: -100, pointerEvents: 'none' }} />

        <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div className="animate-fade-in-up" style={{ display: 'inline-block', background: 'rgba(0,82,204,0.2)', color: '#93C5FD', fontWeight: 600, fontSize: 13, padding: '4px 14px', borderRadius: 999, border: '1px solid rgba(0,101,255,0.3)', marginBottom: 16 }}>What AgentGate Builds</div>
            <h2 className="animate-fade-in-up delay-100" style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, color: '#fff', marginBottom: 12, letterSpacing: '-0.02em' }}>Enterprise-grade security for every agent</h2>
            <p className="animate-fade-in-up delay-200" style={{ color: '#94A3B8', fontSize: 16, maxWidth: 520, margin: '0 auto' }}>Six security layers that work together to ensure no agent ever acts without authorization.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
            {[
              { icon: '🔑', title: 'Cryptographic Agent Identity',  desc: 'Every agent gets a SPIFFE ID and signed JWT. Anonymous agents are rejected before they touch any resource.',  delay: 'delay-100', accent: '#3B82F6' },
              { icon: '⚖️', title: 'OPA Policy Engine',             desc: 'AuthZEN 4-tuple evaluation (subject + action + resource + context) with natural language policy compilation.', delay: 'delay-200', accent: '#8B5CF6' },
              { icon: '📱', title: 'CIBA Human-in-the-Loop',        desc: 'Sensitive actions trigger Auth0 Guardian push notifications. Users approve or deny in real-time.',              delay: 'delay-300', accent: '#EC4899' },
              { icon: '🏦', title: 'Auth0 Token Vault',             desc: 'Agents never see raw OAuth tokens. Token Vault issues scoped, time-limited credentials with 60s TTL.',          delay: 'delay-400', accent: '#10B981' },
              { icon: '🔗', title: 'Hash-Chained Audit Trail',      desc: 'SHA-256 hash chain over every decision. Tamper-evident, exportable as JSON, verifiable in-dashboard.',         delay: 'delay-500', accent: '#F59E0B' },
              { icon: '⚡', title: 'Cascade Revocation',            desc: 'Revoke one agent, one service, or everything (PANIC). All downstream tokens destroyed instantly.',              delay: 'delay-600', accent: '#EF4444' },
            ].map((f) => (
              <div key={f.title} className={`card-hover animate-fade-in-up ${f.delay}`}
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '28px 24px', transition: 'border-color 0.2s, background 0.2s' }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: `${f.accent}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginBottom: 16 }}>{f.icon}</div>
                <h3 style={{ fontWeight: 700, fontSize: 16, color: '#F1F5F9', marginBottom: 10 }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: '#94A3B8', lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Standards — light section ────────────────────────────── */}
      <section style={{ background: '#F8FAFC', padding: '80px 24px', borderTop: '1px solid #E2E8F0' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <h2 className="animate-fade-in-up" style={{ fontSize: 28, fontWeight: 800, color: '#0F172A', marginBottom: 8 }}>Built on Real Standards</h2>
          <p className="animate-fade-in-up delay-100" style={{ color: '#64748B', fontSize: 15, marginBottom: 40 }}>Not invented here — built on IETF, NIST, CNCF, and OpenID Foundation specifications.</p>
          <div className="animate-fade-in-up delay-200" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 10 }}>
            {['Auth0 Token Vault', 'Auth0 CIBA + Guardian', 'IETF draft-klrc-aiagent-auth-00', 'NIST AI Agent Standards', 'AuthZEN (OpenID Foundation)', 'SPIFFE / WIMSE', 'OPA (CNCF Graduated)'].map(s => (
              <span key={s} style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 999, padding: '7px 16px', fontSize: 13, fontWeight: 500, color: '#374151', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>{s}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Quick start ─────────────────────────────────────────── */}
      <section style={{ background: '#fff', padding: '100px 24px', borderTop: '1px solid #E2E8F0' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div className="animate-fade-in-up" style={{ display: 'inline-block', background: '#F0FDF4', color: '#15803D', fontWeight: 600, fontSize: 13, padding: '4px 14px', borderRadius: 999, marginBottom: 16 }}>Quick Start</div>
            <h2 className="animate-fade-in-up delay-100" style={{ fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 800, color: '#0F172A', marginBottom: 12, letterSpacing: '-0.02em' }}>Connect your agent in 2 API calls</h2>
            <p className="animate-fade-in-up delay-200" style={{ color: '#64748B', fontSize: 15 }}>No SDK required. Any agent that can make HTTP requests works.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: 20 }}>
            {/* Step 1 */}
            <div className="animate-fade-in-up delay-100" style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid #E2E8F0', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <div style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'linear-gradient(135deg, #3b6cff, #8b5cf6)', color: '#fff', fontWeight: 800, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>1</span>
                <span style={{ fontWeight: 600, fontSize: 13, color: '#374151' }}>Register your agent</span>
              </div>
              <pre style={{ margin: 0, padding: '20px', background: '#0F172A', color: '#E2E8F0', fontSize: 12, lineHeight: 1.7, overflowX: 'auto', fontFamily: "'IBM Plex Mono', 'Fira Code', monospace" }}>{`curl -X POST /api/agents/register \\
  -H "Authorization: Bearer ag_live_..." \\
  -d '{
    "name": "my-agent",
    "framework": "crewai",
    "capabilities": ["gmail.read"],
    "trustTier": "T1"
  }'
# → { "agentId": "...", "token": "eyJ..." }`}</pre>
            </div>

            {/* Step 2 */}
            <div className="animate-fade-in-up delay-200" style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid #E2E8F0', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <div style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 22, height: 22, borderRadius: '50%', background: '#16A34A', color: '#fff', fontWeight: 800, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>2</span>
                <span style={{ fontWeight: 600, fontSize: 13, color: '#374151' }}>Authorize every action</span>
              </div>
              <pre style={{ margin: 0, padding: '20px', background: '#0F172A', color: '#E2E8F0', fontSize: 12, lineHeight: 1.7, overflowX: 'auto', fontFamily: "'IBM Plex Mono', 'Fira Code', monospace" }}>{`curl -X POST /api/authorize \\
  -H "Authorization: Bearer ag_live_..." \\
  -d '{
    "agentToken": "eyJ...",
    "action": { "type": "read",
      "operation": "list_emails",
      "service": "gmail" }
  }'
# → { "allowed": true, "token": {...} }`}</pre>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: 32 }}>
            <Link href="/docs" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#3b6cff', fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>
              View full API reference →
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────── */}
      <section style={{ background: 'linear-gradient(160deg, #0A0F1E 0%, #0F1E3D 100%)', padding: '100px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,108,255,0.2) 0%, transparent 70%)', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 640, margin: '0 auto', position: 'relative', zIndex: 1 }} className="animate-fade-in-up">
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, color: '#fff', marginBottom: 16, letterSpacing: '-0.02em' }}>
            Ready to secure your AI agents?
          </h2>
          <p style={{ color: '#94A3B8', fontSize: 16, marginBottom: 40, lineHeight: 1.75 }}>
            Open the dashboard to watch agents register, request access, trigger CIBA consent, and get cascade-revoked in real-time.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/dashboard" style={{ padding: '14px 36px', borderRadius: 10, background: 'linear-gradient(135deg, #3b6cff, #8b5cf6)', color: '#fff', fontWeight: 700, fontSize: 16, textDecoration: 'none', boxShadow: '0 4px 24px rgba(59,108,255,0.5)', display: 'inline-block' }}>
              Open Dashboard →
            </Link>
            <Link href="/auth/login?returnTo=/dashboard" style={{ padding: '14px 28px', borderRadius: 10, background: 'rgba(255,255,255,0.08)', color: '#fff', fontWeight: 600, fontSize: 15, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.15)', display: 'inline-block' }}>
              Sign in free
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer style={{ background: '#060D1A', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '40px 24px', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 12 }}>
          <div style={{ width: 28, height: 28, borderRadius: 6, background: 'linear-gradient(135deg, #3b6cff, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 11, boxShadow: '0 2px 8px rgba(59,108,255,0.28)' }}>AG</div>
          <span style={{ fontWeight: 700, fontSize: 15, color: '#94A3B8' }}>AgentGate</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 16, flexWrap: 'wrap' }}>
          <Link href="/dashboard" style={{ color: '#64748B', fontSize: 13, textDecoration: 'none', fontWeight: 500 }}>Dashboard</Link>
          <Link href="/docs" style={{ color: '#64748B', fontSize: 13, textDecoration: 'none', fontWeight: 500 }}>API Docs</Link>
          <a href="https://github.com/DamithaPerera/AgentGate" target="_blank" rel="noopener noreferrer" style={{ color: '#64748B', fontSize: 13, textDecoration: 'none', fontWeight: 500 }}>GitHub</a>
        </div>
        <p style={{ color: '#475569', fontSize: 13, marginBottom: 4 }}>Built for the &quot;Authorized to Act: Auth0 for AI Agents&quot; Hackathon · April 2026</p>
        <p style={{ color: '#334155', fontSize: 12 }}>The authorization layer the IETF left as &quot;TODO Security&quot;</p>
      </footer>
    </main>
  );
}
