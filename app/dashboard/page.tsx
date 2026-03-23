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
import { IconBox, SectionHeader, StatusDot, LivePill } from './components/ui';

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
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] font-sans">

      {/* ── Header ──────────────────────────────────────────────── */}
      <header className="bg-white/95 backdrop-blur-md shrink-0 z-50 border-b border-[#E2E8F0]">
        <div className="w-full px-5 h-14 flex items-center justify-between gap-3">
          {/* Left */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 no-underline">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#3B82F6] to-[#0052CC] flex items-center justify-center text-white font-extrabold text-xs">AG</div>
              <span className="font-bold text-[15px] text-[#0F172A]">AgentGate</span>
            </Link>
            <div className="w-px h-5 bg-[#E2E8F0]" />
            <span className="text-[13px] text-[#64748B] font-medium">Security Dashboard</span>
          </div>

          {/* Center — status badges */}
          <div className="flex items-center gap-2 flex-1 justify-center">
            <div className="flex items-center gap-1.5 bg-[#F0FDF4] border border-[#BBF7D0] rounded-full px-2.5 py-1">
              <StatusDot color="#16A34A" pulse size="sm" />
              <span className="text-xs text-[#15803D] font-medium">{activeCount} active</span>
            </div>
            {demoMessage && (
              <div className="flex items-center gap-1.5 bg-[#EFF6FF] border border-[#BFDBFE] rounded-full px-2.5 py-1">
                <span className="text-xs text-[#1D4ED8] font-medium">{demoMessage}</span>
              </div>
            )}
          </div>

          {/* Right */}
          <div className="flex items-center gap-2">
            {!userName && (
              <button onClick={runDemo} disabled={demoRunning}
                className="px-3.5 py-1.5 rounded-lg bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] text-[13px] font-semibold cursor-pointer"
                style={{ opacity: demoRunning ? 0.5 : 1 }}>
                {demoRunning ? '⟳ Running...' : '▶ Run Demo'}
              </button>
            )}
            {userName && (
              <div className="flex items-center gap-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-[5px]">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#0052CC] flex items-center justify-center text-[10px] font-bold text-white">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <span className="text-[13px] text-[#374151] font-medium max-w-[120px] truncate">{userName}</span>
              </div>
            )}
            <Link href={userName ? '/auth/logout' : '/auth/login?returnTo=/dashboard'}
              className="px-3.5 py-1.5 rounded-lg text-[13px] font-semibold no-underline"
              style={userName
                ? { background: '#FFF1F2', color: '#DC2626', border: '1px solid #FECDD3' }
                : { background: 'linear-gradient(135deg, #0052CC, #0065FF)', color: '#fff', border: 'none', boxShadow: '0 2px 8px rgba(0,82,204,0.3)' }
              }>
              {userName ? 'Log out' : 'Log in'}
            </Link>
          </div>
        </div>
      </header>

      {/* ── Policy Engine bar ────────────────────────────────────── */}
      <div className="bg-white border-b border-[#E2E8F0] px-5 py-4 shrink-0">
        <div className="w-full flex items-center gap-2.5 mb-2.5">
          <IconBox icon="⚖️" bgClass="bg-[#EFF6FF]" />
          <span className="font-bold text-[13px] text-[#0F172A]">Policy Engine</span>
          <span className="text-xs text-[#64748B] bg-[#F1F5F9] px-2 py-0.5 rounded-full border border-[#E2E8F0]">{rules.length} rules active</span>
        </div>
        <PolicyEditor rules={rules} onRulesChange={setRules} />
      </div>

      {/* ── 3-Panel Grid ─────────────────────────────────────────── */}
      <div className="flex-1 grid overflow-auto md:overflow-hidden md:grid-cols-3"
        style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', minHeight: 0 }}>

        {/* Panel 1 — Agent Registry */}
        <div className="flex flex-col min-h-[400px] border-r border-[#E2E8F0]">
          <SectionHeader
            icon="🤖"
            iconBgClass="bg-[#EFF6FF]"
            title="Agent Registry"
            subtitle={`${activeCount} of ${registry.agents.length} active`}
            right={
              <LivePill
                dotColor="#16A34A"
                textColor="text-[#16A34A]"
                bgClass="bg-[#F0FDF4]"
                borderClass="border-[#BBF7D0]"
                label="LIVE"
              />
            }
          />
          <div className="flex-1 p-3 overflow-hidden bg-[#F8FAFC]">
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
        <div className="flex flex-col min-h-[400px] border-r border-[#E2E8F0]">
          <SectionHeader
            icon="⚡"
            iconBgClass="bg-[#F0FDF4]"
            title="Live Feed"
            subtitle="Real-time authorization events"
            right={
              <LivePill
                dotColor="#3B82F6"
                textColor="text-[#1D4ED8]"
                bgClass="bg-[#EFF6FF]"
                borderClass="border-[#BFDBFE]"
                label="SSE"
              />
            }
          />
          <div className="flex-1 p-3 overflow-hidden bg-[#F8FAFC]">
            <LiveFeed events={events} isLoggedIn={!!userName} />
          </div>
        </div>

        {/* Panel 3 — Audit Trail */}
        <div className="flex flex-col min-h-[400px] border-l border-[#E2E8F0]">
          <SectionHeader
            icon="🔗"
            iconBgClass="bg-[#F5F3FF]"
            title="Audit Trail"
            subtitle={`${audit.entries.length} entries · SHA-256 chain`}
            right={
              <LivePill
                textColor="text-[#7C3AED]"
                bgClass="bg-[#F5F3FF]"
                borderClass="border-[#DDD6FE]"
                label="tamper-evident"
                showDot={false}
              />
            }
          />
          <div className="flex-1 p-3 overflow-hidden bg-[#F8FAFC]">
            <AuditTrail
              entries={audit.entries}
              onExport={audit.exportAudit}
              onVerify={audit.verifyChain}
            />
          </div>
        </div>
      </div>

      {/* ── Status bar ───────────────────────────────────────────── */}
      <div className="bg-[#F1F5F9] border-t border-[#E2E8F0] px-5 py-2 flex items-center justify-between shrink-0">
        <span className="text-[11px] text-[#64748B]">AgentGate v0.1 · Auth0 Token Vault · OPA Policy Engine · CIBA Consent</span>
        <span className="text-[11px] text-[#64748B]">Authorized to Act: Auth0 for AI Agents Hackathon</span>
      </div>
    </div>
  );
}
