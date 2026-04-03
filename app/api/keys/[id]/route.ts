export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { auth0 } from '@/lib/auth0';
import { db } from '@/lib/storage/db';
import { apiKeys } from '@/lib/storage/schema';

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth0.getSession();
  if (!session?.user?.sub) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await db()
    .update(apiKeys)
    .set({ isActive: false, revokedAt: new Date().toISOString() })
    .where(and(eq(apiKeys.id, params.id), eq(apiKeys.userId, session.user.sub)));

  return NextResponse.json({ success: true });
}
