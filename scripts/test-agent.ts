/**
 * AgentGate Test Agent
 * ---------------------
 * Simulates a real AI agent connecting to AgentGate:
 *   1. Registers itself
 *   2. Requests authorization for various actions
 *   3. Prints results so you can watch the dashboard live
 *
 * Run: npx tsx scripts/test-agent.ts
 */

const BASE_URL = process.env.AGENTGATE_URL ?? 'http://localhost:3000';
const DELAY_MS = 1500; // pause between requests so dashboard updates are visible

// ── helpers ──────────────────────────────────────────────────────────────────

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

function log(symbol: string, msg: string, detail?: unknown) {
  const ts = new Date().toLocaleTimeString();
  console.log(`\n[${ts}] ${symbol}  ${msg}`);
  if (detail !== undefined) console.log('   ', JSON.stringify(detail, null, 2).replace(/\n/g, '\n    '));
}

async function post(path: string, body: unknown) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return { status: res.status, data: await res.json() };
}

// ── step 1: register ──────────────────────────────────────────────────────────

async function registerAgent() {
  log('📋', 'Registering agent with AgentGate…');

  const { status, data } = await post('/api/agents/register', {
    name: 'Demo LangGraph Agent',
    framework: 'langgraph',
    capabilities: ['gmail.read', 'gmail.write', 'github.read', 'calendar.read'],
    trustLevel: 2,
  });

  if (status !== 201) {
    log('❌', 'Registration failed', data);
    process.exit(1);
  }

  log('✅', `Registered! Agent ID: ${data.agent.id}`, {
    name: data.agent.name,
    framework: data.agent.framework,
    trustLevel: data.agent.trustLevel,
    spiffeId: data.agent.spiffeId,
  });

  return data.token as string;
}

// ── step 2: authorization requests ───────────────────────────────────────────

interface AuthRequest {
  label: string;
  action: { type: 'read' | 'write' | 'delete' | 'execute'; operation: string; service: string };
  resource: { type: string; id?: string; owner?: string };
  context?: { recipientExternal?: boolean; ipAddress?: string };
  expect: 'ALLOWED' | 'DENIED' | 'ESCALATED';
}

const SCENARIOS: AuthRequest[] = [
  {
    label: '📧 Read inbox (should be ALLOWED — trusted read)',
    action:   { type: 'read', operation: 'list_emails', service: 'gmail' },
    resource: { type: 'email', owner: 'user@example.com' },
    expect:   'ALLOWED',
  },
  {
    label: '📁 Read GitHub repos (should be ALLOWED)',
    action:   { type: 'read', operation: 'list_repos', service: 'github' },
    resource: { type: 'repository', id: 'org/main' },
    expect:   'ALLOWED',
  },
  {
    label: '📅 Read calendar (should be ALLOWED)',
    action:   { type: 'read', operation: 'list_events', service: 'calendar' },
    resource: { type: 'calendar', owner: 'user@example.com' },
    expect:   'ALLOWED',
  },
  {
    label: '✉️  Send internal email (should be ESCALATED — write action)',
    action:   { type: 'write', operation: 'send_email', service: 'gmail' },
    resource: { type: 'email', owner: 'user@example.com' },
    context:  { recipientExternal: false },
    expect:   'ESCALATED',
  },
  {
    label: '🌐 Send email to EXTERNAL recipient (should be ESCALATED/DENIED)',
    action:   { type: 'write', operation: 'send_email', service: 'gmail' },
    resource: { type: 'email', id: 'external@otherdomain.com' },
    context:  { recipientExternal: true },
    expect:   'ESCALATED',
  },
  {
    label: '🗑️  Delete emails (should be DENIED — delete on external)',
    action:   { type: 'delete', operation: 'delete_email', service: 'gmail' },
    resource: { type: 'email', owner: 'user@example.com' },
    expect:   'DENIED',
  },
];

async function runScenarios(agentToken: string) {
  log('🚀', `Running ${SCENARIOS.length} authorization scenarios…`);
  log('👁️', 'Watch the AgentGate dashboard → http://localhost:3000/dashboard');

  for (const scenario of SCENARIOS) {
    await sleep(DELAY_MS);
    log('🔐', scenario.label);

    const { status, data } = await post('/api/authorize', {
      agentToken,
      action: scenario.action,
      resource: scenario.resource,
      context: scenario.context ?? {},
    });

    const decision = data.decision ?? (status === 200 ? 'ALLOWED' : 'DENIED');
    const icon = decision === 'ALLOWED' ? '✅' : decision === 'ESCALATED' ? '⚠️ ' : '❌';
    const match = decision === scenario.expect ? '(expected)' : `(expected ${scenario.expect})`;

    log(icon, `${decision} ${match}`, { reason: data.reason, httpStatus: status });
  }
}

// ── main ──────────────────────────────────────────────────────────────────────

(async () => {
  console.log('\n════════════════════════════════════════════');
  console.log('  AgentGate Test Agent');
  console.log(`  Target: ${BASE_URL}`);
  console.log('════════════════════════════════════════════');

  const token = await registerAgent();
  await sleep(DELAY_MS);
  await runScenarios(token);

  console.log('\n════════════════════════════════════════════');
  console.log('  Done! Check the dashboard for all events.');
  console.log('════════════════════════════════════════════\n');
})();
