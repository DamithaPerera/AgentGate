import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { panicRevocation } from '@/lib/revocation/cascade-engine';

export async function POST() {
  const session = await getSession();
  const userId = session?.user?.sub ?? 'demo-user';
  const result = await panicRevocation(userId);
  return NextResponse.json({ success: true, ...result });
}
