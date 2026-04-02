import { NextRequest, NextResponse } from 'next/server';
import { getEntries } from '@/lib/audit/audit-logger';
import { withAuth } from '@/lib/auth/api-auth';

export const GET = withAuth(async (req: NextRequest) => {
  const url = new URL(req.url);
  const limit = parseInt(url.searchParams.get('limit') ?? '50', 10);
  const offset = parseInt(url.searchParams.get('offset') ?? '0', 10);
  const entries = await getEntries(limit, offset);
  return NextResponse.json({ entries, total: entries.length });
});
