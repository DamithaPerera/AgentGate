// Demo agent simulators — used by /api/demo/run to showcase the full flow

import { registerAgent } from '@/lib/identity/agent-registry';
import { authorize } from '@/lib/authorization/five-gates';
import type { AgentIdentity } from '@/lib/types';

export interface DemoAgentConfig {
  name: string;
  framework: AgentIdentity['framework'];
  capabilities: string[];
  trustLevel: number;
  userId: string;
}

export interface RegisteredDemoAgent {
  id: string;
  name: string;
  token: string;
  framework: AgentIdentity['framework'];
}

export async function registerDemoAgent(
  config: DemoAgentConfig
): Promise<RegisteredDemoAgent> {
  const { agent, token } = await registerAgent({
    name: config.name,
    framework: config.framework,
    capabilities: config.capabilities,
    trustLevel: config.trustLevel,
    registeredBy: config.userId,
  });

  return { id: agent.id, name: agent.name, token, framework: agent.framework };
}

export async function runDemoScenario(userId: string): Promise<void> {
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // Register 3 demo agents
  const crewAgent = await registerDemoAgent({
    name: 'CrewAI Research Agent',
    framework: 'crewai',
    capabilities: ['gmail.read', 'github.read', 'calendar.read'],
    trustLevel: 3,
    userId,
  });

  await delay(800);

  const langAgent = await registerDemoAgent({
    name: 'LangGraph Writer Agent',
    framework: 'langgraph',
    capabilities: ['gmail.read', 'gmail.write', 'github.read', 'github.write'],
    trustLevel: 3,
    userId,
  });

  await delay(800);

  const customAgent = await registerDemoAgent({
    name: 'Custom Automation Agent',
    framework: 'custom',
    capabilities: ['gmail.read', 'gmail.write', 'gmail.delete'],
    trustLevel: 2,
    userId,
  });

  await delay(1500);

  // Agent 1: Read Gmail — auto-approved
  await authorize({
    agentToken: crewAgent.token,
    action: { type: 'read', operation: 'list_emails', service: 'gmail' },
    resource: { type: 'inbox' },
    userId,
  });

  await delay(1000);

  // Agent 1: Read GitHub issues — auto-approved
  await authorize({
    agentToken: crewAgent.token,
    action: { type: 'read', operation: 'list_issues', service: 'github' },
    resource: { type: 'repository' },
    userId,
  });

  await delay(1500);

  // Agent 2: Send email to external — ESCALATE → CIBA
  // (in demo, runs async so UI can show the CIBA card)
  authorize({
    agentToken: langAgent.token,
    action: { type: 'write', operation: 'send_email', service: 'gmail' },
    resource: { type: 'email', owner: 'contact@external.com' },
    context: { recipientExternal: true },
    userId,
  }).catch(() => {}); // fire and forget for demo

  await delay(2000);

  // Agent 3: Delete email — DENIED immediately
  await authorize({
    agentToken: customAgent.token,
    action: { type: 'delete', operation: 'delete_email', service: 'gmail' },
    resource: { type: 'email' },
    userId,
  });
}
