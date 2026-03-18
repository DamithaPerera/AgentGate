import type { AgentEvent, AgentEventType } from '@/lib/types';

type Listener = (event: AgentEvent) => void;

class EventBus {
  private listeners: Listener[] = [];

  subscribe(listener: Listener): () => void {
    this.listeners.push(listener);
    return () => {
      const idx = this.listeners.indexOf(listener);
      if (idx !== -1) this.listeners.splice(idx, 1);
    };
  }

  emit(type: AgentEventType, data: Record<string, unknown>): void {
    const event: AgentEvent = {
      type,
      timestamp: new Date().toISOString(),
      data,
    };
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch {
        // Ignore listener errors
      }
    }
  }
}

// Singleton event bus — shared across all API routes in the same process
declare global {
  // eslint-disable-next-line no-var
  var __agentGateEventBus: EventBus | undefined;
}

export const eventBus: EventBus = globalThis.__agentGateEventBus ?? new EventBus();
globalThis.__agentGateEventBus = eventBus;
