'use client';
import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { AgentRegistry } from './components/AgentRegistry';
import { LiveFeed } from './components/LiveFeed';
import { AuditTrail } from './components/AuditTrail';
import { PolicyEditor } from './components/PolicyEditor';
import { useAgentEvents } from './hooks/useAgentEvents';
import { useAgentRegistry } from './hooks/useAgentRegistry';
import { useAuditTrail } from './hooks/useAuditTrail';
import type { AgentEvent, PolicyRule } from '@/lib/types';

export default function DashboardPage() {
  const [events, setEvents] = useState<AgentEvent[]>([]);
  const [rules, setRules] = useState<PolicyRule[]>([]);
  const [demoRunning, setDemoRunning] = useState(false);
  const [demoMessage, setDemoMessage] = useState('');
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/me')
      .then(r => r.json())
      .then((d: { user: { name?: string; email?: string } | null }) => {
        if (d.user) setUserName(d.user.name ?? d.user.email ?? null);
      })
      .catch(() => {});
  }, []);

  const registry = useAgentRegistry();
  const audit = useAuditTrail();

  useEffect(() => {
    fetch('/api/policy/rules')
      .then(r => r.json())
      .then((d: { rules: PolicyRule[] }) => setRules(d.rules ?? []))
      .catch((err) => {
        console.error('[dashboard] Failed to load policy rules:', err);
        toast.error('Failed to load policy rules');
      });
  }, []);

  const handleEvent = useCallback((event: AgentEvent) => {
    setEvents(prev => [event, ...prev].slice(0, 100));
    registry.handleEvent(event);
    audit.handleEvent(event);
  }, [registry, audit]);

  useAgentEvents(handleEvent);

  const runDemo = async () => {
    setDemoRunning(true);
    setDemoMessage('Demo starting...');
    try {
      await fetch('/api/demo/run', { method: 'POST' });
      setDemoMessage('Demo running — watch the panels!');
      setTimeout(() => setDemoMessage(''), 5000);
    } catch (err) {
      console.error('[dashboard] Demo failed to start:', err);
      toast.error('Demo failed to start', { description: 'Check the server logs for details.' });
      setDemoMessage('');
    } finally {
      setDemoRunning(false);
    }
  };

  const activeCount = registry.agents.filter(a => a.status === 'active').length;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#F8FAFC', fontFamily: 'Inter, -apple-system, sans-serif' }}>

      {/* ── Header ──────────────────────────────────────────────── */}
      <header style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)', flexShrink: 0, zIndex: 50, borderBottom: '1px solid #E2E8F0' }}>
        <div style={{ maxWidth: '100%', padding: '0 20px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          {/* Left */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #3B82F6, #0052CC)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 12 }}>AG</div>
              <span style={{ fontWeight: 700, fontSize: 15, color: '#0F172A' }}>AgentGate</span>
            </Link>
            <div style={{ width: 1, height: 20, background: '#E2E8F0' }} />
            <span style={{ fontSize: 13, color: '#64748B', fontWeight: 500 }}>Security Dashboard</span>
          </div>

          {/* Center — status badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 999, padding: '4px 10px' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#16A34A', display: 'inline-block' }} className="animate-pulse" />
              <span style={{ fontSize: 12, color: '#15803D', fontWeight: 500 }}>{activeCount} active</span>
            </div>
            {demoMessage && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 999, padding: '4px 10px' }}>
                <span style={{ fontSize: 12, color: '#1D4ED8', fontWeight: 500 }}>{demoMessage}</span>
              </div>
            )}
          </div>

          {/* Right */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {!userName && (
              <button onClick={runDemo} disabled={demoRunning}
                style={{ padding: '6px 14px', borderRadius: 8, background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE', fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: demoRunning ? 0.5 : 1 }}>
                {demoRunning ? '⟳ Running...' : '▶ Run Demo'}
              </button>
            )}
            {userName && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 8, padding: '5px 12px' }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(135deg, #3B82F6, #0052CC)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff' }}>
                  {userName.charAt(0).toUpperCase()}
                </div>
                <span style={{ fontSize: 13, color: '#374151', fontWeight: 500, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userName}</span>
              </div>
            )}
            <Link href={userName ? '/auth/logout' : '/auth/login?returnTo=/dashboard'}
              style={{ padding: '6px 14px', borderRadius: 8, background: userName ? '#FFF1F2' : 'linear-gradient(135deg, #0052CC, #0065FF)', color: userName ? '#DC2626' : '#fff', border: userName ? '1px solid #FECDD3' : 'none', fontSize: 13, fontWeight: 600, textDecoration: 'none', boxShadow: userName ? 'none' : '0 2px 8px rgba(0,82,204,0.3)' }}>
              {userName ? 'Log out' : 'Log in'}
            </Link>
          </div>
        </div>
      </header>

      {/* ── Policy Engine bar ────────────────────────────────────── */}
      <div style={{ background: '#fff', borderBottom: '1px solid #E2E8F0', padding: '16px 20px', flexShrink: 0 }}>
        <div style={{ maxWidth: '100%', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 6, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>⚖️</div>
          <span style={{ fontWeight: 700, fontSize: 13, color: '#0F172A' }}>Policy Engine</span>
          <span style={{ fontSize: 12, color: '#64748B', background: '#F1F5F9', padding: '2px 8px', borderRadius: 999, border: '1px solid #E2E8F0' }}>{rules.length} rules active</span>
        </div>
        <PolicyEditor rules={rules} onRulesChange={setRules} />
      </div>

      {/* ── 3-Panel Grid ─────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', minHeight: 0, overflow: 'auto' }}
        className="md:overflow-hidden md:grid-cols-3">

        {/* Panel 1 — Agent Registry */}
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: 400, borderRight: '1px solid #E2E8F0' }}>
          <div style={{ padding: '14px 16px', background: '#fff', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: 6, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🤖</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, color: '#0F172A' }}>Agent Registry</div>
                <div style={{ fontSize: 11, color: '#64748B', marginTop: 1 }}>{activeCount} of {registry.agents.length} active</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 999, padding: '3px 8px' }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#16A34A', display: 'inline-block' }} className="animate-pulse" />
              <span style={{ fontSize: 11, color: '#16A34A', fontWeight: 600 }}>LIVE</span>
            </div>
          </div>
          <div style={{ flex: 1, padding: 12, overflow: 'hidden', background: '#F8FAFC' }}>
            <AgentRegistry
              agents={registry.agents}
              onRevoke={registry.revokeAgent}
              onRevokeService={registry.revokeService}
              onPanic={registry.panicRevoke}
              isLoggedIn={!!userName}
            />
          </div>
        </div>

        {/* Panel 2 — Live Feed */}
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: 400, borderRight: '1px solid #E2E8F0' }}>
          <div style={{ padding: '14px 16px', background: '#fff', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: 6, background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>⚡</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, color: '#0F172A' }}>Live Feed</div>
                <div style={{ fontSize: 11, color: '#64748B', marginTop: 1 }}>Real-time authorization events</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 999, padding: '3px 8px' }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#3B82F6', display: 'inline-block' }} className="animate-pulse" />
              <span style={{ fontSize: 11, color: '#1D4ED8', fontWeight: 600 }}>SSE</span>
            </div>
          </div>
          <div style={{ flex: 1, padding: 12, overflow: 'hidden', background: '#F8FAFC' }}>
            <LiveFeed events={events} isLoggedIn={!!userName} />
          </div>
        </div>

        {/* Panel 3 — Audit Trail */}
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: 400, borderLeft: '1px solid #E2E8F0' }}>
          <div style={{ padding: '14px 16px', background: '#fff', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: 6, background: '#F5F3FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🔗</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, color: '#0F172A' }}>Audit Trail</div>
                <div style={{ fontSize: 11, color: '#64748B', marginTop: 1 }}>{audit.entries.length} entries · SHA-256 chain</div>
              </div>
            </div>
            <div style={{ background: '#F5F3FF', border: '1px solid #DDD6FE', borderRadius: 999, padding: '3px 8px' }}>
              <span style={{ fontSize: 11, color: '#7C3AED', fontWeight: 600 }}>tamper-evident</span>
            </div>
          </div>
          <div style={{ flex: 1, padding: 12, overflow: 'hidden', background: '#F8FAFC' }}>
            <AuditTrail
              entries={audit.entries}
              onExport={audit.exportAudit}
              onVerify={audit.verifyChain}
            />
          </div>
        </div>
      </div>

      {/* ── Status bar ───────────────────────────────────────────── */}
      <div style={{ background: '#F1F5F9', borderTop: '1px solid #E2E8F0', padding: '8px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <span style={{ fontSize: 11, color: '#64748B' }}>AgentGate v0.1 · Auth0 Token Vault · OPA Policy Engine · CIBA Consent</span>
        <span style={{ fontSize: 11, color: '#64748B' }}>Authorized to Act: Auth0 for AI Agents Hackathon</span>
      </div>
    </div>
  );
}
