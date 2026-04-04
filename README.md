# AgentGate — Authorization Middleware for AI Agents

> The missing authorization layer for AI agents. Protocol-level security powered by Auth0 Token Vault.

**Hackathon:** "Authorized to Act: Auth0 for AI Agents" · Devpost · Deadline April 7, 2026

**Live Demo:** [agent-gate-theta.vercel.app](https://agent-gate-theta.vercel.app) &nbsp;·&nbsp; **API Docs:** [agent-gate-theta.vercel.app/docs](https://agent-gate-theta.vercel.app/docs)

---

## The Problem

AI agents are being deployed to production systems today — reading emails, writing to databases, calling APIs — with **zero authorization infrastructure**. They authenticate with long-lived tokens, have no concept of least-privilege, leave no audit trail, and there is no way to revoke access in an emergency.

The IETF draft for AI agent authentication (draft-klrc-aiagent-auth-00) has a section titled simply **"TODO Security."** AgentGate builds it.

---

## What It Does

AgentGate is a drop-in authorization gateway that sits between your AI agents and the APIs they call:

- Every agent gets a **cryptographic identity** (SPIFFE ID + signed JWT)
- Every action is evaluated against **OPA-style policies** (AuthZEN 4-tuple model)
- Sensitive actions trigger **human approval via Auth0 CIBA** (push notification to Guardian app)
- Approved agents receive **scoped, time-limited tokens** from Auth0 Token Vault — agents never see raw OAuth tokens
- Every decision is written to a **tamper-evident SHA-256 hash-chained audit trail**
- One-click **cascade revocation** — revoke an agent, a service, or everything at once

---

## The 5-Gate Pipeline

Every `POST /api/authorize` request passes through exactly 5 gates:

```text
Any AI Agent (CrewAI / LangGraph / AutoGPT / MCP / Custom)
          │
          ▼  POST /api/authorize  { agentToken, action, resource, context }
    ┌─────────────────────────────────────────────────────┐
    │                   AGENTGATE MIDDLEWARE               │
    │                                                     │
    │  Gate 1: Identity    ← SPIFFE ID + JWT verification │
    │  Gate 2: Intent      ← AuthZEN 4-tuple extraction   │
    │  Gate 3: Policy      ← OPA-style ALLOW/ESCALATE/DENY│
    │  Gate 4: Consent     ← Auth0 CIBA + Guardian push   │
    │  Gate 5: Token       ← Auth0 Token Vault (TTL: 60s) │
    └─────────────────────┬───────────────────────────────┘
                          │
              { allowed: true, token: { access_token, expires_in: 60 } }
                          │
                          ▼
        GitHub API / Gmail API / Calendar API / Your API
```

---

## Quick Start

### 1. Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/agentgate.git
cd agentgate
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Fill in your credentials (see Environment Variables section)
```

### 3. Run database migration

```bash
npm run db:migrate
# Creates agents, audit_entries, policy_rules, and api_keys tables in Neon Postgres
```

### 4. Run locally

```bash
npm run dev
# Open http://localhost:3000
```

### 5. Run the demo

```bash
# In the dashboard, click "Run Demo"
# Watch agents register, request access, trigger CIBA, and get cascade-revoked

# Or run the full test suite against any URL:
BASE_URL=http://localhost:3000 npm run test:agent
```

---

## Connect Your Own Agent

Any agent that can make HTTP requests works. No SDK required.

### Step 1 — Generate an API key

Go to **Dashboard → API Keys**, click **Generate Key**, copy the key shown once.

### Step 2 — Register your agent

```bash
curl -X POST https://agent-gate-theta.vercel.app/api/agents/register \
  -H "Authorization: Bearer ag_live_YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "my-crewai-agent",
    "framework": "crewai",
    "capabilities": ["gmail.read", "github.write"],
    "trustTier": "T1"
  }'
# → { "agentId": "...", "token": "eyJ...", "spiffeId": "spiffe://agentgate/agent/..." }
```

### Step 3 — Authorize an action

```bash
curl -X POST https://agent-gate-theta.vercel.app/api/authorize \
  -H "Authorization: Bearer ag_live_YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "agentToken": "eyJ...",
    "action": { "type": "read", "operation": "list_emails", "service": "gmail" },
    "resource": { "type": "email" },
    "context": { "recipientExternal": false }
  }'
# → { "allowed": true, "token": { "access_token": "...", "expires_in": 60 } }
# → { "allowed": false, "reason": "policy:deny — tier T1 cannot write" }
# → { "allowed": false, "reason": "consent:pending — CIBA push sent to user" }
```

### Step 4 — Use the scoped token

```bash
# The token expires in 60 seconds and is scoped to minimum required permissions
curl https://api.github.com/user/repos \
  -H "Authorization: Bearer ACCESS_TOKEN_FROM_STEP_3"
```

---

## Policy Engine

Policies are evaluated as ordered rules. The first matching rule wins.

| Trust Tier | Agents | Default Policy |
| --------- | ------ | ------------- |
| T1 (Autonomous) | CrewAI, AutoGPT | Read-only auto-approved; writes trigger CIBA |
| T3 (Supervised) | LangGraph | All actions require CIBA consent |
| T5 (Human-in-loop) | Custom | Every action requires explicit approval |

Example rule (via `PUT /api/policy/rules`):

```json
{
  "id": "rule-001",
  "effect": "DENY",
  "conditions": {
    "action.type": "delete",
    "resource.type": "production-database"
  },
  "reason": "Agents cannot delete production databases — ever"
}
```

---

## API Keys

Programmatic access uses `ag_live_` prefixed API keys:

- Generated in the dashboard — **shown once, never stored in plaintext**
- Stored as SHA-256 hashes in Neon Postgres
- Bearer token authentication: `Authorization: Bearer ag_live_...`
- Revocable individually from the dashboard

---

## Test Suite

The test agent covers 9 suites with 30+ scenarios:

```bash
BASE_URL=https://agent-gate-theta.vercel.app npm run test:agent
```

| Suite | Description |
| ----- | ----------- |
| A — Identity | SPIFFE ID assignment, JWT verification, malformed token rejection |
| B — T3 LangGraph | Supervised tier CIBA escalation for write actions |
| C — T1 CrewAI | Autonomous tier auto-approval for reads |
| D — T5 AutoGPT | Human-in-loop tier all actions require consent |
| E — MCP | MCP tool call authorization flow |
| F — Rate Limiting | 12 rapid requests trigger rate limiting |
| G — Revocation | Individual + cascade revocation, token invalidation |
| H — Concurrent | 3 agents in parallel, no cross-contamination |
| I — External Recipient | All agents attempt `recipientExternal: true` actions |

---

## Tech Stack

| Component | Technology | Why |
| --------- | ---------- | --- |
| Framework | Next.js 14 (App Router) + TypeScript | Full-stack, Vercel-native |
| Auth | **Auth0** + `@auth0/nextjs-auth0` v4 | Session, CIBA, Token Vault |
| Token Management | **Auth0 Token Vault** | Core requirement — scoped delegation |
| Human Approval | **Auth0 CIBA + Guardian** | Push-to-phone consent flow |
| Policy Engine | TypeScript AuthZEN evaluator | OPA model, no WASM cold start |
| Database | **Neon Postgres** (serverless) | Persistent storage, Vercel native |
| ORM | Drizzle ORM + `@neondatabase/serverless` | Type-safe, edge-compatible |
| Rate Limiting / SSE bus | Upstash Redis | Shared state across serverless |
| Real-time Events | SSE + polling fallback | SSE locally, polling on Vercel |
| Audit Trail | SHA-256 hash chain (Web Crypto) | Tamper-evident, SOC 2 ready |
| Agent Identity | SPIFFE IDs + `jose` JWT | Standard agent identity |
| API Keys | `ag_live_` prefix + SHA-256 hash | Never stored plaintext |
| Deployment | Vercel | Zero-config, edge-ready |

---

## How Token Vault Is Used

1. User connects GitHub/Google via Auth0 OAuth — tokens stored in **Token Vault**
2. Agent registers and declares capabilities (e.g., `["gmail.read", "github.write"]`)
3. Agent sends authorization request through the 5-gate pipeline
4. After policy approval (auto or CIBA), AgentGate calls Token Vault to issue a **scoped, time-limited** token
5. Agent receives token with **60-second TTL** and **minimum required scope only**
6. Agent **never sees the original OAuth token** — only the scoped derivative

This means:

- A compromised agent can't reuse stolen tokens (they expire in 60s)
- A revoked agent can't get new tokens (registry check at Gate 1)
- Full audit trail of every token issuance with hash-chain integrity

---

## Audit Trail

Every authorization decision is written to a tamper-evident log:

```json
{
  "sequenceNumber": 42,
  "timestamp": "2026-04-03T12:00:00.000Z",
  "agentId": "agent_abc123",
  "action": "gmail:write",
  "decision": "ALLOWED",
  "gate": "token",
  "previousHash": "sha256:abc...",
  "hash": "sha256:def..."
}
```

Verify integrity: `GET /api/audit/verify` — returns `{ valid: true, entryCount: 42 }`

Export all logs: `GET /api/audit/export` — returns JSON attachment

---

## Environment Variables

```env
# Auth0
AUTH0_SECRET=                    # 32-char random secret (openssl rand -hex 32)
AUTH0_BASE_URL=                  # App URL (http://localhost:3000 or your Vercel URL)
AUTH0_ISSUER_BASE_URL=           # https://YOUR_TENANT.auth0.com
AUTH0_CLIENT_ID=                 # Auth0 Regular Web Application client ID
AUTH0_CLIENT_SECRET=             # Auth0 client secret
AUTH0_TOKEN_VAULT_AUDIENCE=      # Token Vault audience URI

# Database (Neon Postgres)
DATABASE_URL=                    # postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require

# Redis (Upstash — for rate limiting and SSE bus)
UPSTASH_REDIS_REST_URL=          # https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=        # Upstash REST token

# Agent Identity
AGENT_JWT_SECRET=                # Secret for signing agent identity tokens (32+ chars)

# Optional
OPENROUTER_API_KEY=              # For natural language policy compiler feature
```

---

## Project Structure

```text
agentgate/
├── app/
│   ├── api/
│   │   ├── agents/          # Agent registration, listing, revocation
│   │   ├── authorize/       # The 5-gate pipeline (core endpoint)
│   │   ├── audit/           # Audit trail query, export, verify
│   │   ├── ciba/            # CIBA consent flow (approve/deny)
│   │   ├── events/          # SSE stream + polling fallback
│   │   ├── keys/            # API key generation and revocation
│   │   ├── policy/          # Policy rules CRUD + evaluation
│   │   └── revoke/          # Agent/service/panic revocation
│   ├── dashboard/           # Main dashboard UI
│   │   ├── components/      # Reusable UI components
│   │   └── hooks/           # useAgentEvents (SSE + polling)
│   └── docs/                # Public API documentation
├── lib/
│   ├── auth/                # API key auth, withAuth() middleware
│   ├── audit/               # Hash chain, audit logger
│   ├── authorization/       # 5-gate pipeline (five-gates.ts)
│   ├── storage/             # Drizzle schema, db client, migrations
│   └── types.ts             # Shared TypeScript types
└── scripts/
    └── test-agent.ts        # 9-suite test agent
```

---

## Auth0 Integration

| Feature | How AgentGate Uses It |
| ------- | --------------------- |
| Regular Web App | Dashboard login, session management |
| Token Vault | Stores user's GitHub/Google OAuth tokens; issues scoped derivatives to agents |
| CIBA | Sends push notifications for high-risk agent actions; user approves in Guardian app |
| Guardian | Mobile app receives CIBA push; user approves/denies in real time |
| JWT validation | All agent identity tokens signed with JWKS from Auth0 |
| Management API | Agent registration linked to Auth0 user subjects |

---

## Key Differentiators

1. **Framework-agnostic** — CrewAI, LangGraph, AutoGPT, MCP, raw Python — all use the same single endpoint
2. **Real standards** — SPIFFE identities, AuthZEN 4-tuple, IETF draft-klrc-aiagent-auth-00
3. **Fills the IETF gap** — The IETF draft says "TODO Security." This is it.
4. **Enterprise-ready audit** — Hash-chained logs, export, verify — SOC 2 / compliance from day one
5. **Token Vault is the core** — Agents are cryptographically isolated from raw OAuth tokens; 60s TTL means a stolen token is useless

---

## License

MIT
