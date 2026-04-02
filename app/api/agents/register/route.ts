import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { registerAgent } from '@/lib/identity/agent-registry';
import { logEntry } from '@/lib/audit/audit-logger';
import { withAuth, AuthContext } from '@/lib/auth/api-auth';

const RegisterSchema = z.object({
  name: z.string().min(1).max(100),
  framework: z.enum(['crewai', 'langgraph', 'autogen', 'custom', 'mcp']),
  capabilities: z.array(z.string()).min(1).max(20),
  trustLevel: z.number().int().min(1).max(5).default(2),
});

export const POST = withAuth(async (req: NextRequest, auth: AuthContext) => {
  const userId = auth.userId;

  try {
    const body = await req.json();
    const parsed = RegisterSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { agent, token } = await registerAgent({
      ...parsed.data,
      registeredBy: userId,
    });

    await logEntry({
      type: 'REGISTRATION',
      agentId: agent.id,
      agentSpiffeId: agent.spiffeId,
      userId,
      subject: agent.id,
      action: 'register',
      resource: 'agent-registry',
      context: { framework: agent.framework, capabilities: agent.capabilities, trustLevel: agent.trustLevel },
      decision: 'REGISTERED',
      reason: `Agent '${agent.name}' registered by ${userId}`,
    });

    return NextResponse.json({ agent, token }, { status: 201 });
  } catch (err) {
    console.error('[register]', err);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
});
