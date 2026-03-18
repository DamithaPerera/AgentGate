import { verifyAgentToken } from '@/lib/identity/jwt';
import { getAgent, updateAgentActivity } from '@/lib/identity/agent-registry';
import { evaluate as evaluatePolicy } from '@/lib/policy/engine';
import { requestConsent } from '@/lib/consent/ciba-engine';
import { issueToken } from '@/lib/auth0/token-vault';
import { logEntry } from '@/lib/audit/audit-logger';
import { incrementRequestCount, getRequestCount } from '@/lib/authorization/rate-limiter';
import { eventBus } from '@/lib/events/event-bus';
import type { AuthorizationResult, AuthorizationRequest } from '@/lib/types';

export interface GateRequest {
  agentToken: string;
  action: {
    type: 'read' | 'write' | 'delete' | 'execute';
    operation: string;
    service: string;
  };
  resource: {
    type: string;
    id?: string;
    owner?: string;
  };
  context?: {
    ipAddress?: string;
    recipientExternal?: boolean;
    tokenTTL?: number;
  };
  userId?: string; // override for demo
}

async function deny(
  reason: string,
  policyId: string,
  agentId: string,
  agentSpiffeId: string,
  userId: string,
  action: string,
  resource: string,
  gates: AuthorizationResult['gates']
): Promise<AuthorizationResult> {
  const entry = await logEntry({
    type: 'AUTH_REQUEST',
    agentId,
    agentSpiffeId,
    userId,
    subject: agentId,
    action,
    resource,
    context: {},
    decision: 'DENIED',
    policyId,
    reason,
  });

  eventBus.emit('auth_request', {
    agentId,
    action,
    resource,
    decision: 'DENIED',
    reason,
    auditId: entry.id,
  });

  return { allowed: false, reason, policyId, auditId: entry.id, gates };
}

export async function authorize(request: GateRequest): Promise<AuthorizationResult> {
  const gates: AuthorizationResult['gates'] = {
    identity: 'fail',
    intent: 'fail',
    policy: 'fail',
    token: 'fail',
  };

  // ── GATE 1: IDENTITY ─────────────────────────────────────────────────────
  const claims = await verifyAgentToken(request.agentToken);
  if (!claims) {
    return deny('Agent identity token invalid or expired', 'identity-check', 'unknown', 'unknown', request.userId ?? 'unknown', request.action.operation, request.resource.type, gates);
  }

  const agent = await getAgent(claims.sub);
  if (!agent) {
    return deny('Agent not found in registry', 'identity-check', claims.sub, claims.spiffe, request.userId ?? claims.registeredBy, request.action.operation, request.resource.type, gates);
  }

  if (agent.status !== 'active') {
    return deny(`Agent is ${agent.status}`, 'identity-check', agent.id, agent.spiffeId, request.userId ?? agent.registeredBy, request.action.operation, request.resource.type, gates);
  }

  gates.identity = 'pass';
  await updateAgentActivity(agent.id);

  // ── GATE 2: INTENT PARSING ───────────────────────────────────────────────
  const requestsThisMinute = await getRequestCount(agent.id);
  const authRequest: AuthorizationRequest = {
    subject: {
      agentId: agent.id,
      spiffeId: agent.spiffeId,
      trustLevel: agent.trustLevel,
      framework: agent.framework,
      capabilities: agent.capabilities,
    },
    action: request.action,
    resource: request.resource,
    context: {
      timestamp: new Date().toISOString(),
      ipAddress: request.context?.ipAddress,
      recipientExternal: request.context?.recipientExternal,
      requestsThisMinute,
      tokenTTL: request.context?.tokenTTL ?? 60,
    },
  };

  gates.intent = 'parsed';

  // ── GATE 3: POLICY EVALUATION ────────────────────────────────────────────
  const policyResult = await evaluatePolicy(authRequest);
  await incrementRequestCount(agent.id);

  const userId = request.userId ?? agent.registeredBy;

  await logEntry({
    type: 'POLICY_EVAL',
    agentId: agent.id,
    agentSpiffeId: agent.spiffeId,
    userId,
    subject: agent.id,
    action: `${request.action.service}.${request.action.type}:${request.action.operation}`,
    resource: `${request.resource.type}${request.resource.id ? ':' + request.resource.id : ''}`,
    context: { ...authRequest.context, trustLevel: agent.trustLevel },
    decision: policyResult.decision === 'ALLOW' ? 'ALLOWED' : policyResult.decision === 'ESCALATE' ? 'ESCALATED' : 'DENIED',
    policyId: policyResult.policyId,
    reason: policyResult.reason,
  });

  gates.policy = policyResult.decision;

  if (policyResult.decision === 'DENY') {
    eventBus.emit('auth_request', {
      agentId: agent.id,
      agentName: agent.name,
      action: `${request.action.service}.${request.action.operation}`,
      resource: request.resource.type,
      decision: 'DENIED',
      reason: policyResult.reason,
    });

    return deny(policyResult.reason, policyResult.policyId, agent.id, agent.spiffeId, userId, `${request.action.service}.${request.action.operation}`, request.resource.type, gates);
  }

  if (policyResult.decision === 'ALLOW') {
    gates.consent = 'skipped';
  }

  // ── GATE 4: CONSENT (if ESCALATE) ────────────────────────────────────────
  if (policyResult.decision === 'ESCALATE') {
    const consentResult = await requestConsent({
      agentId: agent.id,
      agentName: agent.name,
      action: request.action.operation,
      resource: request.resource.type,
      service: request.action.service,
      reason: policyResult.reason,
      userId,
    });

    gates.consent = consentResult.approved ? 'approved' : 'denied';

    if (!consentResult.approved) {
      await logEntry({
        type: 'CIBA_DENIED',
        agentId: agent.id,
        agentSpiffeId: agent.spiffeId,
        userId,
        subject: agent.id,
        action: request.action.operation,
        resource: request.resource.type,
        context: {},
        decision: 'DENIED',
        reason: consentResult.reason ?? 'User denied',
      });

      return {
        allowed: false,
        reason: consentResult.reason ?? 'User denied',
        auditId: undefined,
        gates,
      };
    }

    // Token already issued inside requestConsent — log and return
    await logEntry({
      type: 'CIBA_APPROVED',
      agentId: agent.id,
      agentSpiffeId: agent.spiffeId,
      userId,
      subject: agent.id,
      action: request.action.operation,
      resource: request.resource.type,
      context: {},
      decision: 'ALLOWED',
      reason: 'CIBA approved by user',
      tokenScopes: consentResult.token?.scopes,
      tokenTTL: consentResult.token?.ttl,
    });

    gates.token = 'issued';

    eventBus.emit('auth_request', {
      agentId: agent.id,
      agentName: agent.name,
      action: `${request.action.service}.${request.action.operation}`,
      resource: request.resource.type,
      decision: 'APPROVED_CIBA',
      tokenTTL: 60,
    });

    return {
      allowed: true,
      token: consentResult.token,
      gates,
    };
  }

  // ── GATE 5: SCOPED TOKEN ISSUANCE (auto-approve) ─────────────────────────
  const token = await issueToken({
    agentId: agent.id,
    service: request.action.service,
    scopes: [`${request.action.service}.${request.action.type}`],
    ttl: request.context?.tokenTTL ?? 60,
  });

  const auditEntry = await logEntry({
    type: 'TOKEN_ISSUED',
    agentId: agent.id,
    agentSpiffeId: agent.spiffeId,
    userId,
    subject: agent.id,
    action: request.action.operation,
    resource: request.resource.type,
    context: { ...authRequest.context },
    decision: 'ALLOWED',
    policyId: policyResult.policyId,
    reason: `Auto-approved: ${policyResult.reason}`,
    tokenScopes: token.scopes,
    tokenTTL: token.ttl,
  });

  gates.token = 'issued';

  eventBus.emit('auth_request', {
    agentId: agent.id,
    agentName: agent.name,
    action: `${request.action.service}.${request.action.operation}`,
    resource: request.resource.type,
    decision: 'ALLOWED',
    tokenTTL: token.ttl,
    auditId: auditEntry.id,
  });

  return {
    allowed: true,
    token,
    auditId: auditEntry.id,
    gates,
  };
}
