import AgentGate from '@damitha-perera/agentgate';

const apiKey = process.env.AGENTGATE_API_KEY;
if (!apiKey) {
  console.error('❌  Set AGENTGATE_API_KEY before running this script.');
  console.error('    AGENTGATE_API_KEY=ag_live_... node scripts/demo.mjs');
  process.exit(1);
}

const gate = new AgentGate({ apiKey });

// ── STEP 1: Register the agent ────────────────────────────────
console.log('\n📋 Registering agent...\n');

const agent = await gate.register({
  name: 'gmail-assistant',
  framework: 'crewai',
  capabilities: ['gmail.read', 'gmail.send'],
  trustLevel: 2,
});

console.log('✅ Agent registered!');
console.log('   Agent ID:  ', agent.id);
console.log('   SPIFFE ID: ', agent.spiffeId);
console.log('   Token:     ', agent.token.slice(0, 40) + '...');

// ── STEP 2: Authorize an action ───────────────────────────────
console.log('\n🔐 Authorizing action: gmail.read → list_emails\n');

const result = await gate.authorize({
  agentToken: agent.token,
  action: { type: 'read', operation: 'list_emails', service: 'gmail' },
  resource: { type: 'mailbox' },
});

console.log('✅ Authorization result:');
console.log('   Allowed:  ', result.allowed);
console.log('   Gates:    ', result.gates);
console.log('   Token TTL:', result.token?.ttl ?? 'N/A', 'seconds');
console.log('   Audit ID: ', result.auditId);
console.log('\n→ Check the dashboard — your agent is live!\n');
