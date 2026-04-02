import {
  pgTable, text, integer, boolean, timestamp, jsonb, serial,
} from 'drizzle-orm/pg-core';

// ── API Keys ──────────────────────────────────────────────────────────────────
export const apiKeys = pgTable('api_keys', {
  id:          text('id').primaryKey(),           // nanoid(16)
  userId:      text('user_id').notNull(),          // Auth0 sub
  name:        text('name').notNull(),             // "My Agent Key"
  keyHash:     text('key_hash').notNull().unique(), // SHA-256 of the key
  keyPrefix:   text('key_prefix').notNull(),       // first 8 chars for display "ag_live_xxxx..."
  createdAt:   text('created_at').notNull(),
  lastUsedAt:  text('last_used_at'),
  revokedAt:   text('revoked_at'),
  isActive:    boolean('is_active').notNull().default(true),
});

// ── Agents ────────────────────────────────────────────────────────────────────
export const agents = pgTable('agents', {
  id:           text('id').primaryKey(),
  spiffeId:     text('spiffe_id').notNull(),
  name:         text('name').notNull(),
  framework:    text('framework').notNull(),
  capabilities: jsonb('capabilities').notNull().$type<string[]>(),
  trustLevel:   integer('trust_level').notNull(),
  registeredAt: text('registered_at').notNull(),
  registeredBy: text('registered_by').notNull(),
  status:       text('status').notNull().default('active'),
  lastActivity: text('last_activity').notNull(),
});

// ── Audit Trail ───────────────────────────────────────────────────────────────
export const auditEntries = pgTable('audit_entries', {
  id:             text('id').primaryKey(),
  timestamp:      text('timestamp').notNull(),
  sequenceNumber: serial('sequence_number').notNull(),
  type:           text('type').notNull(),
  agentId:        text('agent_id').notNull(),
  agentSpiffeId:  text('agent_spiffe_id').notNull(),
  userId:         text('user_id').notNull(),
  subject:        text('subject').notNull(),
  action:         text('action').notNull(),
  resource:       text('resource').notNull(),
  context:        jsonb('context').notNull().default({}).$type<Record<string, unknown>>(),
  decision:       text('decision').notNull(),
  policyId:       text('policy_id'),
  reason:         text('reason').notNull(),
  tokenScopes:    jsonb('token_scopes').$type<string[]>(),
  tokenTTL:       integer('token_ttl'),
  previousHash:   text('previous_hash').notNull(),
  hash:           text('hash').notNull(),
});

// ── Policy Rules ──────────────────────────────────────────────────────────────
export const policyRules = pgTable('policy_rules', {
  id:          text('id').primaryKey(),
  name:        text('name').notNull(),
  description: text('description').notNull(),
  condition:   jsonb('condition').notNull().$type<Record<string, unknown>>(),
  decision:    text('decision').notNull(),
  enabled:     boolean('enabled').notNull().default(true),
  createdAt:   text('created_at').notNull(),
  sortOrder:   integer('sort_order').notNull().default(0),
});
