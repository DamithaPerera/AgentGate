import { eq } from 'drizzle-orm';
import { db } from '@/lib/storage/db';
import { policyRules as rulesTable } from '@/lib/storage/schema';
import { DEFAULT_RULES } from '@/lib/policy/default-rules';
import type { AuthorizationRequest, PolicyDecision, PolicyResult, PolicyRule } from '@/lib/types';

function rowToRule(row: typeof rulesTable.$inferSelect): PolicyRule {
  return {
    id:          row.id,
    name:        row.name,
    description: row.description,
    condition:   row.condition as PolicyRule['condition'],
    decision:    row.decision as PolicyDecision,
    enabled:     row.enabled,
    createdAt:   row.createdAt,
  };
}

async function loadRules(): Promise<PolicyRule[]> {
  try {
    const rows = await db()
      .select()
      .from(rulesTable)
      .orderBy(rulesTable.sortOrder);
    if (rows.length > 0) return rows.map(rowToRule);
  } catch {
    // DB not yet migrated or unavailable — fall back to defaults
  }
  return DEFAULT_RULES;
}

export async function saveRules(rules: PolicyRule[]): Promise<void> {
  // Upsert all rules in one transaction
  await db().transaction(async tx => {
    for (let i = 0; i < rules.length; i++) {
      const r = rules[i];
      await tx
        .insert(rulesTable)
        .values({
          id:          r.id,
          name:        r.name,
          description: r.description,
          condition:   r.condition as Record<string, unknown>,
          decision:    r.decision,
          enabled:     r.enabled,
          createdAt:   r.createdAt,
          sortOrder:   i,
        })
        .onConflictDoUpdate({
          target: rulesTable.id,
          set: {
            name:        r.name,
            description: r.description,
            condition:   r.condition as Record<string, unknown>,
            decision:    r.decision,
            enabled:     r.enabled,
            sortOrder:   i,
          },
        });
    }
  });
}

export async function getRules(): Promise<PolicyRule[]> {
  return loadRules();
}

function matchesCondition(rule: PolicyRule, request: AuthorizationRequest): boolean {
  const { condition } = rule;

  if (condition.actionTypes && !condition.actionTypes.includes(request.action.type)) return false;
  if (condition.services    && !condition.services.includes(request.action.service))  return false;
  if (condition.minTrustLevel !== undefined && request.subject.trustLevel < condition.minTrustLevel) return false;
  if (condition.maxTrustLevel !== undefined && request.subject.trustLevel > condition.maxTrustLevel) return false;
  if (condition.recipientExternal !== undefined && request.context.recipientExternal !== condition.recipientExternal) return false;

  if (condition.maxRequestsPerMinute !== undefined && rule.decision === 'DENY' &&
      request.context.requestsThisMinute <= condition.maxRequestsPerMinute) return false;

  if (condition.maxRequestsPerMinute !== undefined && rule.decision === 'ALLOW' &&
      request.context.requestsThisMinute > condition.maxRequestsPerMinute) return false;

  if (condition.requireCapability) {
    if (!request.subject.capabilities.includes(condition.requireCapability)) return false;
  }

  return true;
}

export async function evaluate(request: AuthorizationRequest): Promise<PolicyResult> {
  const start = Date.now();
  const rules = await loadRules();
  const enabled = rules.filter(r => r.enabled);

  const serviceScope  = `${request.action.service}.${request.action.type}`;
  const hasCapability = request.subject.capabilities.some(
    cap => cap === serviceScope || cap === `${request.action.service}.*`
  );

  if (!hasCapability) {
    return {
      decision: 'DENY',
      reason: `Agent does not have capability '${serviceScope}'. Declared: ${request.subject.capabilities.join(', ')}`,
      policyId: 'capability-check',
      evaluationTimeMs: Date.now() - start,
    };
  }

  for (const rule of enabled) {
    if (rule.decision === 'DENY' && matchesCondition(rule, request)) {
      return { decision: 'DENY', reason: rule.description, policyId: rule.id, evaluationTimeMs: Date.now() - start };
    }
  }
  for (const rule of enabled) {
    if (rule.decision === 'ESCALATE' && matchesCondition(rule, request)) {
      return { decision: 'ESCALATE', reason: rule.description, policyId: rule.id, evaluationTimeMs: Date.now() - start };
    }
  }
  for (const rule of enabled) {
    if (rule.decision === 'ALLOW' && matchesCondition(rule, request)) {
      return { decision: 'ALLOW', reason: rule.description, policyId: rule.id, evaluationTimeMs: Date.now() - start };
    }
  }

  return { decision: 'DENY', reason: 'No policy rule matched. Default deny.', policyId: 'default-deny', evaluationTimeMs: Date.now() - start };
}

export type { PolicyDecision, PolicyResult };
