import { nanoid } from 'nanoid';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/storage/db';
import { agents } from '@/lib/storage/schema';
import { generateSpiffeId } from '@/lib/identity/spiffe';
import { signAgentToken } from '@/lib/identity/jwt';
import { eventBus } from '@/lib/events/event-bus';
import type { AgentIdentity } from '@/lib/types';

function rowToAgent(row: typeof agents.$inferSelect): AgentIdentity {
  return {
    id:           row.id,
    spiffeId:     row.spiffeId,
    name:         row.name,
    framework:    row.framework as AgentIdentity['framework'],
    capabilities: row.capabilities as string[],
    trustLevel:   row.trustLevel,
    registeredAt: row.registeredAt,
    registeredBy: row.registeredBy,
    status:       row.status as AgentIdentity['status'],
    lastActivity: row.lastActivity,
  };
}

export async function registerAgent(params: {
  name: string;
  framework: AgentIdentity['framework'];
  capabilities: string[];
  trustLevel: number;
  registeredBy: string;
}): Promise<{ agent: AgentIdentity; token: string }> {
  const id  = nanoid(12);
  const now = new Date().toISOString();

  const agent: AgentIdentity = {
    id,
    spiffeId:     generateSpiffeId(id),
    name:         params.name,
    framework:    params.framework,
    capabilities: params.capabilities,
    trustLevel:   Math.min(5, Math.max(1, params.trustLevel)),
    registeredAt: now,
    registeredBy: params.registeredBy,
    status:       'active',
    lastActivity: now,
  };

  await db().insert(agents).values({
    id:           agent.id,
    spiffeId:     agent.spiffeId,
    name:         agent.name,
    framework:    agent.framework,
    capabilities: agent.capabilities,
    trustLevel:   agent.trustLevel,
    registeredAt: agent.registeredAt,
    registeredBy: agent.registeredBy,
    status:       agent.status,
    lastActivity: agent.lastActivity,
  });

  const token = await signAgentToken(agent);

  eventBus.emit('agent_registered', {
    agentId:      id,
    agentName:    agent.name,
    framework:    agent.framework,
    trustLevel:   agent.trustLevel,
    capabilities: agent.capabilities,
  });

  return { agent, token };
}

export async function getAgent(id: string): Promise<AgentIdentity | null> {
  const rows = await db().select().from(agents).where(eq(agents.id, id)).limit(1);
  return rows.length ? rowToAgent(rows[0]) : null;
}

export async function listAgents(): Promise<AgentIdentity[]> {
  const rows = await db().select().from(agents);
  return rows.map(rowToAgent);
}

export async function updateAgentStatus(
  id: string,
  status: AgentIdentity['status']
): Promise<AgentIdentity | null> {
  const rows = await db()
    .update(agents)
    .set({ status, lastActivity: new Date().toISOString() })
    .where(eq(agents.id, id))
    .returning();
  return rows.length ? rowToAgent(rows[0]) : null;
}

export async function updateAgentActivity(id: string): Promise<void> {
  await db()
    .update(agents)
    .set({ lastActivity: new Date().toISOString() })
    .where(eq(agents.id, id));
}

export async function revokeAgent(id: string): Promise<boolean> {
  const agent = await getAgent(id);
  if (!agent) return false;
  await updateAgentStatus(id, 'revoked');
  eventBus.emit('agent_revoked', { agentId: id, agentName: agent.name });
  return true;
}

export async function getAgentsByCapability(capability: string): Promise<AgentIdentity[]> {
  const all = await listAgents();
  return all.filter(a => a.capabilities.includes(capability) && a.status === 'active');
}

export async function getAgentsByService(service: string): Promise<AgentIdentity[]> {
  const all = await listAgents();
  return all.filter(a =>
    a.capabilities.some(cap => cap.startsWith(service + '.')) && a.status === 'active'
  );
}
