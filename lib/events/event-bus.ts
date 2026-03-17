import { EventEmitter } from 'events';
import type { AgentEvent, AgentEventType, ServiceType } from '@/lib/types';

// ─── AgentEventBus ────────────────────────────────────────────────────────────
// In-memory event bus for agent activity. Used by:
//   - LangGraph agents to emit events
//   - /api/agent/events SSE endpoint to stream to the dashboard

class AgentEventBus extends EventEmitter {
  private static instance: AgentEventBus;

  private constructor() {
    super();
    this.setMaxListeners(200); // Support many SSE subscribers
  }

  static getInstance(): AgentEventBus {
    if (!AgentEventBus.instance) {
      AgentEventBus.instance = new AgentEventBus();
    }
    return AgentEventBus.instance;
  }

  /** Emit a structured agent event. Also broadcasts to the wildcard 'event' channel. */
  emitAgentEvent(
    eventType: AgentEventType,
    agentId: string,
    data: Record<string, unknown> = {},
    service?: ServiceType,
  ): void {
    const event: AgentEvent = {
      type: eventType,
      timestamp: new Date(),
      agentId,
      service,
      data,
    };

    // Emit on the specific event type channel
    this.emit(eventType, event);

    // Emit on a wildcard channel so SSE can subscribe to all events at once
    this.emit('*', event);
  }

  /** Subscribe to a specific event type */
  onAgentEvent(
    eventType: AgentEventType | '*',
    listener: (event: AgentEvent) => void,
  ): () => void {
    this.on(eventType, listener);
    // Return an unsubscribe function
    return () => {
      this.off(eventType, listener);
    };
  }
}

// ─── Global singleton (persists across Next.js hot reloads in dev) ────────────
const globalForEventBus = globalThis as unknown as {
  _agentEventBus: AgentEventBus | undefined;
};

export const agentEventBus: AgentEventBus =
  globalForEventBus._agentEventBus ?? AgentEventBus.getInstance();

if (process.env.NODE_ENV !== 'production') {
  globalForEventBus._agentEventBus = agentEventBus;
}
