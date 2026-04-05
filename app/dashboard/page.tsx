'use client';
import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { AgentRegistry } from './components/AgentRegistry';
import { LiveFeed } from './components/LiveFeed';
import { AuditTrail } from './components/AuditTrail';
import { PolicyEditor } from './components/PolicyEditor';
import { useAgentEvents } from './hooks/useAgentEvents';
import { useAgentRegistry } from './hooks/useAgentRegistry';
import { useAuditTrail } from './hooks/useAuditTrail';
import type { AgentEvent, PolicyRule } from '@/lib/types';
import { StatusDot, KpiCard, DashboardSidebar, TabConfig, SectionHeader, LivePill, MobileMenuButton, ResponsiveGrid } from './components/ui';
import { DecisionDonut } from './components/DecisionDonut';
import { ActivitySparkline } from './components/ActivitySparkline';
import { EventTypeBar } from './components/EventTypeBar';
import { DecisionRatioBar } from './components/DecisionRatioBar';
import { ApiKeys } from './components/ApiKeys';

export default function DashboardPage() {
  const [events, setEvents] = useState<AgentEvent[]>([]);
  const [rules, setRules] = useState<PolicyRule[]>([]);
  const [demoRunning, setDemoRunning] = useState(false);
  const [demoMessage, setDemoMessage] = useState('');
  const [userName, setUserName] = useState<string | null>(null);
  const [panicConfirm, setPanicConfirm] = useState(false);

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

  const [activeTab, setActiveTab] = useState<'overview'|'agents'|'feed'|'audit'|'policy'|'keys'>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const activeCount = registry.agents.filter(a => a.status === 'active').length;

  const services = ['github', 'gmail', 'calendar'];
  const activeAgents = registry.agents.filter(a => a.status === 'active');
  const hasService = (s: string) => activeAgents.some(a => a.capabilities.some(c => c.startsWith(s + '.')));
  const serviceLabel = (s: string) => s === 'gmail' ? 'Google (Gmail)' : s.charAt(0).toUpperCase() + s.slice(1);

  // KPI computations
  const today = new Date().toDateString();
  const decisionsToday = audit.entries.filter(e => new Date(e.timestamp).toDateString() === today).length;
  const allowedCount = audit.entries.filter(e => e.decision === 'ALLOWED').length;
  const allowRate = audit.entries.length > 0 ? Math.round((allowedCount / audit.entries.length) * 100) : 0;
  const activePolicies = rules.filter(r => r.enabled).length;

  const kpis = [
    { label: 'Active Agents',    value: activeCount,      sub: `of ${registry.agents.length} registered`, color: '#12b76a', bg: '#e7faf0', icon: '🤖' },
    { label: 'Decisions Today',  value: decisionsToday,   sub: `${audit.entries.length} total`,            color: '#3b6cff', bg: '#ebf0ff', icon: '⚡' },
    { label: 'Allow Rate',       value: `${allowRate}%`,  sub: `${allowedCount} allowed`,                  color: '#8b5cf6', bg: '#f3f0ff', icon: '✅' },
    { label: 'Active Policies',  value: activePolicies,   sub: `${rules.length} total rules`,              color: '#f59e0b', bg: '#fffbeb', icon: '⚖️' },
  ];

  const tabs: readonly TabConfig[] = [
    { id: 'overview', label: 'Overview',  icon: '📊', color: '#3b6cff' },
    { id: 'agents',   label: 'Agents',    icon: '🤖', color: '#12b76a', badge: activeCount },
    { id: 'feed',     label: 'Live Feed', icon: '⚡', color: '#f59e0b', badge: events.length },
    { id: 'audit',    label: 'Audit',     icon: '🔗', color: '#8b5cf6', badge: audit.entries.length },
    { id: 'policy',   label: 'Policy',    icon: '⚙️', color: '#f97316', badge: activePolicies },
    { id: 'keys',     label: 'API Keys',  icon: '🔑', color: '#06b6d4' },
  ];

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}
    >
      {/* ── Dark sidebar ─────────────────────────────────────────────── */}
      <DashboardSidebar
        tabs={tabs}
        activeId={activeTab}
        onChange={id => setActiveTab(id as typeof activeTab)}
        userName={userName}
        activeCount={activeCount}
        logoutHref="/auth/logout"
        loginHref="/auth/login?returnTo=/dashboard"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* ── Right content area ───────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-auto" style={{ background: '#f6f7fb' }}>

        {/* ── Topbar ──────────────────────────────────────────────────── */}
        <header
          className="sticky top-0 z-40 shrink-0"
          style={{
            background: 'rgba(246,247,251,0.9)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderBottom: '1px solid #e2e4ef',
          }}
        >
          <div className="w-full px-5 h-13 flex items-center justify-between gap-3" style={{ height: 52 }}>

            {/* Left — hamburger (mobile) + section label */}
            <div className="flex items-center gap-2.5">
              <MobileMenuButton onClick={() => setSidebarOpen(true)} />
              <span className="text-[14px] font-bold text-[#1a1d2e]">
                {tabs.find(t => t.id === activeTab)?.label ?? 'Overview'}
              </span>
            </div>

            {/* Center — status + demo message */}
            <div className="flex items-center gap-2 flex-1 justify-center">
              {demoMessage && (
                <div
                  className="flex items-center gap-1.5 rounded-full px-3 py-[5px]"
                  style={{ background: '#ebf0ff', border: '1px solid #3b6cff33' }}
                >
                  <span className="text-[11px] text-[#3b6cff] font-medium">{demoMessage}</span>
                </div>
              )}
            </div>

            {/* Right — Run Demo */}
            <div className="flex items-center gap-2">
              <button
                onClick={runDemo}
                disabled={demoRunning}
                className="flex items-center gap-2 px-4 py-[7px] rounded-[10px] text-white font-semibold text-[13px] border-none transition-all"
                style={{
                  background: demoRunning
                    ? 'linear-gradient(135deg, #5c6078, #9498b3)'
                    : 'linear-gradient(135deg, #3b6cff, #6b8fff)',
                  boxShadow: demoRunning ? 'none' : '0 2px 8px rgba(59,108,255,0.28)',
                  cursor: demoRunning ? 'not-allowed' : 'pointer',
                }}
              >
                {demoRunning ? (
                  <>
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" className="animate-spin shrink-0">
                      <circle cx="6.5" cy="6.5" r="5.5" stroke="rgba(255,255,255,0.3)" strokeWidth="2"/>
                      <path d="M6.5 1a5.5 5.5 0 0 1 5.5 5.5" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    Running Demo…
                  </>
                ) : (
                  <>
                    <svg width="11" height="13" viewBox="0 0 11 13" fill="white" className="shrink-0">
                      <path d="M0 0L11 6.5L0 13V0Z"/>
                    </svg>
                    Run Demo
                  </>
                )}
              </button>
            </div>
          </div>
        </header>

        {/* ── Main content ─────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col gap-5 p-5">

        {/* ── KPI Cards (Overview only) ──────────────────────────────── */}
        {activeTab === 'overview' && (
          <ResponsiveGrid cols={4}>
            {kpis.map((kpi, i) => (
              <KpiCard
                key={kpi.label}
                label={kpi.label}
                value={kpi.value}
                sub={kpi.sub}
                icon={kpi.icon}
                color={kpi.color}
                delay={`${i * 0.05}s`}
              />
            ))}
          </ResponsiveGrid>
        )}

        {/* ── Analytics Row (Overview only) ─────────────────────────── */}
        {activeTab === 'overview' && (
        <ResponsiveGrid cols={4} gap={5}>

          {/* Chart: Total Events by Type */}
          <div className="bg-white rounded-[14px] px-5 py-4 animate-fadeUp"
            style={{ border: '1px solid #e2e4ef', boxShadow: '0 1px 3px rgba(0,0,0,.04)', animationDelay: '0s' }}>
            <span className="text-[11px] text-[#9498b3] uppercase tracking-wide font-semibold block mb-2"
              style={{ fontFamily: 'var(--font-ibm-plex-mono)' }}>Total Events</span>
            <EventTypeBar entries={audit.entries} />
          </div>

          {/* Chart: Decision Ratio Bar */}
          <div className="bg-white rounded-[14px] px-5 py-4 animate-fadeUp"
            style={{ border: '1px solid #e2e4ef', boxShadow: '0 1px 3px rgba(0,0,0,.04)', animationDelay: '0.06s' }}>
            <span className="text-[11px] text-[#9498b3] uppercase tracking-wide font-semibold block mb-2"
              style={{ fontFamily: 'var(--font-ibm-plex-mono)' }}>Allow Rate</span>
            <DecisionRatioBar entries={audit.entries} />
          </div>

          {/* Chart: Decision Donut */}
          <div className="bg-white rounded-[14px] px-5 py-4 animate-fadeUp"
            style={{ border: '1px solid #e2e4ef', boxShadow: '0 1px 3px rgba(0,0,0,.04)', animationDelay: '0.12s' }}>
            <span className="text-[11px] text-[#9498b3] uppercase tracking-wide font-semibold block mb-2"
              style={{ fontFamily: 'var(--font-ibm-plex-mono)' }}>Decision Breakdown</span>
            <DecisionDonut entries={audit.entries} />
          </div>

          {/* Chart: Activity Sparkline */}
          <div className="bg-white rounded-[14px] px-5 py-4 animate-fadeUp"
            style={{ border: '1px solid #e2e4ef', boxShadow: '0 1px 3px rgba(0,0,0,.04)', animationDelay: '0.18s' }}>
            <span className="text-[11px] text-[#9498b3] uppercase tracking-wide font-semibold block mb-2"
              style={{ fontFamily: 'var(--font-ibm-plex-mono)' }}>Activity</span>
            <ActivitySparkline events={events} />
          </div>
        </ResponsiveGrid>

        )}

        {/* ── Policy Engine card (Overview only) ─────────────────────── */}
        {activeTab === 'overview' && <div
          className="animate-fadeUp bg-white rounded-[14px] overflow-hidden"
          style={{
            border: '1px solid #e2e4ef',
            boxShadow: '0 1px 3px rgba(0,0,0,.04),0 1px 2px rgba(0,0,0,.03)',
            animationDelay: '0.22s',
          }}
        >
          <SectionHeader
            icon="⚙️" iconVariant="blue" accentColor="#f97316"
            title="Policy Engine"
            subtitle={`${activePolicies} active · OPA-style evaluation`}
            right={<LivePill textColor="text-[#f97316]" bgClass="bg-[#fff7ed]" borderClass="border-[#f9731633]" label={`${rules.length} rules`} showDot={false} />}
          />
          <div className="px-5 py-4">
            <PolicyEditor rules={rules} onRulesChange={setRules} />
          </div>
        </div>}

        {/* ── 3-Panel Grid (Overview only) ──────────────────────────── */}
        {activeTab === 'overview' && <ResponsiveGrid cols={3} gap={5} className="animate-fadeUp">
          {/* Panel 1 — Agent Registry */}
          <div
            className="bg-white rounded-[14px] flex flex-col overflow-hidden"
            style={{
              border: '1px solid #e2e4ef',
              boxShadow: '0 1px 3px rgba(0,0,0,.04),0 1px 2px rgba(0,0,0,.03)',
              minHeight: '420px',
            }}
          >
            <SectionHeader
              icon="🤖" iconVariant="green" accentColor="#12b76a"
              title="Agent Registry"
              subtitle={`${activeCount} of ${registry.agents.length} active`}
              right={<LivePill dotColor="#12b76a" textColor="text-[#12b76a]" bgClass="bg-[#e7faf0]" borderClass="border-[#12b76a33]" label="LIVE" />}
            />
            {/* Panel body */}
            <div className="flex-1 overflow-hidden">
              <AgentRegistry
                agents={registry.agents}
                onRevoke={registry.revokeAgent}
              />
            </div>
          </div>

          {/* Panel 2 — Live Feed */}
          <div
            className="bg-white rounded-[14px] flex flex-col overflow-hidden"
            style={{
              border: '1px solid #e2e4ef',
              boxShadow: '0 1px 3px rgba(0,0,0,.04),0 1px 2px rgba(0,0,0,.03)',
              minHeight: '420px',
            }}
          >
            <SectionHeader
              icon="⚡" iconVariant="orange" accentColor="#f59e0b"
              title="Live Feed"
              subtitle="Real-time authorization events"
              right={<LivePill dotColor="#f59e0b" textColor="text-[#f59e0b]" bgClass="bg-[#fffbeb]" borderClass="border-[#f59e0b33]" label="LIVE" />}
            />
            {/* Panel body */}
            <div className="flex-1 overflow-hidden">
              <LiveFeed events={events} isLoggedIn={!!userName} />
            </div>
          </div>

          {/* Panel 3 — Audit Trail */}
          <div
            className="bg-white rounded-[14px] flex flex-col overflow-hidden"
            style={{
              border: '1px solid #e2e4ef',
              boxShadow: '0 1px 3px rgba(0,0,0,.04),0 1px 2px rgba(0,0,0,.03)',
              minHeight: '420px',
            }}
          >
            <SectionHeader
              icon="🔗" iconVariant="purple" accentColor="#8b5cf6"
              title="Audit Trail"
              subtitle={`${audit.entries.length} entries · SHA-256 chain`}
              right={<LivePill textColor="text-[#8b5cf6]" bgClass="bg-[#f3f0ff]" borderClass="border-[#8b5cf633]" label="tamper-evident" showDot={false} />}
            />
            <div className="flex-1 overflow-hidden">
              <AuditTrail entries={audit.entries} onExport={audit.exportAudit} onVerify={audit.verifyChain} />
            </div>
          </div>
        </ResponsiveGrid>}

        {/* ── Full-width tab panels ──────────────────────────────────── */}
        {activeTab === 'agents' && (
          <div className="bg-white rounded-[14px] flex flex-col overflow-hidden animate-fadeUp" style={{ border: '1px solid #12b76a28', boxShadow: '0 2px 8px #12b76a10', minHeight: 500 }}>
            <SectionHeader
              icon="🤖" iconVariant="green" accentColor="#12b76a"
              title="Agent Registry"
              subtitle={`${activeCount} of ${registry.agents.length} active`}
              right={<LivePill dotColor="#12b76a" textColor="text-[#12b76a]" bgClass="bg-[#e7faf0]" borderClass="border-[#12b76a33]" label="LIVE" />}
            />
            <div className="flex-1 overflow-hidden">
              <AgentRegistry agents={registry.agents} onRevoke={registry.revokeAgent} />
            </div>
          </div>
        )}

        {activeTab === 'feed' && (
          <div className="bg-white rounded-[14px] flex flex-col overflow-hidden animate-fadeUp" style={{ border: '1px solid #f59e0b28', boxShadow: '0 2px 8px #f59e0b10', minHeight: 500 }}>
            <SectionHeader
              icon="⚡" iconVariant="orange" accentColor="#f59e0b"
              title="Live Feed"
              subtitle={`${events.length} events · Real-time authorization stream`}
              right={<LivePill dotColor="#f59e0b" textColor="text-[#f59e0b]" bgClass="bg-[#fffbeb]" borderClass="border-[#f59e0b33]" label="LIVE" />}
            />
            <div className="flex-1 overflow-hidden">
              <LiveFeed events={events} isLoggedIn={!!userName} />
            </div>
          </div>
        )}

        {activeTab === 'audit' && (
          <div className="bg-white rounded-[14px] flex flex-col overflow-hidden animate-fadeUp" style={{ border: '1px solid #8b5cf628', boxShadow: '0 2px 8px #8b5cf610', minHeight: 500 }}>
            <SectionHeader
              icon="🔗" iconVariant="purple" accentColor="#8b5cf6"
              title="Audit Trail"
              subtitle={`${audit.entries.length} entries · SHA-256 hash chain`}
              right={<LivePill textColor="text-[#8b5cf6]" bgClass="bg-[#f3f0ff]" borderClass="border-[#8b5cf633]" label="tamper-evident" showDot={false} />}
            />
            <div className="flex-1 overflow-hidden">
              <AuditTrail entries={audit.entries} onExport={audit.exportAudit} onVerify={audit.verifyChain} />
            </div>
          </div>
        )}

        {activeTab === 'policy' && (
          <div className="bg-white rounded-[14px] overflow-hidden animate-fadeUp" style={{ border: '1px solid #f9731628', boxShadow: '0 2px 8px #f9731610' }}>
            <SectionHeader
              icon="⚙️" iconVariant="blue" accentColor="#f97316"
              title="Policy Engine"
              subtitle={`${activePolicies} active rules · OPA-style evaluation`}
              right={<LivePill textColor="text-[#f97316]" bgClass="bg-[#fff7ed]" borderClass="border-[#f9731633]" label={`${rules.length} rules`} showDot={false} />}
            />
            <div className="px-5 py-4">
              <PolicyEditor rules={rules} onRulesChange={setRules} />
            </div>
          </div>
        )}

        {activeTab === 'keys' && (
          <div className="animate-fadeUp">
            <ApiKeys />
          </div>
        )}

        {/* ── Bottom bar (Overview only) ──────────────────────────────── */}
        {activeTab === 'overview' && <div
          className="animate-fadeUp bg-white rounded-[14px]"
          style={{
            border: '1px solid #e2e4ef',
            boxShadow: '0 1px 3px rgba(0,0,0,.04),0 1px 2px rgba(0,0,0,.03)',
            animationDelay: '0.14s',
          }}
        >
          <div className="px-5 py-3.5 flex items-center justify-between gap-4">
            {/* Left — connected services */}
            <div className="flex items-center gap-3 flex-wrap">
              <span
                className="text-[10px] font-semibold text-[#9498b3] uppercase tracking-[0.06em] shrink-0"
                style={{ fontFamily: 'var(--font-ibm-plex-mono), IBM Plex Mono, monospace' }}
              >
                Connected
              </span>
              {services.map(service => (
                <div key={service} className="flex items-center gap-1.5">
                  <StatusDot color={hasService(service) ? '#12b76a' : '#d0d3e2'} size="sm" />
                  <span
                    className="text-[12px] font-medium"
                    style={{ color: hasService(service) ? '#1a1d2e' : '#9498b3' }}
                  >
                    {serviceLabel(service)}
                  </span>
                  {hasService(service) && (
                    <button
                      onClick={() => registry.revokeService(service)}
                      className="text-[10px] px-1.5 py-[2px] rounded-[6px] cursor-pointer border transition-colors"
                      style={{
                        background: '#fef2f2',
                        color: '#ef4444',
                        borderColor: '#ef444420',
                        fontFamily: 'var(--font-ibm-plex-mono), IBM Plex Mono, monospace',
                      }}
                    >
                      Revoke
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Right — panic button */}
            <div className="shrink-0">
              {panicConfirm ? (
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-semibold text-[#ef4444]">Revoke ALL?</span>
                  <button
                    onClick={() => { registry.panicRevoke(); setPanicConfirm(false); }}
                    className="px-3 py-[6px] rounded-[8px] text-[11px] font-bold text-white cursor-pointer border-none"
                    style={{ background: '#ef4444' }}
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => setPanicConfirm(false)}
                    className="px-3 py-[6px] rounded-[8px] text-[11px] font-medium cursor-pointer"
                    style={{ background: '#f0f1f7', color: '#5c6078', border: '1px solid #e2e4ef' }}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setPanicConfirm(true)}
                  className="px-4 py-[7px] rounded-[10px] text-[11px] font-bold uppercase tracking-[0.06em] cursor-pointer transition-colors"
                  style={{
                    background: '#fef2f2',
                    color: '#ef4444',
                    border: '1px solid #ef444420',
                    boxShadow: '0 2px 6px rgba(239,68,68,0.14)',
                    fontFamily: 'var(--font-ibm-plex-mono), IBM Plex Mono, monospace',
                  }}
                >
                  🚨 PANIC: Revoke All
                </button>
              )}
            </div>
          </div>
        </div>}

        {/* ── Footer ──────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-1 pb-2">
          <span
            className="text-[11px] text-[#9498b3]"
          >
            AgentGate v0.1 · Authorized to Act: Auth0 for AI Agents Hackathon
          </span>
          <div className="flex items-center gap-1.5">
            {['Auth0', 'OPA', 'CIBA', 'SHA-256'].map(tech => (
              <span
                key={tech}
                className="text-[10px] px-2 py-[3px] rounded-[6px] text-[#9498b3]"
                style={{
                  background: '#f0f1f7',
                  border: '1px solid #e2e4ef',
                  fontFamily: 'var(--font-ibm-plex-mono), IBM Plex Mono, monospace',
                }}
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        </div>
      </div>
    </div>
  );
}
