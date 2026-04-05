/**
 * Run this once to create tables in Neon:
 *   npm run db:migrate
 */
import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env') });

import { neon } from '@neondatabase/serverless';

async function migrate() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('❌  DATABASE_URL not set. Add it to .env first.');
    process.exit(1);
  }

  const sql = neon(url);

  console.log('🔧  Creating tables in Neon...');

  await sql`
    CREATE TABLE IF NOT EXISTS agents (
      id            TEXT PRIMARY KEY,
      spiffe_id     TEXT NOT NULL,
      name          TEXT NOT NULL,
      framework     TEXT NOT NULL,
      capabilities  JSONB NOT NULL DEFAULT '[]',
      trust_level   INTEGER NOT NULL,
      registered_at TEXT NOT NULL,
      registered_by TEXT NOT NULL,
      status        TEXT NOT NULL DEFAULT 'active',
      last_activity TEXT NOT NULL
    )
  `;
  console.log('  ✔  agents');

  await sql`
    CREATE TABLE IF NOT EXISTS audit_entries (
      id              TEXT PRIMARY KEY,
      timestamp       TEXT NOT NULL,
      sequence_number SERIAL NOT NULL,
      type            TEXT NOT NULL,
      agent_id        TEXT NOT NULL,
      agent_spiffe_id TEXT NOT NULL,
      user_id         TEXT NOT NULL,
      subject         TEXT NOT NULL,
      action          TEXT NOT NULL,
      resource        TEXT NOT NULL,
      context         JSONB NOT NULL DEFAULT '{}',
      decision        TEXT NOT NULL,
      policy_id       TEXT,
      reason          TEXT NOT NULL,
      token_scopes    JSONB,
      token_ttl       INTEGER,
      previous_hash   TEXT NOT NULL,
      hash            TEXT NOT NULL
    )
  `;
  console.log('  ✔  audit_entries');

  await sql`
    CREATE TABLE IF NOT EXISTS policy_rules (
      id          TEXT PRIMARY KEY,
      name        TEXT NOT NULL,
      description TEXT NOT NULL,
      condition   JSONB NOT NULL DEFAULT '{}',
      decision    TEXT NOT NULL,
      enabled     BOOLEAN NOT NULL DEFAULT true,
      created_at  TEXT NOT NULL,
      sort_order  INTEGER NOT NULL DEFAULT 0
    )
  `;
  console.log('  ✔  policy_rules');

  // Index for fast audit queries
  await sql`CREATE INDEX IF NOT EXISTS idx_audit_agent   ON audit_entries (agent_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_audit_time    ON audit_entries (timestamp DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_audit_seq     ON audit_entries (sequence_number DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_agents_status ON agents (status)`;
  console.log('  ✔  indexes');

  await sql`
    CREATE TABLE IF NOT EXISTS api_keys (
      id           TEXT PRIMARY KEY,
      user_id      TEXT NOT NULL,
      name         TEXT NOT NULL,
      key_hash     TEXT NOT NULL UNIQUE,
      key_prefix   TEXT NOT NULL,
      created_at   TEXT NOT NULL,
      last_used_at TEXT,
      revoked_at   TEXT,
      is_active    BOOLEAN NOT NULL DEFAULT true
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_api_keys_user ON api_keys (user_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON api_keys (key_hash)`;
  console.log('  ✔  api_keys');

  console.log('\n✅  Migration complete!');
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
