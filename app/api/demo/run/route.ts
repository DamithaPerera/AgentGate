import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { runDemoScenario } from '@/lib/agents/demo-agents';

export async function POST() {
  const session = await getSession();
  const userId = session?.user?.sub ?? 'demo-user';

  // Run scenario in background (non-blocking)
  runDemoScenario(userId).catch(err => console.error('[demo]', err));

  return NextResponse.json({ started: true, message: 'Demo scenario started — watch the dashboard!' });
}
