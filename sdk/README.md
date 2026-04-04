# agentgate

> Authorization middleware SDK for AI agents — powered by [AgentGate](https://agent-gate-theta.vercel.app)

One import. One call. Every AI agent action authorized through a 5-gate security pipeline.

```bash
npm install agentgate
```

## Quick Start

```ts
import { AgentGate } from 'agentgate';

const gate = new AgentGate({
  baseUrl: 'https://agent-gate-theta.vercel.app',
  apiKey: process.env.AGENTGATE_API_KEY!,
});

// 1. Register your agent once (store the token)
const agent = await gate.register({
  name: 'my-crewai-agent',
  framework: 'crewai',
  capabilities: ['gmail.read', 'github.write'],
  trustLevel: 1,
});

// 2. Authorize every action before it executes
const result = await gate.authorize({
  agentToken: agent.token,
  action: { type: 'read', operation: 'list_emails', service: 'gmail' },
  resource: { type: 'email' },
  context: { recipientExternal: false },
});

if (!result.allowed) throw new Error(result.reason);

// result.token is a scoped, 60-second token — use it to call the real API
console.log(result.token?.access_token);
```

## The 5 Gates

Every `authorize()` call passes through:

| Gate | What it does |
| ---- | ------------ |
| 1 — Identity | Verifies agent SPIFFE ID and JWT |
| 2 — Intent | Parses AuthZEN 4-tuple (who, what, where, context) |
| 3 — Policy | Evaluates rules → ALLOW / ESCALATE / DENY |
| 4 — Consent | Auth0 CIBA push notification for human approval |
| 5 — Token | Issues scoped, 60-second token from Auth0 Token Vault |

## API

### `new AgentGate(config)`

```ts
const gate = new AgentGate({
  apiKey: 'ag_live_...',      // Required — generate at /dashboard → API Keys
  baseUrl: 'https://...',     // Optional — defaults to agent-gate-theta.vercel.app
});
```

### `gate.register(opts): Promise<RegisteredAgent>`

Register a new agent. Call once and store the returned `token`.

```ts
const agent = await gate.register({
  name: 'my-agent',
  framework: 'crewai',           // 'crewai' | 'langgraph' | 'autogen' | 'custom' | 'mcp'
  capabilities: ['gmail.read'],
  trustLevel: 1,                 // 1–5, lower = more restrictions
});
// agent.token — pass to authorize()
// agent.id    — store for revocation
// agent.spiffeId — cryptographic identity
```

### `gate.authorize(opts): Promise<AuthorizeResult>`

Authorize an action. Call before every agent action.

```ts
const result = await gate.authorize({
  agentToken: agent.token,
  action: {
    type: 'write',             // 'read' | 'write' | 'delete' | 'execute'
    operation: 'send_email',
    service: 'gmail',
  },
  resource: { type: 'email' },
  context: { recipientExternal: true },
});

// result.allowed   — boolean
// result.decision  — 'ALLOWED' | 'DENIED' | 'ESCALATED'
// result.reason    — human-readable explanation
// result.token     — scoped access token (only when allowed)
```

### `gate.revokeAgent(agentId): Promise<RevokeResult>`

Revoke a specific agent. All future `authorize()` calls for this agent will be denied.

### `gate.revokeService(service): Promise<RevokeResult>`

Revoke all agents for a service (e.g. `"gmail"`).

### `gate.panic(): Promise<RevokeResult>`

Emergency: revoke ALL agents immediately.

## Decisions

| Decision | Meaning |
| -------- | ------- |
| `ALLOWED` | Action approved, `result.token` contains a scoped 60s token |
| `DENIED` | Action blocked by policy, check `result.reason` |
| `ESCALATED` | Waiting for human approval via Auth0 CIBA push notification |

## LangGraph Example

```ts
import { AgentGate } from 'agentgate';
import { StateGraph } from '@langchain/langgraph';

const gate = new AgentGate({ apiKey: process.env.AGENTGATE_API_KEY! });
const agent = await gate.register({
  name: 'langgraph-writer',
  framework: 'langgraph',
  capabilities: ['gmail.write'],
  trustLevel: 3,
});

const graph = new StateGraph({ ... })
  .addNode('send_email', async (state) => {
    const result = await gate.authorize({
      agentToken: agent.token,
      action: { type: 'write', operation: 'send_email', service: 'gmail' },
      resource: { type: 'email' },
      context: { recipientExternal: state.isExternal },
    });

    if (result.decision === 'ESCALATED') {
      return { ...state, status: 'waiting_for_approval' };
    }
    if (!result.allowed) {
      throw new Error(`Denied: ${result.reason}`);
    }

    // Use result.token.access_token to call Gmail API
  });
```

## CrewAI Example (Python SDK coming soon)

For Python agents, call the REST API directly until `agentgate-python` is released:

```python
import os, requests

API_KEY = os.environ["AGENTGATE_API_KEY"]
BASE = "https://agent-gate-theta.vercel.app"
HEADERS = {"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"}

# Register
agent = requests.post(f"{BASE}/api/agents/register", json={
    "name": "crewai-agent", "framework": "crewai",
    "capabilities": ["gmail.read"], "trustLevel": 1
}, headers=HEADERS).json()

# Authorize
result = requests.post(f"{BASE}/api/authorize", json={
    "agentToken": agent["token"],
    "action": {"type": "read", "operation": "list_emails", "service": "gmail"},
    "resource": {"type": "email"},
}, headers=HEADERS).json()

if not result["allowed"]:
    raise Exception(result["reason"])
```

## Generate an API Key

1. Go to [agent-gate-theta.vercel.app/dashboard](https://agent-gate-theta.vercel.app/dashboard)
2. Log in → **API Keys** section
3. Click **Generate Key** — copy the `ag_live_...` key (shown once)
4. Set `AGENTGATE_API_KEY` in your environment

## License

MIT
