import Link from 'next/link';
import { ScrollToTop } from './ScrollToTop';
import { LandingNav } from './components/landing/LandingNav';
import { LandingFooter } from './components/landing/LandingFooter';
import { AgentGraphSVG } from './components/landing/AgentGraphSVG';
import { SectionBadge } from './components/landing/SectionBadge';
import { SectionHeading } from './components/landing/SectionHeading';
import { GateCard, GATES } from './components/landing/GateCard';
import { FeatureCard, FEATURES } from './components/landing/FeatureCard';
import { FrameworkHub } from './components/landing/FrameworkHub';
import { CodeCard } from './components/landing/CodeCard';

const STATS = [
  { value: '93%',     label: 'of AI agent projects have no authorization layer',   color: '#E11D48' },
  { value: '< 1ms',  label: 'authorization overhead per request',                   color: '#3b6cff' },
  { value: '5 Gates', label: 'every request passes through before execution',       color: '#9333EA' },
  { value: '100%',   label: 'tamper-evident audit trail coverage',                  color: '#16A34A' },
];

const STANDARDS = [
  'Auth0 Token Vault', 'Auth0 CIBA + Guardian', 'IETF draft-klrc-aiagent-auth-00',
  'NIST AI Agent Standards', 'AuthZEN (OpenID Foundation)', 'SPIFFE / WIMSE', 'OPA (CNCF Graduated)',
];

const QUICK_START = [
  {
    step: 1,
    title: 'Register your agent',
    code: `curl -X POST /api/agents/register \\
  -H "Authorization: Bearer ag_live_..." \\
  -d '{
    "name": "my-agent",
    "framework": "crewai",
    "capabilities": ["gmail.read"],
    "trustTier": "T1"
  }'
# → { "agentId": "...", "token": "eyJ..." }`,
  },
  {
    step: 2,
    title: 'Authorize every action',
    stepColor: '#16A34A',
    code: `curl -X POST /api/authorize \\
  -H "Authorization: Bearer ag_live_..." \\
  -d '{
    "agentToken": "eyJ...",
    "action": { "type": "read",
      "operation": "list_emails",
      "service": "gmail" }
  }'
# → { "allowed": true, "token": {...} }`,
  },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen" style={{ fontFamily: 'Inter, -apple-system, sans-serif' }}>

      <LandingNav />

      {/* ── Hero ────────────────────────────────────────────────── */}
      <section style={{ background: 'linear-gradient(160deg, #0A0F1E 0%, #0F1E3D 50%, #0A1628 100%)', padding: '80px 24px', position: 'relative', overflow: 'hidden' }}>
        {/* Glow orbs */}
        <div style={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,108,255,0.25) 0%, transparent 70%)', top: -200, left: '10%', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)', top: -100, right: '5%', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(34,211,165,0.08) 0%, transparent 70%)', bottom: -100, right: '30%', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 48 }} className="flex-col lg:flex-row">

          {/* LEFT: text */}
          <div className="animate-fade-in-up" style={{ flex: '1 1 0', minWidth: 0 }}>
            {/* Badge */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(59,108,255,0.15)', border: '1px solid rgba(139,92,246,0.35)', borderRadius: 999, padding: '6px 16px', marginBottom: 28 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#36B37E', display: 'inline-block', boxShadow: '0 0 8px #36B37E' }} className="animate-pulse" />
              <span style={{ color: '#93C5FD', fontSize: 13, fontWeight: 500 }}>Built for NIST AI Agent Standards · IETF draft-klrc-aiagent-auth-00</span>
            </div>

            <h1 className="animate-fade-in-up delay-100" style={{ fontSize: 'clamp(36px, 4.5vw, 60px)', fontWeight: 800, lineHeight: 1.08, color: '#fff', marginBottom: 20, letterSpacing: '-0.02em' }}>
              The{' '}
              <span style={{ background: 'linear-gradient(135deg, #60A5FA, #818CF8, #38BDF8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                missing authorization
              </span>
              {' '}layer
              <br />for AI agents
            </h1>

            <p className="animate-fade-in-up delay-200" style={{ fontSize: 17, color: '#94A3B8', marginBottom: 36, lineHeight: 1.75, maxWidth: 480 }}>
              Drop-in security middleware that gives every AI agent a cryptographic identity, evaluates every action against policies, and produces a tamper-evident audit trail — powered by Auth0.
            </p>

            {/* CTAs */}
            <div className="animate-fade-in-up delay-300" style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <Link href="/dashboard" className="hover:scale-105" style={{ padding: '14px 32px', borderRadius: 10, background: 'linear-gradient(135deg, #3b6cff, #8b5cf6)', color: '#fff', fontWeight: 700, fontSize: 15, textDecoration: 'none', boxShadow: '0 4px 24px rgba(59,108,255,0.5)', display: 'inline-block' }}>
                Open Dashboard →
              </Link>
              <Link href="/auth/login?returnTo=/dashboard" prefetch={false} style={{ padding: '14px 28px', borderRadius: 10, background: 'rgba(255,255,255,0.08)', color: '#fff', fontWeight: 600, fontSize: 15, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.15)', display: 'inline-block' }}>
                Sign in free
              </Link>
            </div>

            {/* Trust chips */}
            <div className="animate-fade-in-up delay-500" style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 32 }}>
              {['Auth0 CIBA', 'SPIFFE IDs', 'SHA-256 Audit', 'OPA Policy'].map(t => (
                <span key={t} style={{ fontSize: 12, color: '#64748B', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, padding: '4px 10px' }}>{t}</span>
              ))}
            </div>
          </div>

          {/* RIGHT: animated graph */}
          <AgentGraphSVG />
        </div>
      </section>

      {/* ── Stats strip ─────────────────────────────────────────── */}
      <section style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', padding: '40px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 32, textAlign: 'center' }}>
          {STATS.map((s, i) => (
            <div key={s.value} className={`animate-fade-in-up delay-${(i + 1) * 100}`}>
              <div style={{ fontSize: 32, fontWeight: 800, color: s.color, marginBottom: 6 }}>{s.value}</div>
              <div style={{ fontSize: 13, color: '#64748B', lineHeight: 1.5 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Five Gates ──────────────────────────────────────────── */}
      <section style={{ background: '#fff', padding: '100px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center' }}>
            <SectionBadge variant="blue">The Five Gates</SectionBadge>
            <SectionHeading
              title="Every request. Every agent. No exceptions."
              subtitle="A five-layer protocol that runs in under 1ms, invisible to agents but enforced on every call."
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            {GATES.map(gate => <GateCard key={gate.num} gate={gate} />)}
          </div>
        </div>
      </section>

      {/* ── Features — dark section ──────────────────────────────── */}
      <section style={{ background: 'linear-gradient(160deg, #0A0F1E 0%, #0F1E3D 100%)', padding: '100px 24px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,82,204,0.15) 0%, transparent 70%)', top: -100, right: -100, pointerEvents: 'none' }} />
        <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center' }}>
            <SectionBadge variant="dark">What AgentGate Builds</SectionBadge>
            <SectionHeading
              dark
              title="Enterprise-grade security for every agent"
              subtitle="Six security layers that work together to ensure no agent ever acts without authorization."
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
            {FEATURES.map(f => <FeatureCard key={f.title} feature={f} />)}
          </div>
        </div>
      </section>

      {/* ── Framework integrations ──────────────────────────────── */}
      <section style={{ background: '#fff', padding: '100px 24px', borderTop: '1px solid #E2E8F0' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center' }}>
            <SectionBadge variant="green">Framework Agnostic</SectionBadge>
            <SectionHeading
              title="One endpoint. Every agent framework."
              subtitle="Any agent that can make an HTTP request works with AgentGate. No framework lock-in."
            />
          </div>
          <FrameworkHub />
          <p style={{ textAlign: 'center', marginTop: 48, color: '#94A3B8', fontSize: 14 }}>
            All frameworks use the same single endpoint —{' '}
            <code style={{ background: '#F1F5F9', padding: '2px 8px', borderRadius: 6, fontSize: 13, color: '#3b6cff', fontFamily: 'IBM Plex Mono, monospace' }}>
              POST /api/authorize
            </code>
          </p>
        </div>
      </section>

      {/* ── Standards ───────────────────────────────────────────── */}
      <section style={{ background: '#F8FAFC', padding: '80px 24px', borderTop: '1px solid #E2E8F0' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <h2 className="animate-fade-in-up" style={{ fontSize: 28, fontWeight: 800, color: '#0F172A', marginBottom: 8 }}>Built on Real Standards</h2>
          <p className="animate-fade-in-up delay-100" style={{ color: '#64748B', fontSize: 15, marginBottom: 40 }}>Not invented here — built on IETF, NIST, CNCF, and OpenID Foundation specifications.</p>
          <div className="animate-fade-in-up delay-200" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 10 }}>
            {STANDARDS.map(s => (
              <span key={s} style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 999, padding: '7px 16px', fontSize: 13, fontWeight: 500, color: '#374151', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>{s}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Quick Start ─────────────────────────────────────────── */}
      <section style={{ background: '#fff', padding: '100px 24px', borderTop: '1px solid #E2E8F0' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <div style={{ textAlign: 'center' }}>
            <SectionBadge variant="green">Quick Start</SectionBadge>
            <SectionHeading
              title="Connect your agent in 2 API calls"
              subtitle="No SDK required. Any agent that can make HTTP requests works."
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: 20 }}>
            {QUICK_START.map(item => (
              <CodeCard key={item.step} {...item} />
            ))}
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
            <Link href="/auth/login?returnTo=/dashboard" prefetch={false} style={{ padding: '14px 28px', borderRadius: 10, background: 'rgba(255,255,255,0.08)', color: '#fff', fontWeight: 600, fontSize: 15, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.15)', display: 'inline-block' }}>
              Sign in free
            </Link>
          </div>
        </div>
      </section>

      <ScrollToTop />

      <LandingFooter />
    </main>
  );
}
