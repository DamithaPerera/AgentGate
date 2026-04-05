import { NextRequest, NextResponse } from 'next/server';
import { revokeAgentCascade } from '@/lib/revocation/cascade-engine';
import { withAuth, AuthContext } from '@/lib/auth/api-auth';

export const POST = withAuth(async (req: NextRequest, auth: AuthContext) => {
  const userId = auth.userId;
  const { agentId } = await req.json();
  if (!agentId) return NextResponse.json({ error: 'agentId required' }, { status: 400 });
  const result = await revokeAgentCascade(agentId, userId);
  return NextResponse.json({ success: true, ...result });
});
