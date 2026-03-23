'use client';
import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import type { AuditEntry, AgentEvent } from '@/lib/types';

export function useAuditTrail() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/audit?limit=100');
      const data = await res.json() as { entries: AuditEntry[] };
      setEntries(data.entries ?? []);
    } catch (err) {
      console.error('[useAuditTrail] Failed to load audit entries:', err);
      toast.error('Failed to load audit trail', { description: 'Check your connection and try refreshing.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const handleEvent = useCallback((event: AgentEvent) => {
    if (event.type === 'audit_entry') {
      const entry = (event.data as { entry: AuditEntry }).entry;
      setEntries(prev => [entry, ...prev].slice(0, 200));
    }
  }, []);

  const exportAudit = useCallback(() => {
    window.open('/api/audit/export', '_blank');
  }, []);

  const verifyChain = useCallback(async (): Promise<{ valid: boolean; message: string }> => {
    const res = await fetch('/api/audit/verify');
    return res.json() as Promise<{ valid: boolean; message: string }>;
  }, []);

  return { entries, loading, refresh, handleEvent, exportAudit, verifyChain };
}
