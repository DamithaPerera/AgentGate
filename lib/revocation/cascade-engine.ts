import {
  listAgents,
  revokeAgent,
  getAgentsByService,
} from '@/lib/identity/agent-registry';
import { logEntry } from '@/lib/audit/audit-logger';
import { eventBus } from '@/lib/events/event-bus';
import { revokeToken } from '@/lib/auth0/token-vault';

export interface RevocationResult {
  revokedAgents: string[];
  revokedTokens: string[];
  cascadeEntries: string[];
}

export async function revokeAgentCascade(
  agentId: string,
  initiatedBy: string
): Promise<RevocationResult> {
  const result: RevocationResult = {
    revokedAgents: [],
    revokedTokens: [],
    cascadeEntries: [],
  };

  await revokeAgent(agentId);
  result.revokedAgents.push(agentId);

  const entry = await logEntry({
    type: 'AGENT_REVOKED',
    agentId,
    agentSpiffeId: `spiffe://agentgate.local/agents/${agentId}`,
    userId: initiatedBy,
    subject: agentId,
    action: 'revoke',
    resource: 'agent',
    context: { initiatedBy },
    decision: 'REVOKED',
    reason: `Agent revoked by user ${initiatedBy}`,
  });

  result.cascadeEntries.push(entry.id);

  eventBus.emit('revocation', {
    type: 'agent',
    agentId,
    initiatedBy,
  });

  return result;
}

export async function revokeServiceCascade(
  service: string,
  initiatedBy: string
): Promise<RevocationResult> {
  const result: RevocationResult = {
    revokedAgents: [],
    revokedTokens: [],
    cascadeEntries: [],
  };

  // Find all active agents using this service
  const agents = await getAgentsByService(service);

  for (const agent of agents) {
    await revokeAgent(agent.id);
    result.revokedAgents.push(agent.id);

    const entry = await logEntry({
      type: 'CASCADE_REVOCATION',
      agentId: agent.id,
      agentSpiffeId: agent.spiffeId,
      userId: initiatedBy,
      subject: agent.id,
      action: 'cascade-revoke',
      resource: service,
      context: { service, initiatedBy, trigger: 'service_revocation' },
      decision: 'REVOKED',
      reason: `Cascade revocation: service '${service}' revoked by ${initiatedBy}`,
    });

    result.cascadeEntries.push(entry.id);
  }

  // Log the service revocation itself
  const serviceEntry = await logEntry({
    type: 'SERVICE_REVOKED',
    agentId: 'system',
    agentSpiffeId: 'spiffe://agentgate.local/system',
    userId: initiatedBy,
    subject: 'system',
    action: 'revoke-service',
    resource: service,
    context: { service, affectedAgents: result.revokedAgents.length },
    decision: 'REVOKED',
    reason: `Service '${service}' connection revoked. ${result.revokedAgents.length} agents terminated.`,
  });

  result.cascadeEntries.push(serviceEntry.id);

  eventBus.emit('revocation', {
    type: 'service',
    service,
    affectedAgents: result.revokedAgents,
    initiatedBy,
  });

  return result;
}

export async function panicRevocation(initiatedBy: string): Promise<RevocationResult> {
  const result: RevocationResult = {
    revokedAgents: [],
    revokedTokens: [],
    cascadeEntries: [],
  };

  const allAgents = await listAgents();
  const activeAgents = allAgents.filter(a => a.status === 'active');

  for (const agent of activeAgents) {
    await revokeAgent(agent.id);
    result.revokedAgents.push(agent.id);
  }

  const entry = await logEntry({
    type: 'PANIC_REVOCATION',
    agentId: 'system',
    agentSpiffeId: 'spiffe://agentgate.local/system',
    userId: initiatedBy,
    subject: 'system',
    action: 'panic-revoke',
    resource: 'all',
    context: {
      initiatedBy,
      revokedCount: result.revokedAgents.length,
    },
    decision: 'REVOKED',
    reason: `PANIC REVOCATION: All ${result.revokedAgents.length} agents terminated by ${initiatedBy}`,
  });

  result.cascadeEntries.push(entry.id);

  eventBus.emit('panic_revocation', {
    initiatedBy,
    revokedAgents: result.revokedAgents,
  });

  return result;
}
