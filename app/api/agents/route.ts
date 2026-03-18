import { NextResponse } from 'next/server';
import { listAgents } from '@/lib/identity/agent-registry';

export async function GET() {
  try {
    const agents = await listAgents();
    return NextResponse.json({ agents });
  } catch (err) {
    console.error('[agents list]', err);
    return NextResponse.json({ error: 'Failed to list agents' }, { status: 500 });
  }
}
