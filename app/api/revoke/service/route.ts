import { NextRequest, NextResponse } from 'next/server';
import { revokeServiceCascade } from '@/lib/revocation/cascade-engine';
import { withAuth, AuthContext } from '@/lib/auth/api-auth';

export const POST = withAuth(async (req: NextRequest, auth: AuthContext) => {
  const userId = auth.userId;
  const { service } = await req.json();
  if (!service) return NextResponse.json({ error: 'service required' }, { status: 400 });
  const result = await revokeServiceCascade(service, userId);
  return NextResponse.json({ success: true, ...result });
});
