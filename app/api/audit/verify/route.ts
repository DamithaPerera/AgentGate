import { NextResponse } from 'next/server';
import { getAllEntries } from '@/lib/audit/audit-logger';
import { verifyChain } from '@/lib/audit/hash-chain';

export const dynamic = 'force-dynamic';

export async function GET() {
  const entries = await getAllEntries();
  const sorted = entries.sort((a, b) => a.sequenceNumber - b.sequenceNumber);
  const result = await verifyChain(sorted);
  return NextResponse.json({ ...result, entryCount: sorted.length });
}
