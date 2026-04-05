export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { compileNaturalLanguagePolicy } from '@/lib/policy/compiler';
import { getRules, saveRules } from '@/lib/policy/engine';

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();
    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'text is required' }, { status: 400 });
    }

    const newRules = await compileNaturalLanguagePolicy(text);
    const existing = await getRules();
    const merged = [...existing, ...newRules];
    await saveRules(merged);

    return NextResponse.json({ rules: newRules, allRules: merged });
  } catch (err) {
    console.error('[policy compile]', err);
    return NextResponse.json({ error: 'Compilation failed' }, { status: 500 });
  }
}
