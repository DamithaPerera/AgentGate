import { NextRequest, NextResponse } from 'next/server';
import { listAgents } from '@/lib/identity/agent-registry';
import { withAuth } from '@/lib/auth/api-auth';

export const GET = withAuth(async (_req: NextRequest) => {
  try {
    const agents = await listAgents();
    return NextResponse.json({ agents });
  } catch (err) {
    console.error('[agents list]', err);
    return NextResponse.json({ error: 'Failed to list agents' }, { status: 500 });
  }
});
