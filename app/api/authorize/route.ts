import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authorize } from '@/lib/authorization/five-gates';

const AuthorizeSchema = z.object({
  agentToken: z.string(),
  action: z.object({
    type: z.enum(['read', 'write', 'delete', 'execute']),
    operation: z.string(),
    service: z.string(),
  }),
  resource: z.object({
    type: z.string(),
    id: z.string().optional(),
    owner: z.string().optional(),
  }),
  context: z.object({
    ipAddress: z.string().optional(),
    recipientExternal: z.boolean().optional(),
    tokenTTL: z.number().optional(),
  }).optional(),
  userId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = AuthorizeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const result = await authorize(parsed.data);

    return NextResponse.json(result, {
      status: result.allowed ? 200 : 403,
    });
  } catch (err) {
    console.error('[authorize]', err);
    return NextResponse.json({ error: 'Authorization failed' }, { status: 500 });
  }
}
