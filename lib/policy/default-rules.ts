import type { PolicyRule } from '@/lib/types';

// Default authorization policies following the AuthZEN 4-tuple model.
// Production version uses OPA WASM; this TypeScript evaluator mirrors the same model.

export const DEFAULT_RULES: PolicyRule[] = [
  {
    id: 'allow-read-trusted',
    name: 'Allow reads by trusted agents',
    description: 'Auto-approve read actions by agents with trust level ≥ 2',
    condition: {
      actionTypes: ['read'],
      minTrustLevel: 2,
      maxRequestsPerMinute: 10,
    },
    decision: 'ALLOW',
    enabled: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'escalate-write',
    name: 'Escalate all write actions',
    description: 'All write actions require human approval via CIBA',
    condition: {
      actionTypes: ['write'],
    },
    decision: 'ESCALATE',
    enabled: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'escalate-external-recipient',
    name: 'Escalate external recipient',
    description: 'Any action targeting an external recipient requires approval',
    condition: {
      recipientExternal: true,
    },
    decision: 'ESCALATE',
    enabled: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'escalate-low-trust-write',
    name: 'Escalate low trust non-reads',
    description: 'Agents with trust < 3 need approval for non-read actions',
    condition: {
      actionTypes: ['write', 'execute'],
      maxTrustLevel: 2,
    },
    decision: 'ESCALATE',
    enabled: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'deny-delete-low-trust',
    name: 'Deny delete by untrusted agents',
    description: 'Delete actions blocked unless trust level = 5',
    condition: {
      actionTypes: ['delete'],
      maxTrustLevel: 4,
    },
    decision: 'DENY',
    enabled: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'deny-rate-limit',
    name: 'Deny rate limit exceeded',
    description: 'Block agents that exceed 10 requests per minute',
    condition: {
      maxRequestsPerMinute: 10,
    },
    decision: 'DENY',
    enabled: true,
    createdAt: new Date().toISOString(),
  },
];
