import { NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth0';
import { panicRevocation } from '@/lib/revocation/cascade-engine';

export async function POST() {
  const session = await auth0.getSession();
  const userId = session?.user?.sub ?? 'demo-user';
  const result = await panicRevocation(userId);
  return NextResponse.json({ success: true, ...result });
}
