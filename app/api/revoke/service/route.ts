import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { revokeServiceCascade } from '@/lib/revocation/cascade-engine';

export async function POST(req: NextRequest) {
  const session = await getSession();
  const userId = session?.user?.sub ?? 'demo-user';
  const { service } = await req.json();
  if (!service) return NextResponse.json({ error: 'service required' }, { status: 400 });
  const result = await revokeServiceCascade(service, userId);
  return NextResponse.json({ success: true, ...result });
}
