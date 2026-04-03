export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getAgent } from '@/lib/identity/agent-registry';
import { signAgentToken } from '@/lib/identity/jwt';

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const agent = await getAgent(params.id);
  if (!agent) {
    return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
  }
  if (agent.status !== 'active') {
    return NextResponse.json({ error: `Agent is ${agent.status}` }, { status: 403 });
  }
  const token = await signAgentToken(agent);
  return NextResponse.json({ token });
}
