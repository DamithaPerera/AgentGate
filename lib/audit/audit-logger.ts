import { nanoid } from 'nanoid';
import { desc, eq } from 'drizzle-orm';
import { db } from '@/lib/storage/db';
import { auditEntries } from '@/lib/storage/schema';
import { storage } from '@/lib/storage/redis';
import { computeEntryHash, GENESIS_HASH } from '@/lib/audit/hash-chain';
import { eventBus } from '@/lib/events/event-bus';
import type { AuditEntry, AuditEventType, AuditDecision } from '@/lib/types';

// Sequence counter + last hash still use Redis (atomic incr, fast)
const AUDIT_SEQ_KEY       = 'audit:seq';
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

function rowToEntry(row: typeof auditEntries.$inferSelect): AuditEntry {
  return {
    id:             row.id,
    timestamp:      row.timestamp,
    sequenceNumber: row.sequenceNumber,
    type:           row.type as AuditEntry['type'],
    agentId:        row.agentId,
    agentSpiffeId:  row.agentSpiffeId,
    userId:         row.userId,
    subject:        row.subject,
    action:         row.action,
    resource:       row.resource,
    context:        (row.context ?? {}) as Record<string, unknown>,
    decision:       row.decision as AuditEntry['decision'],
    policyId:       row.policyId ?? undefined,
    reason:         row.reason,
    tokenScopes:    (row.tokenScopes ?? undefined) as string[] | undefined,
    tokenTTL:       row.tokenTTL ?? undefined,
    previousHash:   row.previousHash,
    hash:           row.hash,
  };
}

async function getLastHash(): Promise<string> {
  // Try Redis first (fast path)
  const cached = await storage.get(AUDIT_LAST_HASH_KEY);
  if (cached) return cached;

  // Redis lost the key — bootstrap from DB
  const rows = await db()
    .select({ hash: auditEntries.hash })
    .from(auditEntries)
    .orderBy(desc(auditEntries.sequenceNumber))
    .limit(1);

  const lastHash = rows.length ? rows[0].hash : GENESIS_HASH;

  // Restore into Redis so next entry is correct
  await storage.set(AUDIT_LAST_HASH_KEY, lastHash);
  return lastHash;
}

export async function logEntry(params: LogParams): Promise<AuditEntry> {
  const id              = nanoid(16);
  const timestamp       = new Date().toISOString();
  const sequenceNumber  = await storage.incr(AUDIT_SEQ_KEY);
  const previousHash    = await getLastHash();

  const entryWithoutHash: Omit<AuditEntry, 'hash'> = {
    id,
    timestamp,
    sequenceNumber,
    type:          params.type,
    agentId:       params.agentId,
    agentSpiffeId: params.agentSpiffeId,
    userId:        params.userId,
    subject:       params.subject,
    action:        params.action,
    resource:      params.resource,
    context:       params.context ?? {},
    decision:      params.decision,
    policyId:      params.policyId,
    reason:        params.reason,
    tokenScopes:   params.tokenScopes,
    tokenTTL:      params.tokenTTL,
    previousHash,
  };

  const hash  = await computeEntryHash(entryWithoutHash, previousHash);
  const entry: AuditEntry = { ...entryWithoutHash, hash };

  // Persist to Neon Postgres
  await db().insert(auditEntries).values({
    id,
    timestamp,
    type:          entry.type,
    agentId:       entry.agentId,
    agentSpiffeId: entry.agentSpiffeId,
    userId:        entry.userId,
    subject:       entry.subject,
    action:        entry.action,
    resource:      entry.resource,
    context:       entry.context,
    decision:      entry.decision,
    policyId:      entry.policyId ?? null,
    reason:        entry.reason,
    tokenScopes:   entry.tokenScopes ?? null,
    tokenTTL:      entry.tokenTTL ?? null,
    previousHash:  entry.previousHash,
    hash:          entry.hash,
  });

  // Update the last-hash pointer in Redis (fast atomic)
  await storage.set(AUDIT_LAST_HASH_KEY, hash);

  // Broadcast to dashboard via SSE
  eventBus.emit('audit_entry', { entry });

  return entry;
}

export async function getEntries(limit = 100, offset = 0): Promise<AuditEntry[]> {
  const rows = await db()
    .select()
    .from(auditEntries)
    .orderBy(desc(auditEntries.sequenceNumber))
    .limit(limit)
    .offset(offset);
  return rows.map(rowToEntry);
}

export async function getAllEntries(): Promise<AuditEntry[]> {
  return getEntries(10000, 0);
}

export async function getEntriesByAgent(agentId: string, limit = 50): Promise<AuditEntry[]> {
  const rows = await db()
    .select()
    .from(auditEntries)
    .where(eq(auditEntries.agentId, agentId))
    .orderBy(desc(auditEntries.sequenceNumber))
    .limit(limit);
  return rows.map(rowToEntry);
}
