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
  crewai: 'CrewAI',
  langgraph: 'LangGraph',
  autogen: 'AutoGen',
  custom: 'Custom',
  mcp: 'MCP',
};

function TrustBadge({ level }: { level: number }) {
  const colors = ['', 'bg-red-900/60 text-red-300', 'bg-orange-900/60 text-orange-300', 'bg-yellow-900/60 text-yellow-300', 'bg-teal-900/60 text-teal-300', 'bg-emerald-900/60 text-emerald-300'];
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors[level] ?? colors[1]}`}>
      Trust {level}
    </span>
  );
}

export function AgentRegistry({ agents, onRevoke, onRevokeService, onPanic }: Props) {
  const [panicConfirm, setPanicConfirm] = useState(false);
  const activeAgents = agents.filter(a => a.status === 'active');
  const services = ['github', 'gmail', 'calendar'];

  const hasService = (service: string) =>
    activeAgents.some(a => a.capabilities.some(c => c.startsWith(service + '.')));

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Agents */}
      <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
        {agents.length === 0 ? (
          <div className="text-slate-500 text-sm text-center py-8">
            No agents registered yet.
            <br />Click &quot;Run Demo&quot; to get started.
          </div>
        ) : (
          agents.map(agent => (
            <div
              key={agent.id}
              className={`rounded-lg p-3 border transition-colors ${
                agent.status === 'active'
                  ? 'bg-[#0d1f2d] border-[#1e3a5f]'
                  : 'bg-[#1a0f0f] border-red-900/40 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${agent.status === 'active' ? 'bg-emerald-400' : 'bg-red-500'}`} />
                    <span className="text-sm font-medium truncate">{agent.name}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className="text-xs text-slate-500 bg-[#0a1520] px-2 py-0.5 rounded">
                      {FRAMEWORK_LABEL[agent.framework] ?? agent.framework}
                    </span>
                    <TrustBadge level={agent.trustLevel} />
                    {agent.status !== 'active' && (
                      <span className="text-xs text-red-400 uppercase">{agent.status}</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {agent.capabilities.slice(0, 4).map(cap => (
                      <span key={cap} className="text-xs bg-[#0a1a2e] text-slate-400 px-1.5 py-0.5 rounded">
                        {cap}
                      </span>
                    ))}
                    {agent.capabilities.length > 4 && (
                      <span className="text-xs text-slate-500">+{agent.capabilities.length - 4}</span>
                    )}
                  </div>
                </div>
                {agent.status === 'active' && (
                  <button
                    onClick={() => onRevoke(agent.id)}
                    className="text-xs text-red-400 hover:text-red-300 border border-red-900/50 hover:border-red-700/50 px-2 py-1 rounded flex-shrink-0 transition-colors"
                  >
                    Revoke
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Services */}
      <div className="border-t border-[#1e3a5f] pt-4">
        <div className="text-xs text-slate-500 uppercase tracking-wider mb-2">Connected Services</div>
        <div className="space-y-2">
          {services.map(service => (
            <div key={service} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${hasService(service) ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                <span className="text-sm capitalize">{service === 'gmail' ? 'Google (Gmail)' : service.charAt(0).toUpperCase() + service.slice(1)}</span>
              </div>
              {hasService(service) && (
                <button
                  onClick={() => onRevokeService(service)}
                  className="text-xs text-red-400 hover:text-red-300 border border-red-900/40 px-2 py-0.5 rounded transition-colors"
                >
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
            <p className="text-xs text-red-400 text-center">Revoke ALL agents and tokens?</p>
            <div className="flex gap-2">
              <button
                onClick={() => { onPanic(); setPanicConfirm(false); }}
                className="flex-1 bg-red-700 hover:bg-red-600 text-white text-sm py-2 rounded-lg font-medium transition-colors"
              >
                Confirm Panic
              </button>
              <button
                onClick={() => setPanicConfirm(false)}
                className="flex-1 border border-[#1e3a5f] text-slate-300 text-sm py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setPanicConfirm(true)}
            className="w-full border border-red-900/50 hover:bg-red-900/20 text-red-400 text-sm py-2 rounded-lg font-medium transition-colors"
          >
            PANIC: Revoke All
          </button>
        )}
      </div>
    </div>
  );
}
