// ─── Service & Scope Types ────────────────────────────────────────────────────

export type ServiceType = 'github' | 'calendar' | 'spotify';

export interface AgentScope {
  service: ServiceType;
  permissions: string[];
  expiresAt: Date;
  parentAgentId: string;
  childAgentId: string;
}

// ─── Agent State ──────────────────────────────────────────────────────────────

export type AgentStatus =
  | 'idle'
  | 'running'
  | 'waiting_ciba'
  | 'completed'
  | 'failed'
  | 'revoked';

export interface AgentState {
  id: string;
  name: string;
  type: 'parent' | 'child';
  service?: ServiceType;
  scope: string[];
  status: AgentStatus;
  parentId?: string;
  childIds: string[];
  createdAt: Date;
  updatedAt: Date;
  result?: string;
  error?: string;
}

// ─── Audit Trail ──────────────────────────────────────────────────────────────

export type AuditEventType =
  | 'DELEGATION'
  | 'API_CALL'
  | 'SCOPE_REQUEST'
  | 'CIBA_APPROVAL'
  | 'CIBA_DENIAL'
  | 'REVOCATION'
  | 'TOKEN_EXPIRED'
  | 'AGENT_STARTED'
  | 'AGENT_COMPLETED'
  | 'AGENT_FAILED';

export type AuditOutcome =
  | 'ALLOWED'
  | 'DENIED'
  | 'ESCALATED'
  | 'REVOKED'
  | 'EXPIRED'
  | 'PENDING';

export interface AuditEntry {
  id: string;
  timestamp: Date;
  type: AuditEventType;
  parentAgentId: string;
  childAgentId?: string;
  service: string;
  action: string;
  scopeRequested: string[];
  scopeGranted: string[];
  outcome: AuditOutcome;
  details: Record<string, unknown>;
  previousHash: string;
  hash: string;
}

// ─── Event Bus ────────────────────────────────────────────────────────────────

export type AgentEventType =
  | 'action'
  | 'ciba_request'
  | 'ciba_resolved'
  | 'revocation'
  | 'scope_change'
  | 'agent_started'
  | 'agent_completed'
  | 'agent_failed'
  | 'delegation';

export interface AgentEvent {
  type: AgentEventType;
  timestamp: Date;
  agentId: string;
  service?: ServiceType;
  data: Record<string, unknown>;
}

// ─── CIBA ─────────────────────────────────────────────────────────────────────

export type CIBAStatus = 'pending' | 'approved' | 'denied' | 'expired';

export interface CIBARequest {
  id: string;
  childAgentId: string;
  childAgentName: string;
  requestedAction: string;
  requestedScope: string;
  reason: string;
  status: CIBAStatus;
  createdAt: Date;
  expiresAt: Date;
  resolvedAt?: Date;
  resolvedBy?: string;
}

// ─── Service Connections ──────────────────────────────────────────────────────

export interface ServiceConnection {
  service: ServiceType;
  connected: boolean;
  scopes: string[];
  lastRefreshed?: Date;
  displayName: string;
  description: string;
  icon: string;
  color: string;
}

// ─── Dashboard State ──────────────────────────────────────────────────────────

export interface DashboardState {
  agents: AgentState[];
  auditLog: AuditEntry[];
  pendingCIBA: CIBARequest[];
  connections: ServiceConnection[];
  isRunning: boolean;
  userCommand?: string;
}

// ─── Scope Validation ─────────────────────────────────────────────────────────

export interface ScopeValidationResult {
  allowed: boolean;
  requiresCIBA: boolean;
  reason: string;
  missingScopes: string[];
}

// ─── API Response Types ───────────────────────────────────────────────────────

export interface ApiSuccess<T> {
  ok: true;
  data: T;
}

export interface ApiError {
  ok: false;
  error: string;
  code?: string;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;
