'use client';
import { useState } from 'react';
import type { AgentIdentity } from '@/lib/types';
import { Pagination } from './Pagination';
import { Badge, AgentDot, StatusDot, RevokeButton, EmptyState } from './ui';

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
    <div className="flex flex-col h-full gap-2">
      {/* Agent list */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-1.5 min-h-0">
        {agents.length === 0 ? (
          <EmptyState
            message="No agents registered yet."
            hint={!isLoggedIn ? 'Click ▶ Run Demo to get started.' : undefined}
          />
        ) : pagedAgents.map(agent => {
          const tc = trustColor(agent.trustLevel);
          const fwColor = FRAMEWORK_COLORS[agent.framework] ?? '#374151';
          return (
            <div key={agent.id}
              className="bg-white rounded-[10px] px-3 py-2.5 transition-shadow"
              style={{
                border: `1px solid ${agent.status === 'active' ? '#E2E8F0' : '#FECDD3'}`,
                opacity: agent.status !== 'active' ? 0.65 : 1,
              }}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 mb-[5px]">
                    <AgentDot active={agent.status === 'active'} />
                    <span className="font-semibold text-[13px] text-[#0F172A] truncate">{agent.name}</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <Badge
                      style={{
                        background: `${fwColor}15`,
                        color: fwColor,
                        border: `1px solid ${fwColor}30`,
                      }}>
                      {FRAMEWORK_LABEL[agent.framework] ?? agent.framework}
                    </Badge>
                    <Badge
                      style={{ background: tc.bg, color: tc.color, border: `1px solid ${tc.border}` }}>
                      T{agent.trustLevel}
                    </Badge>
                    {agent.status !== 'active' && (
                      <Badge className="bg-[#FFF1F2] text-[#DC2626] font-bold">
                        {agent.status.toUpperCase()}
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-[3px] mt-[5px]">
                    {agent.capabilities.slice(0, 3).map(cap => (
                      <span key={cap} className="text-[10px] px-1.5 py-px rounded bg-[#EFF6FF] text-[#1D4ED8] font-mono border border-[#BFDBFE]">{cap}</span>
                    ))}
                    {agent.capabilities.length > 3 && (
                      <span className="text-[10px] text-[#94A3B8]">+{agent.capabilities.length - 3}</span>
                    )}
                  </div>
                </div>
                {agent.status === 'active' && (
                  <RevokeButton onClick={() => onRevoke(agent.id)} />
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Pagination page={page} totalPages={totalPages} onPage={setPage} />

      {/* Connected Services */}
      <div className="pt-2 border-t border-white/[0.08]">
        <div className="text-[11px] font-semibold text-[#475569] uppercase tracking-[0.05em] mb-1.5">Connected Services</div>
        <div className="flex flex-col gap-1">
          {services.map(service => (
            <div key={service}
              className="flex items-center justify-between px-2 py-[5px] rounded-lg"
              style={{
                background: hasService(service) ? '#F0FDF4' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${hasService(service) ? '#BBF7D0' : 'rgba(255,255,255,0.07)'}`,
              }}>
              <div className="flex items-center gap-1.5">
                <StatusDot color={hasService(service) ? '#16A34A' : '#CBD5E1'} />
                <span
                  className="text-xs font-medium"
                  style={{ color: hasService(service) ? '#15803D' : '#64748B' }}>
                  {service === 'gmail' ? 'Google (Gmail)' : service.charAt(0).toUpperCase() + service.slice(1)}
                </span>
              </div>
              {hasService(service) && (
                <RevokeButton onClick={() => onRevokeService(service)} small />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Panic */}
      <div>
        {panicConfirm ? (
          <div className="flex flex-col gap-1.5">
            <p className="text-xs text-center font-semibold text-[#DC2626]">Revoke ALL agents and tokens?</p>
            <div className="flex gap-1.5">
              <button onClick={() => { onPanic(); setPanicConfirm(false); }}
                className="flex-1 text-xs font-bold py-[7px] rounded-lg bg-[#DC2626] text-white border-none cursor-pointer">
                Confirm
              </button>
              <button onClick={() => setPanicConfirm(false)}
                className="flex-1 text-xs font-medium py-[7px] rounded-lg bg-white text-[#374151] border border-[#E2E8F0] cursor-pointer">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button onClick={() => setPanicConfirm(true)}
            className="w-full text-xs font-bold py-2 rounded-lg bg-[#FFF1F2] text-[#DC2626] border border-[#FECDD3] cursor-pointer tracking-[0.03em]">
            🚨 PANIC: Revoke All
          </button>
        )}
      </div>
    </div>
  );
}
