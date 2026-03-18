import { nanoid } from 'nanoid';
import { storage } from '@/lib/storage/redis';
import { computeEntryHash, GENESIS_HASH } from '@/lib/audit/hash-chain';
import { eventBus } from '@/lib/events/event-bus';
import type { AuditEntry, AuditEventType, AuditDecision } from '@/lib/types';

const AUDIT_LIST_KEY = 'audit:entries';
const AUDIT_SEQ_KEY = 'audit:seq';
const AUDIT_LAST_HASH_KEY = 'audit:last_hash';

export type LogParams = {
  type: AuditEventType;
  agentId: string;
  agentSpiffeId: string;
  userId: string;
  subject: string;
  action: string;
  resource: string;
  context?: Record<string, unknown>;
  decision: AuditDecision;
  policyId?: string;
  reason: string;
  tokenScopes?: string[];
  tokenTTL?: number;
};

export async function logEntry(params: LogParams): Promise<AuditEntry> {
  const id = nanoid(16);
  const timestamp = new Date().toISOString();
  const sequenceNumber = await storage.incr(AUDIT_SEQ_KEY);
  const previousHash = (await storage.get(AUDIT_LAST_HASH_KEY)) ?? GENESIS_HASH;

  const entryWithoutHash: Omit<AuditEntry, 'hash'> = {
    id,
    timestamp,
    sequenceNumber,
    type: params.type,
    agentId: params.agentId,
    agentSpiffeId: params.agentSpiffeId,
    userId: params.userId,
    subject: params.subject,
    action: params.action,
    resource: params.resource,
    context: params.context ?? {},
    decision: params.decision,
    policyId: params.policyId,
    reason: params.reason,
    tokenScopes: params.tokenScopes,
    tokenTTL: params.tokenTTL,
    previousHash,
  };

  const hash = await computeEntryHash(entryWithoutHash, previousHash);
  const entry: AuditEntry = { ...entryWithoutHash, hash };

  // Store in list (newest first)
  await storage.lpush(AUDIT_LIST_KEY, JSON.stringify(entry));
  await storage.set(AUDIT_LAST_HASH_KEY, hash);

  // Broadcast to dashboard
  eventBus.emit('audit_entry', { entry });

  return entry;
}

export async function getEntries(limit = 100, offset = 0): Promise<AuditEntry[]> {
  const raw = await storage.lrange(AUDIT_LIST_KEY, offset, offset + limit - 1);
  return raw
    .map(r => {
      try { return JSON.parse(r) as AuditEntry; } catch { return null; }
    })
    .filter((e): e is AuditEntry => e !== null);
}

export async function getAllEntries(): Promise<AuditEntry[]> {
  return getEntries(10000, 0);
}
