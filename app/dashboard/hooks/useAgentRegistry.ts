'use client';
import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import type { AgentIdentity, AgentEvent } from '@/lib/types';

export function useAgentRegistry() {
  const [agents, setAgents] = useState<AgentIdentity[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/agents');
      const data = await res.json() as { agents: AgentIdentity[] };
      setAgents(data.agents ?? []);
    } catch (err) {
      console.error('[useAgentRegistry] Failed to load agents:', err);
      toast.error('Failed to load agents', { description: 'Check your connection and try refreshing.' });
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
    try {
      await fetch('/api/revoke/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId }),
      });
      await refresh();
      toast.success('Agent revoked');
    } catch (err) {
      console.error('[useAgentRegistry] Failed to revoke agent:', err);
      toast.error('Failed to revoke agent');
    }
  }, [refresh]);

  const revokeService = useCallback(async (service: string) => {
    try {
      await fetch('/api/revoke/service', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ service }),
      });
      await refresh();
      toast.success(`${service} service revoked`);
    } catch (err) {
      console.error('[useAgentRegistry] Failed to revoke service:', err);
      toast.error('Failed to revoke service');
    }
  }, [refresh]);

  const panicRevoke = useCallback(async () => {
    try {
      await fetch('/api/revoke/panic', { method: 'POST' });
      await refresh();
      toast.success('All agents and tokens revoked');
    } catch (err) {
      console.error('[useAgentRegistry] Panic revoke failed:', err);
      toast.error('Panic revoke failed');
    }
  }, [refresh]);

  return { agents, loading, refresh, handleEvent, revokeAgent, revokeService, panicRevoke };
}
