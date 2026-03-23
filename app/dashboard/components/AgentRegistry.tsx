'use client';
import { useState } from 'react';
import type { AgentIdentity } from '@/lib/types';
import { Pagination } from './Pagination';
import { Badge, AgentDot, RevokeButton, EmptyState } from './ui';

const PAGE_SIZE = 5;

const FRAMEWORK_COLORS: Record<string, string> = {
  crewai: '#8b5cf6', langgraph: '#3b6cff', autogen: '#f59e0b', custom: '#5c6078', mcp: '#06b6d4',
};
const FRAMEWORK_BG: Record<string, string> = {
  crewai: '#f3f0ff', langgraph: '#ebf0ff', autogen: '#fefce8', custom: '#f0f1f7', mcp: '#e0f9ff',
};
const FRAMEWORK_LABEL: Record<string, string> = {
  crewai: 'CrewAI', langgraph: 'LangGraph', autogen: 'AutoGen', custom: 'Custom', mcp: 'MCP',
};

interface Props {
  agents: AgentIdentity[];
  onRevoke: (id: string) => void;
}

export function AgentRegistry({ agents, onRevoke }: Props) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(agents.length / PAGE_SIZE));
  const pagedAgents = agents.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const trustStyle = (level: number): { bg: string; color: string; border: string } => {
    if (level >= 4) return { bg: '#e7faf0', color: '#12b76a', border: '#12b76a33' };
    if (level === 3) return { bg: '#fefce8', color: '#f59e0b', border: '#f59e0b33' };
    return { bg: '#f3f0ff', color: '#8b5cf6', border: '#8b5cf633' };
  };

  return (
    <div className="flex flex-col h-full">
      {/* Agent list */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {agents.length === 0 ? (
          <EmptyState
            icon="🤖"
            message="No agents registered yet."
            hint="Click Run Demo to get started."
          />
        ) : pagedAgents.map((agent, idx) => {
          const tc = trustStyle(agent.trustLevel);
          const fwColor = FRAMEWORK_COLORS[agent.framework] ?? '#5c6078';
          const fwBg = FRAMEWORK_BG[agent.framework] ?? '#f0f1f7';
          const isLast = idx === pagedAgents.length - 1;
          return (
            <div
              key={agent.id}
              className="px-5 py-4 transition-colors hover:bg-[#eceef5] group"
              style={{
                borderBottom: isLast ? 'none' : '1px solid #e2e4ef',
                opacity: agent.status !== 'active' ? 0.6 : 1,
              }}
            >
              {/* Name row */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <AgentDot active={agent.status === 'active'} />
                  <span className="font-semibold text-[13px] text-[#1a1d2e] truncate">{agent.name}</span>
                  {agent.status !== 'active' && (
                    <Badge style={{ background: '#fef2f2', color: '#ef4444', border: '1px solid #ef444433' }}>
                      {agent.status.toUpperCase()}
                    </Badge>
                  )}
                </div>
                {agent.status === 'active' && (
                  <RevokeButton onClick={() => onRevoke(agent.id)} />
                )}
              </div>

              {/* Meta row */}
              <div className="flex flex-wrap gap-1.5 mb-2">
                <Badge
                  style={{
                    background: fwBg,
                    color: fwColor,
                    border: `1px solid ${fwColor}33`,
                  }}
                >
                  {FRAMEWORK_LABEL[agent.framework] ?? agent.framework}
                </Badge>
                <Badge style={{ background: tc.bg, color: tc.color, border: `1px solid ${tc.border}` }}>
                  T{agent.trustLevel}
                </Badge>
              </div>

              {/* Scopes row */}
              <div className="flex flex-wrap gap-[4px]">
                {agent.capabilities.slice(0, 4).map(cap => (
                  <span
                    key={cap}
                    className="text-[10px] px-[6px] py-[2px] rounded-[6px] bg-[#f0f1f7] text-[#5c6078] border border-[#e2e4ef]"
                    style={{ fontFamily: 'var(--font-ibm-plex-mono), IBM Plex Mono, monospace' }}
                  >
                    {cap}
                  </span>
                ))}
                {agent.capabilities.length > 4 && (
                  <span
                    className="text-[10px] px-[6px] py-[2px] text-[#9498b3]"
                    style={{ fontFamily: 'var(--font-ibm-plex-mono), IBM Plex Mono, monospace' }}
                  >
                    +{agent.capabilities.length - 4}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Pagination page={page} totalPages={totalPages} onPage={setPage} />
    </div>
  );
}
