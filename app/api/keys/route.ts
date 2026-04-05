export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { eq } from 'drizzle-orm';
import { auth0 } from '@/lib/auth0';
import { db } from '@/lib/storage/db';
import { apiKeys } from '@/lib/storage/schema';
import { generateRawKey, hashKey } from '@/lib/auth/api-auth';

// GET — list user's keys (session required)
export async function GET() {
  const session = await auth0.getSession();
  if (!session?.user?.sub) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const rows = await db()
    .select()
    .from(apiKeys)
    .where(eq(apiKeys.userId, session.user.sub));

  // Never return the hash — only safe display fields
  return NextResponse.json({
    keys: rows.map(r => ({
      id: r.id,
      name: r.name,
      keyPrefix: r.keyPrefix,
      createdAt: r.createdAt,
      lastUsedAt: r.lastUsedAt,
      isActive: r.isActive,
    }))
  });
}

// POST — generate a new key (session required)
export async function POST(req: NextRequest) {
  const session = await auth0.getSession();
  if (!session?.user?.sub) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { name } = await req.json() as { name?: string };
  if (!name?.trim()) return NextResponse.json({ error: 'name is required' }, { status: 400 });

  const raw = generateRawKey();
  const id = nanoid(16);

  await db().insert(apiKeys).values({
    id,
    userId: session.user.sub,
    name: name.trim(),
    keyHash: hashKey(raw),
    keyPrefix: raw.slice(0, 12) + '...',
    createdAt: new Date().toISOString(),
    isActive: true,
  });

  // Return raw key ONCE — never stored, never shown again
  return NextResponse.json({ id, name, key: raw, keyPrefix: raw.slice(0, 12) + '...' }, { status: 201 });
}
