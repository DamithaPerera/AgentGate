import { createHash } from 'crypto';
import type { AuditEntry, AuditEventType, AuditOutcome, ServiceType } from '@/lib/types';

// ─── AuditLogger ──────────────────────────────────────────────────────────────
// Hash-chained audit trail. Each entry contains:
//   - previousHash: SHA-256 of the prior entry (genesis = '0'.repeat(64))
//   - hash: SHA-256 of (entry content + previousHash)
// This makes retroactive tampering detectable.

class AuditLogger {
  private static instance: AuditLogger;
  private entries: AuditEntry[] = [];

  private constructor() {}

  static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger();
    }
    return AuditLogger.instance;
  }

  private computeHash(entry: Omit<AuditEntry, 'hash'>, previousHash: string): string {
    const content = JSON.stringify({
      id: entry.id,
      timestamp: entry.timestamp.toISOString(),
      type: entry.type,
      parentAgentId: entry.parentAgentId,
      childAgentId: entry.childAgentId,
      service: entry.service,
      action: entry.action,
      scopeRequested: entry.scopeRequested,
      scopeGranted: entry.scopeGranted,
      outcome: entry.outcome,
      details: entry.details,
      previousHash,
    });
    return createHash('sha256').update(content).digest('hex');
  }

  append(params: {
    type: AuditEventType;
    parentAgentId: string;
    childAgentId?: string;
    service: string;
    action: string;
    scopeRequested?: string[];
    scopeGranted?: string[];
    outcome: AuditOutcome;
    details?: Record<string, unknown>;
  }): AuditEntry {
    const previousHash =
      this.entries.length > 0
        ? this.entries[this.entries.length - 1].hash
        : '0'.repeat(64);

    const entryWithoutHash: Omit<AuditEntry, 'hash'> = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      type: params.type,
      parentAgentId: params.parentAgentId,
      childAgentId: params.childAgentId,
      service: params.service,
      action: params.action,
      scopeRequested: params.scopeRequested ?? [],
      scopeGranted: params.scopeGranted ?? [],
      outcome: params.outcome,
      details: params.details ?? {},
      previousHash,
    };

    const hash = this.computeHash(entryWithoutHash, previousHash);
    const entry: AuditEntry = { ...entryWithoutHash, hash };

    this.entries.push(entry);
    return entry;
  }

  /** Get all entries (newest first) */
  getEntries(options?: {
    limit?: number;
    service?: ServiceType | string;
    agentId?: string;
    type?: AuditEventType;
  }): AuditEntry[] {
    let result = [...this.entries].reverse();

    if (options?.service) {
      result = result.filter((e) => e.service === options.service);
    }
    if (options?.agentId) {
      result = result.filter(
        (e) =>
          e.parentAgentId === options.agentId ||
          e.childAgentId === options.agentId,
      );
    }
    if (options?.type) {
      result = result.filter((e) => e.type === options.type);
    }
    if (options?.limit) {
      result = result.slice(0, options.limit);
    }

    return result;
  }

  getCount(): number {
    return this.entries.length;
  }

  /** Verify the hash chain integrity */
  verifyChain(): { valid: boolean; invalidAtIndex?: number } {
    for (let i = 0; i < this.entries.length; i++) {
      const entry = this.entries[i];
      const expectedPrevHash = i === 0 ? '0'.repeat(64) : this.entries[i - 1].hash;

      if (entry.previousHash !== expectedPrevHash) {
        return { valid: false, invalidAtIndex: i };
      }

      const recomputed = this.computeHash(
        { ...entry, hash: undefined as unknown as string },
        entry.previousHash,
      );

      if (recomputed !== entry.hash) {
        return { valid: false, invalidAtIndex: i };
      }
    }
    return { valid: true };
  }

  /** Export full audit trail as JSON */
  exportJSON(): string {
    return JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        entryCount: this.entries.length,
        chainValid: this.verifyChain().valid,
        entries: this.entries,
      },
      null,
      2,
    );
  }
}

// ─── Global singleton ─────────────────────────────────────────────────────────
const globalForAudit = globalThis as unknown as {
  _auditLogger: AuditLogger | undefined;
};

export const auditLogger: AuditLogger =
  globalForAudit._auditLogger ?? AuditLogger.getInstance();

if (process.env.NODE_ENV !== 'production') {
  globalForAudit._auditLogger = auditLogger;
}
