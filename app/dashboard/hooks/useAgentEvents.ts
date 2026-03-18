'use client';
import { useEffect, useCallback, useRef } from 'react';
import type { AgentEvent } from '@/lib/types';

type EventHandler = (event: AgentEvent) => void;

export function useAgentEvents(onEvent: EventHandler) {
  const handlerRef = useRef(onEvent);
  handlerRef.current = onEvent;

  useEffect(() => {
    let es: EventSource | null = null;
    let retryTimeout: ReturnType<typeof setTimeout> | null = null;

    function connect() {
      es = new EventSource('/api/events');

      es.onmessage = (e) => {
        try {
          const raw = JSON.parse(e.data) as { type: string; timestamp: string; data: Record<string, unknown> };
          if (raw.type !== 'ping' && raw.type !== 'heartbeat') {
            handlerRef.current(raw as AgentEvent);
          }
        } catch {
          // Ignore parse errors
        }
      };

      es.onerror = () => {
        es?.close();
        // Reconnect after 3 seconds
        retryTimeout = setTimeout(connect, 3000);
      };
    }

    connect();

    return () => {
      if (retryTimeout) clearTimeout(retryTimeout);
      es?.close();
    };
  }, []);
}
