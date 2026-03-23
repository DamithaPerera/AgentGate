'use client';
import { useState } from 'react';
import type { AgentIdentity } from '@/lib/types';
import { Pagination } from './Pagination';

const PAGE_SIZE = 5;

const FRAMEWORK_COLORS: Record<string, string> = {
  crewai: '#7C3AED', langgraph: '#0052CC', autogen: '#EA580C', custom: '#374151', mcp: '#0891B2',
};
const FRAMEWORK_LABEL: Record<string, string> = {
  crewai: 'CrewAI', langgraph: 'LangGraph', autogen: 'AutoGen', custom: 'Custom', mcp: 'MCP',
};

interface Props {
  agents: AgentIdentity[];
  onRevoke: (id: string) => void;
  onRevokeService: (service: string) => void;
  onPanic: () => void;
  isLoggedIn?: boolean;
}

export function AgentRegistry({ agents, onRevoke, onRevokeService, onPanic, isLoggedIn }: Props) {
  const [panicConfirm, setPanicConfirm] = useState(false);
  const [page, setPage] = useState(1);
  const activeAgents = agents.filter(a => a.status === 'active');
  const totalPages = Math.max(1, Math.ceil(agents.length / PAGE_SIZE));
  const pagedAgents = agents.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const services = ['github', 'gmail', 'calendar'];
  const hasService = (s: string) => activeAgents.some(a => a.capabilities.some(c => c.startsWith(s + '.')));

  const trustColor = (level: number) => {
    if (level >= 4) return { bg: '#F0FDF4', color: '#16A34A', border: '#BBF7D0' };
    if (level === 3) return { bg: '#FFFBEB', color: '#D97706', border: '#FDE68A' };
    return { bg: '#FFF1F2', color: '#DC2626', border: '#FECDD3' };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 8 }}>
      {/* Agent list */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6, minHeight: 0 }}>
        {agents.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 16px', color: '#475569', fontSize: 13 }}>
            No agents registered yet.
            {!isLoggedIn && <><br /><span style={{ fontSize: 12 }}>Click ▶ Run Demo to get started.</span></>}
          </div>
        ) : pagedAgents.map(agent => {
          const tc = trustColor(agent.trustLevel);
          return (
            <div key={agent.id} style={{ background: '#fff', border: `1px solid ${agent.status === 'active' ? '#E2E8F0' : '#FECDD3'}`, borderRadius: 10, padding: '10px 12px', opacity: agent.status !== 'active' ? 0.65 : 1, transition: 'box-shadow 0.2s' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: agent.status === 'active' ? '#16A34A' : '#DC2626', display: 'inline-block', flexShrink: 0, boxShadow: agent.status === 'active' ? '0 0 6px rgba(22,163,74,0.5)' : 'none' }} />
                    <span style={{ fontWeight: 600, fontSize: 13, color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{agent.name}</span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 999, background: `${FRAMEWORK_COLORS[agent.framework] ?? '#374151'}15`, color: FRAMEWORK_COLORS[agent.framework] ?? '#374151', fontWeight: 500, border: `1px solid ${FRAMEWORK_COLORS[agent.framework] ?? '#374151'}30` }}>
                      {FRAMEWORK_LABEL[agent.framework] ?? agent.framework}
                    </span>
                    <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 999, background: tc.bg, color: tc.color, fontWeight: 600, border: `1px solid ${tc.border}` }}>
                      T{agent.trustLevel}
                    </span>
                    {agent.status !== 'active' && (
                      <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 999, background: '#FFF1F2', color: '#DC2626', fontWeight: 700 }}>{agent.status.toUpperCase()}</span>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, marginTop: 5 }}>
                    {agent.capabilities.slice(0, 3).map(cap => (
                      <span key={cap} style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, background: '#EFF6FF', color: '#1D4ED8', fontFamily: 'monospace', border: '1px solid #BFDBFE' }}>{cap}</span>
                    ))}
                    {agent.capabilities.length > 3 && (
                      <span style={{ fontSize: 10, color: '#94A3B8' }}>+{agent.capabilities.length - 3}</span>
                    )}
                  </div>
                </div>
                {agent.status === 'active' && (
                  <button onClick={() => onRevoke(agent.id)}
                    style={{ fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 6, background: '#FFF1F2', color: '#DC2626', border: '1px solid #FECDD3', cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap' }}>
                    Revoke
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Pagination page={page} totalPages={totalPages} onPage={setPage} />

      {/* Connected Services */}
      <div style={{ paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Connected Services</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {services.map(service => (
            <div key={service} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '5px 8px', borderRadius: 8, background: hasService(service) ? '#F0FDF4' : 'rgba(255,255,255,0.03)', border: `1px solid ${hasService(service) ? '#BBF7D0' : 'rgba(255,255,255,0.07)'}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: hasService(service) ? '#16A34A' : '#CBD5E1', display: 'inline-block' }} />
                <span style={{ fontSize: 12, fontWeight: 500, color: hasService(service) ? '#15803D' : '#64748B' }}>
                  {service === 'gmail' ? 'Google (Gmail)' : service.charAt(0).toUpperCase() + service.slice(1)}
                </span>
              </div>
              {hasService(service) && (
                <button onClick={() => onRevokeService(service)}
                  style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 4, background: '#FFF1F2', color: '#DC2626', border: '1px solid #FECDD3', cursor: 'pointer' }}>
                  Revoke
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Panic */}
      <div>
        {panicConfirm ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <p style={{ fontSize: 12, textAlign: 'center', fontWeight: 600, color: '#DC2626' }}>Revoke ALL agents and tokens?</p>
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={() => { onPanic(); setPanicConfirm(false); }}
                style={{ flex: 1, fontSize: 12, fontWeight: 700, padding: '7px', borderRadius: 8, background: '#DC2626', color: '#fff', border: 'none', cursor: 'pointer' }}>
                Confirm
              </button>
              <button onClick={() => setPanicConfirm(false)}
                style={{ flex: 1, fontSize: 12, fontWeight: 500, padding: '7px', borderRadius: 8, background: '#fff', color: '#374151', border: '1px solid #E2E8F0', cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button onClick={() => setPanicConfirm(true)}
            style={{ width: '100%', fontSize: 12, fontWeight: 700, padding: '8px', borderRadius: 8, background: '#FFF1F2', color: '#DC2626', border: '1px solid #FECDD3', cursor: 'pointer', letterSpacing: '0.03em' }}>
            🚨 PANIC: Revoke All
          </button>
        )}
      </div>
    </div>
  );
}
