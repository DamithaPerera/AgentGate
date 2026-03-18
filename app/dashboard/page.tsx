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

  // Load initial rules
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
    <div className="min-h-screen bg-[#080f1a] text-slate-100 flex flex-col">
      {/* Header */}
      <header className="border-b border-[#1e3a5f] px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-teal-700 rounded-lg flex items-center justify-center text-white font-bold text-xs">AG</div>
            <span className="font-semibold tracking-tight">AgentGate</span>
          </Link>
          <span className="text-slate-600">·</span>
          <span className="text-sm text-slate-500">Security Dashboard</span>
        </div>

        <div className="flex items-center gap-2">
          {demoMessage && (
            <span className="text-sm text-teal-400 mr-2">{demoMessage}</span>
          )}
          <button
            onClick={runDemo}
            disabled={demoRunning}
            className="bg-teal-700 hover:bg-teal-600 disabled:opacity-50 text-white text-sm px-4 py-1.5 rounded-lg font-medium transition-colors"
          >
            {demoRunning ? 'Running...' : 'Run Demo'}
          </button>
          <Link
            href="/api/auth/login"
            className="text-sm text-slate-400 hover:text-slate-200 border border-[#1e3a5f] hover:border-teal-700 px-3 py-1.5 rounded-lg transition-colors"
          >
            Login
          </Link>
        </div>
      </header>

      {/* Policy Editor Bar */}
      <div className="border-b border-[#1e3a5f] px-4 py-3 flex-shrink-0">
        <div className="max-w-full">
          <div className="text-xs text-slate-500 uppercase tracking-wider mb-2">Policy Engine</div>
          <PolicyEditor rules={rules} onRulesChange={setRules} />
        </div>
      </div>

      {/* 3-Panel Grid */}
      <div className="flex-1 grid grid-cols-3 gap-0 min-h-0 overflow-hidden">
        {/* Panel 1: Agent Registry */}
        <div className="border-r border-[#1e3a5f] flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-[#1e3a5f] flex-shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold">Agent Registry</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {registry.agents.filter(a => a.status === 'active').length} active agents
                </p>
              </div>
              <span className="w-2 h-2 bg-teal-400 rounded-full animate-pulse" />
            </div>
          </div>
          <div className="flex-1 p-4 overflow-hidden">
            <AgentRegistry
              agents={registry.agents}
              onRevoke={registry.revokeAgent}
              onRevokeService={registry.revokeService}
              onPanic={registry.panicRevoke}
            />
          </div>
        </div>

        {/* Panel 2: Live Feed */}
        <div className="border-r border-[#1e3a5f] flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-[#1e3a5f] flex-shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold">Live Feed</h2>
                <p className="text-xs text-slate-500 mt-0.5">Real-time authorization events</p>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-xs text-slate-500">SSE</span>
              </div>
            </div>
          </div>
          <div className="flex-1 p-4 overflow-hidden">
            <LiveFeed events={events} />
          </div>
        </div>

        {/* Panel 3: Audit Trail */}
        <div className="flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-[#1e3a5f] flex-shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold">Audit Trail</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {audit.entries.length} entries · SHA-256 hash chain
                </p>
              </div>
              <span className="text-xs text-teal-500">tamper-evident</span>
            </div>
          </div>
          <div className="flex-1 p-4 overflow-hidden">
            <AuditTrail
              entries={audit.entries}
              onExport={audit.exportAudit}
              onVerify={audit.verifyChain}
            />
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="border-t border-[#1e3a5f] px-4 py-2 flex items-center gap-4 text-xs text-slate-600 flex-shrink-0">
        <span>AgentGate v0.1 · Auth0 Token Vault · OPA Policy Engine · CIBA Consent</span>
        <span className="ml-auto">Built for &quot;Authorized to Act: Auth0 for AI Agents&quot; Hackathon</span>
      </div>
    </div>
  );
}
