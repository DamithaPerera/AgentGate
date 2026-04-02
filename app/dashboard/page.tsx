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
import { StatusDot } from './components/ui';
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

  const activeCount = registry.agents.filter(a => a.status === 'active').length;

  const services = ['github', 'gmail', 'calendar'];
  const activeAgents = registry.agents.filter(a => a.status === 'active');
  const hasService = (s: string) => activeAgents.some(a => a.capabilities.some(c => c.startsWith(s + '.')));
  const serviceLabel = (s: string) => s === 'gmail' ? 'Google (Gmail)' : s.charAt(0).toUpperCase() + s.slice(1);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: '#f6f7fb', fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}
    >

      {/* ── Header ──────────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-50 shrink-0"
        style={{
          background: 'rgba(255,255,255,0.82)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid #e2e4ef',
        }}
      >
        <div className="w-full px-5 h-14 flex items-center justify-between gap-3">

          {/* Left — logo */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 no-underline">
              <div
                className="w-8 h-8 rounded-[10px] flex items-center justify-center text-white text-[11px] font-bold shrink-0"
                style={{
                  background: 'linear-gradient(135deg, #3b6cff, #8b5cf6)',
                  fontFamily: 'var(--font-ibm-plex-mono), IBM Plex Mono, monospace',
                  boxShadow: '0 2px 8px rgba(59,108,255,0.28)',
                }}
              >
                AG
              </div>
              <span className="font-bold text-[15px] text-[#1a1d2e]">AgentGate</span>
            </Link>
            <div className="w-px h-5 bg-[#e2e4ef]" />
            <span className="text-[13px] text-[#9498b3] font-medium">Security Dashboard</span>
          </div>

          {/* Center — status */}
          <div className="flex items-center gap-2 flex-1 justify-center">
            <div
              className="flex items-center gap-2 rounded-full px-3 py-[5px]"
              style={{ background: '#e7faf0', border: '1px solid #12b76a33' }}
            >
              <span className="w-[7px] h-[7px] rounded-full inline-block animate-pulse-dot" style={{ background: '#12b76a' }} />
              <span
                className="text-[11px] font-semibold text-[#12b76a]"
                style={{ fontFamily: 'var(--font-ibm-plex-mono), IBM Plex Mono, monospace' }}
              >
                {activeCount} agent{activeCount !== 1 ? 's' : ''} active
              </span>
            </div>
            {demoMessage && (
              <div
                className="flex items-center gap-1.5 rounded-full px-3 py-[5px]"
                style={{ background: '#ebf0ff', border: '1px solid #3b6cff33' }}
              >
                <span className="text-[11px] text-[#3b6cff] font-medium">{demoMessage}</span>
              </div>
            )}
          </div>

          {/* Right — actions */}
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
            {userName && (
              <div
                className="flex items-center gap-2 rounded-[10px] px-3 py-[5px]"
                style={{ background: '#f0f1f7', border: '1px solid #e2e4ef' }}
              >
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                  style={{ background: 'linear-gradient(135deg, #3b6cff, #8b5cf6)' }}
                >
                  {userName.charAt(0).toUpperCase()}
                </div>
                <span className="text-[13px] text-[#1a1d2e] font-medium max-w-[120px] truncate">{userName}</span>
              </div>
            )}
            <Link
              href={userName ? '/auth/logout' : '/auth/login?returnTo=/dashboard'}
              className="px-4 py-[7px] rounded-[10px] text-[13px] font-semibold no-underline transition-colors"
              style={userName
                ? { background: '#fef2f2', color: '#ef4444', border: '1px solid #ef444420' }
                : { background: 'linear-gradient(135deg, #3b6cff, #6b8fff)', color: '#fff', border: 'none', boxShadow: '0 2px 8px rgba(59,108,255,0.28)' }
              }
            >
              {userName ? 'Log out' : 'Log in'}
            </Link>
          </div>
        </div>
      </header>

      {/* ── Main content ─────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col gap-5 p-5">

        {/* ── Analytics Row ─────────────────────────────────────────── */}
        <div className="grid gap-5" style={{ gridTemplateColumns: '1fr 1fr 1fr 1fr' }}>

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
        </div>

        {/* ── Policy Engine card ─────────────────────────────────────── */}
        <div
          className="animate-fadeUp bg-white rounded-[14px] overflow-hidden"
          style={{
            border: '1px solid #e2e4ef',
            boxShadow: '0 1px 3px rgba(0,0,0,.04),0 1px 2px rgba(0,0,0,.03)',
            animationDelay: '0.22s',
          }}
        >
          <div className="flex items-center justify-between px-5 py-3.5 bg-[#f0f1f7] border-b border-[#e2e4ef]">
            <div className="flex items-center gap-3">
              <div className="w-[30px] h-[30px] rounded-[8px] bg-[#ebf0ff] flex items-center justify-center text-sm shrink-0">
                ⚙️
              </div>
              <span className="font-semibold text-[14px] text-[#1a1d2e]">Policy Engine</span>
            </div>
            <div
              className="flex items-center gap-1.5 rounded-full px-2.5 py-[4px]"
              style={{ background: '#ebf0ff', border: '1px solid #3b6cff33' }}
            >
              <span
                className="text-[10px] font-semibold text-[#3b6cff]"
                style={{ fontFamily: 'var(--font-ibm-plex-mono), IBM Plex Mono, monospace' }}
              >
                {rules.length} rules
              </span>
            </div>
          </div>
          <div className="px-5 py-4">
            <PolicyEditor rules={rules} onRulesChange={setRules} />
          </div>
        </div>

        {/* ── 3-Panel Grid ──────────────────────────────────────────── */}
        <div
          className="animate-fadeUp grid gap-5"
          style={{
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            animationDelay: '0.08s',
          }}
        >
          {/* Panel 1 — Agent Registry */}
          <div
            className="bg-white rounded-[14px] flex flex-col overflow-hidden"
            style={{
              border: '1px solid #e2e4ef',
              boxShadow: '0 1px 3px rgba(0,0,0,.04),0 1px 2px rgba(0,0,0,.03)',
              minHeight: '420px',
            }}
          >
            {/* Panel header */}
            <div className="flex items-center justify-between px-5 py-3.5 bg-[#f0f1f7] border-b border-[#e2e4ef] rounded-t-[14px] shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-[30px] h-[30px] rounded-[8px] bg-[#ebf0ff] flex items-center justify-center text-sm shrink-0">🤖</div>
                <div>
                  <div className="font-semibold text-[13px] text-[#1a1d2e]">Agent Registry</div>
                  <div className="text-[11px] text-[#9498b3] mt-px">{activeCount} of {registry.agents.length} active</div>
                </div>
              </div>
              <div
                className="flex items-center gap-1.5 rounded-full px-2.5 py-[4px]"
                style={{ background: '#e7faf0', border: '1px solid #12b76a33' }}
              >
                <span className="w-[6px] h-[6px] rounded-full inline-block animate-pulse-dot" style={{ background: '#12b76a' }} />
                <span
                  className="text-[10px] font-semibold text-[#12b76a]"
                  style={{ fontFamily: 'var(--font-ibm-plex-mono), IBM Plex Mono, monospace' }}
                >
                  LIVE
                </span>
              </div>
            </div>
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
            {/* Panel header */}
            <div className="flex items-center justify-between px-5 py-3.5 bg-[#f0f1f7] border-b border-[#e2e4ef] rounded-t-[14px] shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-[30px] h-[30px] rounded-[8px] bg-[#fefce8] flex items-center justify-center text-sm shrink-0">⚡</div>
                <div>
                  <div className="font-semibold text-[13px] text-[#1a1d2e]">Live Feed</div>
                  <div className="text-[11px] text-[#9498b3] mt-px">Real-time authorization events</div>
                </div>
              </div>
              <div
                className="flex items-center gap-1.5 rounded-full px-2.5 py-[4px]"
                style={{ background: '#ebf0ff', border: '1px solid #3b6cff33' }}
              >
                <span className="w-[6px] h-[6px] rounded-full inline-block animate-pulse-dot" style={{ background: '#3b6cff' }} />
                <span
                  className="text-[10px] font-semibold text-[#3b6cff]"
                  style={{ fontFamily: 'var(--font-ibm-plex-mono), IBM Plex Mono, monospace' }}
                >
                  SSE
                </span>
              </div>
            </div>
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
            {/* Panel header */}
            <div className="flex items-center justify-between px-5 py-3.5 bg-[#f0f1f7] border-b border-[#e2e4ef] rounded-t-[14px] shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-[30px] h-[30px] rounded-[8px] bg-[#f3f0ff] flex items-center justify-center text-sm shrink-0">🔗</div>
                <div>
                  <div className="font-semibold text-[13px] text-[#1a1d2e]">Audit Trail</div>
                  <div className="text-[11px] text-[#9498b3] mt-px">{audit.entries.length} entries · SHA-256 chain</div>
                </div>
              </div>
              <div
                className="flex items-center gap-1.5 rounded-full px-2.5 py-[4px]"
                style={{ background: '#f3f0ff', border: '1px solid #8b5cf633' }}
              >
                <span
                  className="text-[10px] font-semibold text-[#8b5cf6]"
                  style={{ fontFamily: 'var(--font-ibm-plex-mono), IBM Plex Mono, monospace' }}
                >
                  tamper-evident
                </span>
              </div>
            </div>
            {/* Panel body */}
            <div className="flex-1 overflow-hidden">
              <AuditTrail
                entries={audit.entries}
                onExport={audit.exportAudit}
                onVerify={audit.verifyChain}
              />
            </div>
          </div>
        </div>

        {/* ── API Keys ──────────────────────────────────────────────── */}
        <div className="animate-fadeUp" style={{ animationDelay: '0.24s' }}>
          <ApiKeys />
        </div>

        {/* ── Bottom bar ──────────────────────────────────────────────── */}
        <div
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
        </div>

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
  );
}
