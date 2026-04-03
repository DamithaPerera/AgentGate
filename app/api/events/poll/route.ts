import { NextRequest, NextResponse } from 'next/server';
import { gt } from 'drizzle-orm';
import { db } from '@/lib/storage/db';
import { auditEntries } from '@/lib/storage/schema';
import type { AgentEvent } from '@/lib/types';

export const dynamic = 'force-dynamic';

// Maps audit entry decisions/types to AgentEventType
function toEventType(type: string): AgentEvent['type'] {
  const map: Record<string, AgentEvent['type']> = {
    REGISTRATION:      'agent_registered',
    AUTH_REQUEST:      'auth_request',
    POLICY_EVAL:       'auth_request',
    TOKEN_ISSUED:      'token_issued',
    CIBA_REQUEST:      'ciba_request',
    CIBA_APPROVED:     'ciba_approved',
    CIBA_DENIED:       'ciba_denied',
    CIBA_EXPIRED:      'ciba_expired',
    AGENT_REVOKED:     'agent_revoked',
    SERVICE_REVOKED:   'revocation',
    CASCADE_REVOCATION:'revocation',
    PANIC_REVOCATION:  'panic_revocation',
    TOKEN_REVOKED:     'revocation',
  };
  return map[type] ?? 'auth_request';
}

export async function GET(req: NextRequest) {
  const since = req.nextUrl.searchParams.get('since');

  try {
    const query = db()
      .select()
      .from(auditEntries)
      .orderBy(auditEntries.timestamp);

    const rows = since
      ? await query.where(gt(auditEntries.timestamp, since)).limit(50)
      : await query.limit(20);

    const events: AgentEvent[] = rows.map(row => ({
      type:      toEventType(row.type),
      timestamp: row.timestamp,
      data: {
        agentId:   row.agentId,
        agentName: row.subject,
        action:    row.action,
        resource:  row.resource,
        decision:  row.decision,
        reason:    row.reason,
        auditId:   row.id,
        policyId:  row.policyId ?? undefined,
      },
    }));

    return NextResponse.json({ events, serverTime: new Date().toISOString() });
  } catch (err) {
    console.error('[events/poll]', err);
    return NextResponse.json({ events: [], serverTime: new Date().toISOString() });
  }
}
