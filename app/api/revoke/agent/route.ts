import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { revokeAgentCascade } from '@/lib/revocation/cascade-engine';

export async function POST(req: NextRequest) {
  const session = await getSession();
  const userId = session?.user?.sub ?? 'demo-user';
  const { agentId } = await req.json();
  if (!agentId) return NextResponse.json({ error: 'agentId required' }, { status: 400 });
  const result = await revokeAgentCascade(agentId, userId);
  return NextResponse.json({ success: true, ...result });
}
