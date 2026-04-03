export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getRules, saveRules } from '@/lib/policy/engine';

export async function GET() {
  const rules = await getRules();
  return NextResponse.json({ rules });
}

export async function PUT(req: NextRequest) {
  try {
    const { rules } = await req.json();
    if (!Array.isArray(rules)) {
      return NextResponse.json({ error: 'rules must be an array' }, { status: 400 });
    }
    await saveRules(rules);
    return NextResponse.json({ success: true, rules });
  } catch (err) {
    console.error('[policy rules]', err);
    return NextResponse.json({ error: 'Failed to update rules' }, { status: 500 });
  }
}
