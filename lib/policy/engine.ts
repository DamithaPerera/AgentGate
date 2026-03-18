import { storage } from '@/lib/storage/redis';
import { DEFAULT_RULES } from '@/lib/policy/default-rules';
import type { AuthorizationRequest, PolicyDecision, PolicyResult, PolicyRule } from '@/lib/types';

const RULES_KEY = 'policy:rules';

// Load active rules from storage (falls back to defaults)
async function loadRules(): Promise<PolicyRule[]> {
  const raw = await storage.get(RULES_KEY);
  if (!raw) return DEFAULT_RULES;
  try {
    return JSON.parse(raw) as PolicyRule[];
  } catch {
    return DEFAULT_RULES;
  }
}

export async function saveRules(rules: PolicyRule[]): Promise<void> {
  await storage.set(RULES_KEY, JSON.stringify(rules));
}

export async function getRules(): Promise<PolicyRule[]> {
  return loadRules();
}

function matchesCondition(
  rule: PolicyRule,
  request: AuthorizationRequest
): boolean {
  const { condition } = rule;

  // Action type filter
  if (condition.actionTypes && !condition.actionTypes.includes(request.action.type)) {
    return false;
  }

  // Service filter
  if (condition.services && !condition.services.includes(request.action.service)) {
    return false;
  }

  // Min trust level
  if (
    condition.minTrustLevel !== undefined &&
    request.subject.trustLevel < condition.minTrustLevel
  ) {
    return false;
  }

  // Max trust level
  if (
    condition.maxTrustLevel !== undefined &&
    request.subject.trustLevel > condition.maxTrustLevel
  ) {
    return false;
  }

  // External recipient
  if (
    condition.recipientExternal !== undefined &&
    request.context.recipientExternal !== condition.recipientExternal
  ) {
    return false;
  }

  // Rate limit: deny-rate-limit rule fires when requestsThisMinute EXCEEDS limit
  if (
    condition.maxRequestsPerMinute !== undefined &&
    rule.decision === 'DENY' &&
    request.context.requestsThisMinute <= condition.maxRequestsPerMinute
  ) {
    return false;
  }

  // For ALLOW rule, require rate is within limit
  if (
    condition.maxRequestsPerMinute !== undefined &&
    rule.decision === 'ALLOW' &&
    request.context.requestsThisMinute > condition.maxRequestsPerMinute
  ) {
    return false;
  }

  // Required capability
  if (condition.requireCapability) {
    const hasCapability = request.subject.capabilities.includes(condition.requireCapability);
    if (!hasCapability) return false;
  }

  return true;
}

export async function evaluate(request: AuthorizationRequest): Promise<PolicyResult> {
  const start = Date.now();
  const rules = await loadRules();
  const enabledRules = rules.filter(r => r.enabled);

  // Check if action is within declared capabilities
  const serviceScope = `${request.action.service}.${request.action.type}`;
  const hasCapability = request.subject.capabilities.some(
    cap => cap === serviceScope || cap === `${request.action.service}.*`
  );

  if (!hasCapability) {
    return {
      decision: 'DENY',
      reason: `Agent does not have capability '${serviceScope}'. Declared capabilities: ${request.subject.capabilities.join(', ')}`,
      policyId: 'capability-check',
      evaluationTimeMs: Date.now() - start,
    };
  }

  // Priority: DENY > ESCALATE > ALLOW
  // Evaluate DENY rules first
  for (const rule of enabledRules) {
    if (rule.decision === 'DENY' && matchesCondition(rule, request)) {
      return {
        decision: 'DENY',
        reason: rule.description,
        policyId: rule.id,
        evaluationTimeMs: Date.now() - start,
      };
    }
  }

  // Then ESCALATE rules
  for (const rule of enabledRules) {
    if (rule.decision === 'ESCALATE' && matchesCondition(rule, request)) {
      return {
        decision: 'ESCALATE',
        reason: rule.description,
        policyId: rule.id,
        evaluationTimeMs: Date.now() - start,
      };
    }
  }

  // Then ALLOW rules
  for (const rule of enabledRules) {
    if (rule.decision === 'ALLOW' && matchesCondition(rule, request)) {
      return {
        decision: 'ALLOW',
        reason: rule.description,
        policyId: rule.id,
        evaluationTimeMs: Date.now() - start,
      };
    }
  }

  // Default deny
  return {
    decision: 'DENY',
    reason: 'No policy rule matched. Default deny.',
    policyId: 'default-deny',
    evaluationTimeMs: Date.now() - start,
  };
}

export type { PolicyDecision, PolicyResult };
