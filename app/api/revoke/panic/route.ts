import { NextRequest, NextResponse } from 'next/server';
import { panicRevocation } from '@/lib/revocation/cascade-engine';
import { withAuth, AuthContext } from '@/lib/auth/api-auth';

export const POST = withAuth(async (_req: NextRequest, auth: AuthContext) => {
  const userId = auth.userId;
  const result = await panicRevocation(userId);
  return NextResponse.json({ success: true, ...result });
});
