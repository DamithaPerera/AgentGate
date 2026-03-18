import { nanoid } from 'nanoid';
import { storage } from '@/lib/storage/redis';
import { generateSpiffeId } from '@/lib/identity/spiffe';
import { signAgentToken } from '@/lib/identity/jwt';
import { eventBus } from '@/lib/events/event-bus';
import type { AgentIdentity } from '@/lib/types';

const AGENT_PREFIX = 'agent:';
const AGENTS_LIST_KEY = 'agents:list';

export async function registerAgent(params: {
  name: string;
  framework: AgentIdentity['framework'];
  capabilities: string[];
  trustLevel: number;
  registeredBy: string;
}): Promise<{ agent: AgentIdentity; token: string }> {
  const id = nanoid(12);
  const spiffeId = generateSpiffeId(id);
  const now = new Date().toISOString();

  const agent: AgentIdentity = {
    id,
    spiffeId,
    name: params.name,
    framework: params.framework,
    capabilities: params.capabilities,
    trustLevel: Math.min(5, Math.max(1, params.trustLevel)),
    registeredAt: now,
    registeredBy: params.registeredBy,
    status: 'active',
    lastActivity: now,
  };

  await storage.set(`${AGENT_PREFIX}${id}`, JSON.stringify(agent));
  await storage.lpush(AGENTS_LIST_KEY, id);

  const token = await signAgentToken(agent);

  eventBus.emit('agent_registered', {
    agentId: id,
    agentName: agent.name,
    framework: agent.framework,
    trustLevel: agent.trustLevel,
    capabilities: agent.capabilities,
  });

  return { agent, token };
}

export async function getAgent(id: string): Promise<AgentIdentity | null> {
  const raw = await storage.get(`${AGENT_PREFIX}${id}`);
  if (!raw) return null;
  return JSON.parse(raw) as AgentIdentity;
}

export async function listAgents(): Promise<AgentIdentity[]> {
  const ids = await storage.lrange(AGENTS_LIST_KEY, 0, -1);
  const agents = await Promise.all(ids.map(id => getAgent(id)));
  return agents.filter((a): a is AgentIdentity => a !== null);
}

export async function updateAgentStatus(
  id: string,
  status: AgentIdentity['status']
): Promise<AgentIdentity | null> {
  const agent = await getAgent(id);
  if (!agent) return null;
  const updated = { ...agent, status, lastActivity: new Date().toISOString() };
  await storage.set(`${AGENT_PREFIX}${id}`, JSON.stringify(updated));
  return updated;
}

export async function updateAgentActivity(id: string): Promise<void> {
  const agent = await getAgent(id);
  if (!agent) return;
  const updated = { ...agent, lastActivity: new Date().toISOString() };
  await storage.set(`${AGENT_PREFIX}${id}`, JSON.stringify(updated));
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
