# AgentGate — Authorization Middleware for AI Agents

> The missing authorization layer for AI agents. Protocol-level security powered by Auth0 Token Vault.

**Hackathon:** "Authorized to Act: Auth0 for AI Agents" · Devpost · Deadline April 7, 2026

---

## What It Does

AgentGate is a drop-in authorization gateway that:
- Gives every AI agent a **cryptographic identity** (SPIFFE ID + signed JWT)
- Evaluates every action against **OPA-style policies** (AuthZEN 4-tuple model)
- Escalates sensitive actions for **human approval via Auth0 CIBA**
- Issues **scoped, time-limited tokens** from Auth0 Token Vault (agents never see raw OAuth tokens)
- Produces a **tamper-evident, SHA-256 hash-chained audit trail**
- Supports **cascade revocation** (revoke agent, service, or everything with one click)

Every request passes through exactly 5 gates: Identity → Intent → Policy → Consent → Token.

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
cp .env.example .env.local
# Edit .env.local with your Auth0 credentials
```

### 3. Set up Auth0

See [AUTH0_SETUP.md](./AUTH0_SETUP.md) for step-by-step tenant configuration.

**Required Auth0 configuration:**
- Regular Web Application
- Token Vault enabled for GitHub and Google connections
- CIBA grant type enabled
- Guardian push notifications configured

### 4. Run locally

```bash
npm run dev
# Open http://localhost:3000
```

### 5. Try the demo

1. Open `http://localhost:3000/dashboard`
2. Click **"Run Demo"**
3. Watch three agents (CrewAI, LangGraph, custom) register, request access, trigger CIBA, and get cascade-revoked

---

## Architecture

```
Any AI Agent (CrewAI / LangGraph / AutoGen / Custom)
          │
          ▼  POST /api/authorize
    ┌─────────────────────────────┐
    │     AGENTGATE MIDDLEWARE     │
    │                             │
    │  Gate 1: Identity Check     │  ← SPIFFE ID + JWT verification
    │  Gate 2: Intent Parsing     │  ← AuthZEN 4-tuple extraction
    │  Gate 3: Policy Evaluation  │  ← OPA-style rules (ALLOW/ESCALATE/DENY)
    │  Gate 4: CIBA Consent       │  ← Auth0 Guardian push (if escalated)
    │  Gate 5: Token Issuance     │  ← Auth0 Token Vault scoped token
    └───────────────┬─────────────┘
                    │
          Scoped token (TTL: 60s)
                    │
                    ▼
    GitHub API / Gmail API / Calendar API
```

---

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Framework | Next.js 14 (App Router) + TypeScript |
| Auth | Auth0 + @auth0/nextjs-auth0 |
| Token Management | **Auth0 Token Vault** (core requirement) |
| Human Approval | **Auth0 CIBA + Guardian** |
| Policy Engine | TypeScript AuthZEN evaluator (OPA model) |
| Audit Trail | SHA-256 hash chain via Web Crypto API |
| Real-time | Server-Sent Events (SSE) |
| Storage | Upstash Redis (in-memory fallback for dev) |
| Crypto | jose (JWT) + Web Crypto (hashing) |
| IDs | nanoid |
| Deployment | Vercel |

> **Note on OPA:** The policy engine implements the same AuthZEN 4-tuple model as OPA/Rego in TypeScript for reliability. Production deployment uses the same interface and can swap to OPA WASM.

---

## API Reference

### Core Authorization

```bash
# Authorize an agent action (the 5-gate pipeline)
POST /api/authorize
{
  "agentToken": "eyJ...",           # Agent JWT from /api/agents/register
  "action": {
    "type": "read|write|delete|execute",
    "operation": "send_email",
    "service": "gmail"
  },
  "resource": { "type": "email" },
  "context": { "recipientExternal": true }
}
# → 200 { allowed: true, token: {...} }
# → 403 { allowed: false, reason: "..." }
```

### Agent Management

```bash
POST /api/agents/register          # Register agent, get identity token
GET  /api/agents                   # List all agents
GET  /api/agents/:id               # Get agent details
POST /api/agents/:id/refresh       # Refresh identity token
DELETE /api/agents/:id             # Revoke agent
```

### Policy

```bash
GET  /api/policy/rules             # Get active policy rules
PUT  /api/policy/rules             # Update policy rules
POST /api/policy/evaluate          # Evaluate authorization request
POST /api/policy/compile           # Compile natural language policy
```

### Audit

```bash
GET  /api/audit                    # Query audit trail
GET  /api/audit/export             # Export as JSON
GET  /api/audit/verify             # Verify hash chain integrity
```

### Revocation

```bash
POST /api/revoke/agent             # Revoke specific agent { agentId }
POST /api/revoke/service           # Revoke service cascade { service }
POST /api/revoke/panic             # Revoke everything
```

---

## How Token Vault Is Used

1. User connects GitHub/Google via Auth0 OAuth — tokens stored in Token Vault
2. Agent registers and declares capabilities (e.g., `["gmail.read", "github.write"]`)
3. Agent sends authorization request to AgentGate
4. After policy approval (auto or CIBA), AgentGate calls Token Vault to issue a **scoped, time-limited** token
5. Agent receives token with **60-second TTL** and **minimum required scope only**
6. Agent NEVER sees the original OAuth token — only the scoped derivative

This means:
- A compromised agent can't use stolen tokens (they expire in 60s)
- A revoked agent can't get new tokens (registry check at Gate 1)
- Full audit trail of every token issuance

---

## Environment Variables

```env
AUTH0_SECRET=                    # 32-char random secret
AUTH0_BASE_URL=                  # App URL (http://localhost:3000)
AUTH0_ISSUER_BASE_URL=           # https://YOUR_TENANT.auth0.com
AUTH0_CLIENT_ID=                 # Auth0 app client ID
AUTH0_CLIENT_SECRET=             # Auth0 app client secret
AUTH0_TOKEN_VAULT_AUDIENCE=      # Token Vault audience
OPENROUTER_API_KEY=              # For natural language policy compiler
UPSTASH_REDIS_REST_URL=          # Redis URL (optional, uses memory if missing)
UPSTASH_REDIS_REST_TOKEN=        # Redis token
AGENT_JWT_SECRET=                # Secret for signing agent identity tokens
```

---

## Key Differentiators

1. **Framework-agnostic** — any agent (CrewAI, LangGraph, AutoGen, raw Python) uses the same `/api/authorize` endpoint
2. **Real standards** — implements NIST AI Agent Standards concepts, IETF draft-klrc-aiagent-auth-00, AuthZEN (OpenID)
3. **The "TODO Security"** — the IETF draft's security section says "TODO Security." AgentGate builds it.
4. **Audit sells enterprise** — hash-chained, tamper-evident logs ready for SOC 2 / compliance
5. **Token Vault is the core** — agents are cryptographically isolated from raw OAuth tokens

---

## License

MIT
