'use client';
import { useState } from 'react';
import type { AgentIdentity } from '@/lib/types';

interface Props {
  agents: AgentIdentity[];
  onRevoke: (id: string) => void;
  onRevokeService: (service: string) => void;
  onPanic: () => void;
}

const FRAMEWORK_LABEL: Record<string, string> = {
  crewai: 'CrewAI', langgraph: 'LangGraph', autogen: 'AutoGen', custom: 'Custom', mcp: 'MCP',
};

function TrustBadge({ level }: { level: number }) {
  const styles: { bg: string; color: string }[] = [
    { bg: '#FFEBE6', color: '#BF2600' },
    { bg: '#FFEBE6', color: '#BF2600' },
    { bg: '#FFF0B3', color: '#FF8B00' },
    { bg: '#FFF0B3', color: '#FF8B00' },
    { bg: 'var(--color-brand-light)', color: 'var(--color-info-text)' },
    { bg: 'var(--color-success-bg)', color: 'var(--color-success-text)' },
  ];
  const s = styles[level] ?? styles[0];
  return (
    <span className="text-xs px-2 py-0.5 rounded-full font-medium"
      style={{ background: s.bg, color: s.color }}>
      Trust {level}
    </span>
  );
}

export function AgentRegistry({ agents, onRevoke, onRevokeService, onPanic }: Props) {
  const [panicConfirm, setPanicConfirm] = useState(false);
  const activeAgents = agents.filter(a => a.status === 'active');
  const services = ['github', 'gmail', 'calendar'];
  const hasService = (s: string) => activeAgents.some(a => a.capabilities.some(c => c.startsWith(s + '.')));

  return (
    <div className="flex flex-col h-full gap-3">
      {/* Agent list */}
      <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
        {agents.length === 0 ? (
          <div className="text-xs text-center py-8" style={{ color: 'var(--color-text-subtle)' }}>
            No agents registered yet.<br />Click ▶ Run Demo to get started.
          </div>
        ) : agents.map(agent => (
          <div key={agent.id} className="rounded p-3 border transition-all"
            style={{
              background: agent.status === 'active' ? 'var(--color-bg-page)' : 'var(--color-danger-bg)',
              borderColor: agent.status === 'active' ? 'var(--color-border)' : '#FFBDAD',
              opacity: agent.status !== 'active' ? 0.7 : 1,
            }}>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: agent.status === 'active' ? 'var(--color-success)' : 'var(--color-danger)' }} />
                  <span className="text-sm font-medium truncate" style={{ color: 'var(--color-text-high)' }}>{agent.name}</span>
                </div>
                <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                  <span className="text-xs px-1.5 py-0.5 rounded border font-medium"
                    style={{ background: 'var(--color-bg-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text-medium)' }}>
                    {FRAMEWORK_LABEL[agent.framework] ?? agent.framework}
                  </span>
                  <TrustBadge level={agent.trustLevel} />
                  {agent.status !== 'active' && (
                    <span className="text-xs font-semibold uppercase" style={{ color: 'var(--color-danger-text)' }}>{agent.status}</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {agent.capabilities.slice(0, 4).map(cap => (
                    <span key={cap} className="text-xs px-1.5 py-0.5 rounded font-mono"
                      style={{ background: 'var(--color-brand-light)', color: 'var(--color-info-text)' }}>
                      {cap}
                    </span>
                  ))}
                  {agent.capabilities.length > 4 && (
                    <span className="text-xs" style={{ color: 'var(--color-text-subtle)' }}>+{agent.capabilities.length - 4}</span>
                  )}
                </div>
              </div>
              {agent.status === 'active' && (
                <button onClick={() => onRevoke(agent.id)}
                  className="text-xs font-medium px-2 py-1 rounded border flex-shrink-0 transition-colors hover:opacity-80"
                  style={{ color: 'var(--color-danger-text)', borderColor: '#FFBDAD', background: 'var(--color-danger-bg)' }}>
                  Revoke
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Connected Services */}
      <div className="pt-3" style={{ borderTop: '1px solid var(--color-border)' }}>
        <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-low)' }}>Connected Services</div>
        <div className="space-y-1.5">
          {services.map(service => (
            <div key={service} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full"
                  style={{ background: hasService(service) ? 'var(--color-success)' : 'var(--color-border-bold)' }} />
                <span className="text-sm" style={{ color: 'var(--color-text-medium)' }}>
                  {service === 'gmail' ? 'Google (Gmail)' : service.charAt(0).toUpperCase() + service.slice(1)}
                </span>
              </div>
              {hasService(service) && (
                <button onClick={() => onRevokeService(service)}
                  className="text-xs font-medium px-2 py-0.5 rounded border transition-opacity hover:opacity-80"
                  style={{ color: 'var(--color-danger-text)', borderColor: '#FFBDAD', background: 'var(--color-danger-bg)' }}>
                  Revoke
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Panic button */}
      <div>
        {panicConfirm ? (
          <div className="space-y-2">
            <p className="text-xs text-center font-medium" style={{ color: 'var(--color-danger-text)' }}>Revoke ALL agents and tokens?</p>
            <div className="flex gap-2">
              <button onClick={() => { onPanic(); setPanicConfirm(false); }}
                className="flex-1 text-white text-xs font-semibold py-2 rounded transition-opacity hover:opacity-90"
                style={{ background: 'var(--color-danger)' }}>
                Confirm
              </button>
              <button onClick={() => setPanicConfirm(false)}
                className="flex-1 text-xs font-medium py-2 rounded border transition-colors hover:opacity-80"
                style={{ color: 'var(--color-text-medium)', borderColor: 'var(--color-border)', background: 'var(--color-bg-surface)' }}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button onClick={() => setPanicConfirm(true)}
            className="w-full text-xs font-semibold py-2 rounded border transition-opacity hover:opacity-80"
            style={{ color: 'var(--color-danger-text)', borderColor: '#FFBDAD', background: 'var(--color-danger-bg)' }}>
            PANIC: Revoke All
          </button>
        )}
      </div>
    </div>
  );
}
