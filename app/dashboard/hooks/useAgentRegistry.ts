'use client';
import { useState, useCallback, useEffect } from 'react';
import type { AgentIdentity, AgentEvent } from '@/lib/types';

export function useAgentRegistry() {
  const [agents, setAgents] = useState<AgentIdentity[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/agents');
      const data = await res.json() as { agents: AgentIdentity[] };
      setAgents(data.agents ?? []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const handleEvent = useCallback((event: AgentEvent) => {
    if (event.type === 'agent_registered' || event.type === 'agent_revoked' || event.type === 'revocation') {
      void refresh();
    }
    if (event.type === 'panic_revocation') {
      void refresh();
    }
  }, [refresh]);

  const revokeAgent = useCallback(async (agentId: string) => {
    await fetch('/api/revoke/agent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agentId }),
    });
    await refresh();
  }, [refresh]);

  const revokeService = useCallback(async (service: string) => {
    await fetch('/api/revoke/service', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ service }),
    });
    await refresh();
  }, [refresh]);

  const panicRevoke = useCallback(async () => {
    await fetch('/api/revoke/panic', { method: 'POST' });
    await refresh();
  }, [refresh]);

  return { agents, loading, refresh, handleEvent, revokeAgent, revokeService, panicRevoke };
}
