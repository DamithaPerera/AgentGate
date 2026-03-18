import { NextResponse } from 'next/server';
import { getAllEntries } from '@/lib/audit/audit-logger';

export async function GET() {
  const entries = await getAllEntries();
  const sorted = entries.sort((a, b) => a.sequenceNumber - b.sequenceNumber);

  return new NextResponse(JSON.stringify({ entries: sorted, exportedAt: new Date().toISOString() }, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': 'attachment; filename="agentgate-audit.json"',
    },
  });
}
