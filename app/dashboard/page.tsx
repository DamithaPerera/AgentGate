'use client';
import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
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

  const registry = useAgentRegistry();
  const audit = useAuditTrail();

  useEffect(() => {
    fetch('/api/policy/rules')
      .then(r => r.json())
      .then((d: { rules: PolicyRule[] }) => setRules(d.rules ?? []))
      .catch(() => {});
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
    } catch {
      setDemoMessage('Demo failed to start');
    } finally {
      setDemoRunning(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--color-bg-page)', color: 'var(--color-text-high)' }}>

      {/* Top navigation bar — Atlassian style */}
      <header className="flex items-center justify-between px-4 h-12 flex-shrink-0 z-50"
        style={{ background: 'var(--color-brand)', color: '#fff' }}>
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-6 h-6 bg-white rounded flex items-center justify-center font-bold text-xs"
              style={{ color: 'var(--color-brand)' }}>AG</div>
            <span className="font-semibold text-sm text-white">AgentGate</span>
          </Link>
          <span className="opacity-40 text-white">|</span>
          <span className="text-xs text-white opacity-75">Security Dashboard</span>
        </div>

        <div className="flex items-center gap-2">
          {demoMessage && (
            <span className="text-xs text-white opacity-90 mr-2">{demoMessage}</span>
          )}
          <button
            onClick={runDemo}
            disabled={demoRunning}
            className="text-xs font-semibold px-3 py-1.5 rounded disabled:opacity-50 transition-opacity hover:opacity-90"
            style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)' }}>
            {demoRunning ? 'Running...' : '▶ Run Demo'}
          </button>
          <Link href="/auth/login"
            className="text-xs font-medium px-3 py-1.5 rounded transition-opacity hover:opacity-90"
            style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.25)' }}>
            Log in
          </Link>
        </div>
      </header>

      {/* Policy Editor Bar */}
      <div className="px-4 py-3 flex-shrink-0" style={{ background: 'var(--color-bg-surface)', borderBottom: '1px solid var(--color-border)' }}>
        <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-low)' }}>Policy Engine</div>
        <PolicyEditor rules={rules} onRulesChange={setRules} />
      </div>

      {/* 3-Panel Grid */}
      <div className="flex-1 grid grid-cols-3 min-h-0 overflow-hidden">

        {/* Panel 1: Agent Registry */}
        <div className="flex flex-col overflow-hidden" style={{ borderRight: '1px solid var(--color-border)' }}>
          <div className="px-4 py-2.5 flex items-center justify-between flex-shrink-0"
            style={{ background: 'var(--color-bg-sunken)', borderBottom: '1px solid var(--color-border)' }}>
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-text-medium)' }}>Agent Registry</h2>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-low)' }}>
                {registry.agents.filter(a => a.status === 'active').length} active
              </p>
            </div>
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--color-success)' }} />
          </div>
          <div className="flex-1 p-3 overflow-hidden" style={{ background: 'var(--color-bg-surface)' }}>
            <AgentRegistry
              agents={registry.agents}
              onRevoke={registry.revokeAgent}
              onRevokeService={registry.revokeService}
              onPanic={registry.panicRevoke}
            />
          </div>
        </div>

        {/* Panel 2: Live Feed */}
        <div className="flex flex-col overflow-hidden" style={{ borderRight: '1px solid var(--color-border)' }}>
          <div className="px-4 py-2.5 flex items-center justify-between flex-shrink-0"
            style={{ background: 'var(--color-bg-sunken)', borderBottom: '1px solid var(--color-border)' }}>
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-text-medium)' }}>Live Feed</h2>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-low)' }}>Real-time events</p>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--color-success)' }} />
              <span className="text-xs" style={{ color: 'var(--color-text-subtle)' }}>SSE</span>
            </div>
          </div>
          <div className="flex-1 p-3 overflow-hidden" style={{ background: 'var(--color-bg-surface)' }}>
            <LiveFeed events={events} />
          </div>
        </div>

        {/* Panel 3: Audit Trail */}
        <div className="flex flex-col overflow-hidden">
          <div className="px-4 py-2.5 flex items-center justify-between flex-shrink-0"
            style={{ background: 'var(--color-bg-sunken)', borderBottom: '1px solid var(--color-border)' }}>
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-text-medium)' }}>Audit Trail</h2>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-low)' }}>
                {audit.entries.length} entries · SHA-256 chain
              </p>
            </div>
            <span className="text-xs font-medium" style={{ color: 'var(--color-brand)' }}>tamper-evident</span>
          </div>
          <div className="flex-1 p-3 overflow-hidden" style={{ background: 'var(--color-bg-surface)' }}>
            <AuditTrail
              entries={audit.entries}
              onExport={audit.exportAudit}
              onVerify={audit.verifyChain}
            />
          </div>
        </div>
      </div>

      {/* Status bar */}
      <div className="px-4 py-1.5 flex items-center gap-4 text-xs flex-shrink-0"
        style={{ background: 'var(--color-bg-sunken)', borderTop: '1px solid var(--color-border)', color: 'var(--color-text-subtle)' }}>
        <span>AgentGate v0.1 · Auth0 Token Vault · OPA Policy Engine · CIBA Consent</span>
        <span className="ml-auto">Authorized to Act: Auth0 for AI Agents Hackathon</span>
      </div>
    </div>
  );
}
