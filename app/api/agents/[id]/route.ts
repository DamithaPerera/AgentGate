export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth0';
import { getAgent } from '@/lib/identity/agent-registry';
import { revokeAgentCascade } from '@/lib/revocation/cascade-engine';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const agent = await getAgent(params.id);
  if (!agent) {
    return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
  }
  return NextResponse.json({ agent });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth0.getSession();
  const userId = session?.user?.sub ?? 'demo-user';

  const result = await revokeAgentCascade(params.id, userId);
  return NextResponse.json({ success: true, ...result });
}
