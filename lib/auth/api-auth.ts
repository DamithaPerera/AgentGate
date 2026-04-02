import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { eq } from 'drizzle-orm';
import { auth0 } from '@/lib/auth0';
import { db } from '@/lib/storage/db';
import { apiKeys } from '@/lib/storage/schema';

export type AuthContext = {
  userId: string;
  source: 'session' | 'api_key';
  keyId?: string;
};

// Hash a raw key for storage/lookup
export function hashKey(raw: string): string {
  return createHash('sha256').update(raw).digest('hex');
}

// Generate a new API key: "ag_live_<32 random chars>"
export function generateRawKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = 'ag_live_';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Extract Bearer token from Authorization header
function extractBearer(req: NextRequest): string | null {
  const auth = req.headers.get('authorization') ?? '';
  if (!auth.startsWith('Bearer ')) return null;
  return auth.slice(7).trim();
}

// Resolve auth from either Auth0 session or API key
export async function resolveAuth(req: NextRequest): Promise<AuthContext | null> {
  // 1. Try Auth0 session first
  try {
    const session = await auth0.getSession();
    if (session?.user?.sub) {
      return { userId: session.user.sub, source: 'session' };
    }
  } catch {}

  // 2. Try API key from Authorization header
  const raw = extractBearer(req);
  if (raw && raw.startsWith('ag_live_')) {
    const hash = hashKey(raw);
    try {
      const rows = await db()
        .select()
        .from(apiKeys)
        .where(eq(apiKeys.keyHash, hash))
        .limit(1);

      if (rows.length && rows[0].isActive && !rows[0].revokedAt) {
        // Update last used
        await db()
          .update(apiKeys)
          .set({ lastUsedAt: new Date().toISOString() })
          .where(eq(apiKeys.id, rows[0].id));

        return { userId: rows[0].userId, source: 'api_key', keyId: rows[0].id };
      }
    } catch {}
  }

  return null;
}

// Middleware wrapper — returns 401 if not authenticated
export function withAuth(
  handler: (req: NextRequest, ctx: AuthContext) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    const auth = await resolveAuth(req);
    if (!auth) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Provide a valid API key in the Authorization header or log in.' },
        { status: 401 }
      );
    }
    return handler(req, auth);
  };
}
