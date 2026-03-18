// ─── Agent Identity ───────────────────────────────────────────────────────────

export interface AgentIdentity {
  id: string;
  spiffeId: string;
  name: string;
  framework: 'crewai' | 'langgraph' | 'autogen' | 'custom' | 'mcp';
  capabilities: string[];
  trustLevel: number; // 1-5
  registeredAt: string; // ISO date string
  registeredBy: string; // Auth0 user ID
  status: 'active' | 'suspended' | 'revoked';
  lastActivity: string; // ISO date string
}

// ─── Authorization Request (AuthZEN 4-tuple) ─────────────────────────────────

export interface AuthorizationRequest {
  subject: {
    agentId: string;
    spiffeId: string;
    trustLevel: number;
    framework: string;
    capabilities: string[];
    delegatedBy?: string;
  };
  action: {
    type: 'read' | 'write' | 'delete' | 'execute';
    operation: string; // e.g. "send_email", "close_issue"
    service: string;   // e.g. "gmail", "github", "calendar"
  };
  resource: {
    type: string;
    id?: string;
    owner?: string;
  };
  context: {
    timestamp: string;
    ipAddress?: string;
    recipientExternal?: boolean;
    requestsThisMinute: number;
    parentScope?: string[];
    tokenTTL?: number;
  };
}

// ─── Policy ───────────────────────────────────────────────────────────────────

export type PolicyDecision = 'ALLOW' | 'ESCALATE' | 'DENY';

export interface PolicyResult {
  decision: PolicyDecision;
  reason: string;
  policyId: string;
  evaluationTimeMs: number;
}

export interface PolicyRule {
  id: string;
  name: string;
  description: string;
  condition: PolicyRuleCondition;
  decision: PolicyDecision;
  enabled: boolean;
  createdAt: string;
}

export interface PolicyRuleCondition {
  actionTypes?: Array<'read' | 'write' | 'delete' | 'execute'>;
  services?: string[];
  minTrustLevel?: number;
  maxTrustLevel?: number;
  recipientExternal?: boolean;
  maxRequestsPerMinute?: number;
  requireCapability?: string;
}

// ─── Consent / CIBA ──────────────────────────────────────────────────────────

export interface ConsentRequest {
  id: string;
  agentId: string;
  agentName: string;
  action: string;
  resource: string;
  reason: string;
  userId: string;
  status: 'pending' | 'approved' | 'denied' | 'expired';
  createdAt: string;
  expiresAt: string;
  respondedAt?: string;
}

export interface ConsentResult {
  approved: boolean;
  token?: ScopedToken;
  reason?: string;
}

// ─── Scoped Token ─────────────────────────────────────────────────────────────

export interface ScopedToken {
  token: string;
  service: string;
  scopes: string[];
  issuedTo: string;
  issuedBy: string;
  delegatedFrom?: string;
  ttl: number;
  issuedAt: string;
  expiresAt: string;
  revocable: true;
}

// ─── Audit Trail ─────────────────────────────────────────────────────────────

export type AuditEventType =
  | 'REGISTRATION'
  | 'AUTH_REQUEST'
  | 'POLICY_EVAL'
  | 'CIBA_REQUEST'
  | 'CIBA_APPROVED'
  | 'CIBA_DENIED'
  | 'CIBA_EXPIRED'
  | 'TOKEN_ISSUED'
  | 'TOKEN_EXPIRED'
  | 'TOKEN_REVOKED'
  | 'AGENT_REVOKED'
  | 'SERVICE_REVOKED'
  | 'CASCADE_REVOCATION'
  | 'PANIC_REVOCATION';

export type AuditDecision =
  | 'ALLOWED'
  | 'DENIED'
  | 'ESCALATED'
  | 'REVOKED'
  | 'EXPIRED'
  | 'REGISTERED'
  | 'PENDING';

export interface AuditEntry {
  id: string;
  timestamp: string;
  sequenceNumber: number;
  type: AuditEventType;
  agentId: string;
  agentSpiffeId: string;
  userId: string;
  subject: string;
  action: string;
  resource: string;
  context: Record<string, unknown>;
  decision: AuditDecision;
  policyId?: string;
  reason: string;
  tokenScopes?: string[];
  tokenTTL?: number;
  previousHash: string;
  hash: string;
}

// ─── SSE Events ──────────────────────────────────────────────────────────────

export type AgentEventType =
  | 'agent_registered'
  | 'agent_revoked'
  | 'auth_request'
  | 'ciba_request'
  | 'ciba_approved'
  | 'ciba_denied'
  | 'ciba_expired'
  | 'token_issued'
  | 'revocation'
  | 'audit_entry'
  | 'panic_revocation';

export interface AgentEvent {
  type: AgentEventType;
  timestamp: string;
  data: Record<string, unknown>;
}

// ─── Authorization Result ─────────────────────────────────────────────────────

export interface AuthorizationResult {
  allowed: boolean;
  token?: ScopedToken;
  reason?: string;
  policyId?: string;
  auditId?: string;
  gates: {
    identity: 'pass' | 'fail';
    intent: 'parsed' | 'fail';
    policy: PolicyDecision | 'fail';
    consent?: 'approved' | 'denied' | 'timeout' | 'skipped';
    token: 'issued' | 'fail' | 'skipped';
  };
}

// ─── Demo Scenario ────────────────────────────────────────────────────────────

export interface DemoScenarioStep {
  delay: number; // ms
  description: string;
  action: () => Promise<void>;
}
