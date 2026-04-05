export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { respondToConsent } from '@/lib/consent/consent-store';

export async function POST(req: NextRequest) {
  try {
    const { requestId, approved } = await req.json();
    if (!requestId || typeof approved !== 'boolean') {
      return NextResponse.json({ error: 'requestId and approved are required' }, { status: 400 });
    }
    const result = await respondToConsent(requestId, approved);
    if (!result) {
      return NextResponse.json({ error: 'Consent request not found or expired' }, { status: 404 });
    }
    return NextResponse.json({ result });
  } catch (err) {
    console.error('[consent respond]', err);
    return NextResponse.json({ error: 'Failed to respond' }, { status: 500 });
  }
}
