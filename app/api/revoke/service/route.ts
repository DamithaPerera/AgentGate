import { NextRequest, NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth0';
import { revokeServiceCascade } from '@/lib/revocation/cascade-engine';

export async function POST(req: NextRequest) {
  const session = await auth0.getSession();
  const userId = session?.user?.sub ?? 'demo-user';
  const { service } = await req.json();
  if (!service) return NextResponse.json({ error: 'service required' }, { status: 400 });
  const result = await revokeServiceCascade(service, userId);
  return NextResponse.json({ success: true, ...result });
}
