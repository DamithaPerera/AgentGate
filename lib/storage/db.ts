import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set');
  const sql = neon(url);
  return drizzle(sql, { schema });
}

// Singleton for the connection
let _db: ReturnType<typeof getDb> | null = null;

export function db() {
  if (!_db) _db = getDb();
  return _db;
}
