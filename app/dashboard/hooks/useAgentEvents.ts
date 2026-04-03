'use client';
import { useEffect, useRef } from 'react';
import type { AgentEvent } from '@/lib/types';

type EventHandler = (event: AgentEvent) => void;

const POLL_INTERVAL  = 3000;  // ms between polls
const SSE_FAIL_AFTER = 8000;  // if SSE errors within 8s, switch to polling

export function useAgentEvents(onEvent: EventHandler) {
  const handlerRef = useRef(onEvent);
  handlerRef.current = onEvent;

  useEffect(() => {
    let es: EventSource | null = null;
    let pollTimer: ReturnType<typeof setInterval> | null = null;
    let retryTimeout: ReturnType<typeof setTimeout> | null = null;
    let lastSeen = new Date().toISOString();
    let usePoll = false;

    // ── Polling mode ────────────────────────────────────────────────────────
    function startPolling() {
      if (pollTimer) return; // already polling
      pollTimer = setInterval(async () => {
        try {
          const res = await fetch(`/api/events/poll?since=${encodeURIComponent(lastSeen)}`);
          if (!res.ok) return;
          const { events, serverTime } = await res.json() as {
            events: AgentEvent[];
            serverTime: string;
          };
          lastSeen = serverTime;
          for (const ev of events) {
            handlerRef.current(ev);
          }
        } catch {
          // network hiccup — try again next interval
        }
      }, POLL_INTERVAL);
    }

    function stopPolling() {
      if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
    }

    // ── SSE mode ─────────────────────────────────────────────────────────────
    function connect() {
      if (usePoll) { startPolling(); return; }

      const connectedAt = Date.now();
      es = new EventSource('/api/events');

      es.onmessage = (e) => {
        try {
          const raw = JSON.parse(e.data) as AgentEvent & { type: string };
          if (raw.type !== 'ping' && raw.type !== 'heartbeat') {
            handlerRef.current(raw as AgentEvent);
            lastSeen = raw.timestamp ?? lastSeen;
          }
        } catch { /* ignore parse errors */ }
      };

      es.onerror = () => {
        es?.close();
        es = null;

        // If SSE failed very quickly → Vercel killed it → switch to polling
        if (Date.now() - connectedAt < SSE_FAIL_AFTER) {
          usePoll = true;
          startPolling();
          return;
        }

        // Otherwise it was a transient error — reconnect SSE after 3s
        retryTimeout = setTimeout(connect, 3000);
      };
    }

    connect();

    return () => {
      if (retryTimeout) clearTimeout(retryTimeout);
      es?.close();
      stopPolling();
    };
  }, []);
}
