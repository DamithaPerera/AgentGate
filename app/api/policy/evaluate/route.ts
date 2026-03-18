import { NextRequest, NextResponse } from 'next/server';
import { evaluate } from '@/lib/policy/engine';

export async function POST(req: NextRequest) {
  try {
    const request = await req.json();
    const result = await evaluate(request);
    return NextResponse.json(result);
  } catch (err) {
    console.error('[policy evaluate]', err);
    return NextResponse.json({ error: 'Evaluation failed' }, { status: 500 });
  }
}
