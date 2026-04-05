/**
 * AgentGate SDK
 * Authorization middleware for AI agents.
 *
 * @example
 * ```ts
 * import { AgentGate } from 'agentgate';
 *
 * const gate = new AgentGate({
 *   baseUrl: 'https://agent-gate-theta.vercel.app',
 *   apiKey: process.env.AGENTGATE_API_KEY!,
 * });
 *
 * const agent = await gate.register({
 *   name: 'my-crewai-agent',
 *   framework: 'crewai',
 *   capabilities: ['gmail.read'],
 *   trustLevel: 1,
 * });
 *
 * const result = await gate.authorize({
 *   agentToken: agent.token,
 *   action: { type: 'read', operation: 'list_emails', service: 'gmail' },
 *   resource: { type: 'email' },
 * });
 *
 * if (!result.allowed) throw new Error(result.reason);
 * ```
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AgentGateConfig {
  /** Your AgentGate API key (ag_live_...). Generate one at /dashboard → API Keys */
  apiKey: string;
  /** Base URL of your AgentGate deployment. Defaults to https://agent-gate-theta.vercel.app */
  baseUrl?: string;
}

export type Framework = 'crewai' | 'langgraph' | 'autogen' | 'custom' | 'mcp';

export interface RegisterOptions {
  /** Human-readable name for this agent */
  name: string;
  /** Agent framework */
  framework: Framework;
  /** List of capabilities this agent will use (e.g. ["gmail.read", "github.write"]) */
  capabilities: string[];
  /** Trust level 1–5. Lower = more restrictions. Default: 2 */
  trustLevel?: number;
}

export interface RegisteredAgent {
  /** Agent ID — store this for future calls */
  id: string;
  name: string;
  spiffeId: string;
  framework: string;
  capabilities: string[];
  trustLevel: number;
  status: string;
  /** JWT identity token — pass this to authorize() */
  token: string;
}

export type ActionType = 'read' | 'write' | 'delete' | 'execute';

export interface AuthorizeOptions {
  /** JWT token from register() */
  agentToken: string;
  action: {
    type: ActionType;
    /** What the agent is doing (e.g. "send_email", "list_repos") */
    operation: string;
    /** Which service (e.g. "gmail", "github", "calendar") */
    service: string;
  };
  resource: {
    /** Resource type (e.g. "email", "repository", "calendar") */
    type: string;
    id?: string;
    owner?: string;
  };
  context?: {
    /** True if sending to an external recipient outside your org */
    recipientExternal?: boolean;
    /** Token TTL override in seconds (default: 60) */
    tokenTTL?: number;
    [key: string]: unknown;
  };
}

export type Decision = 'ALLOWED' | 'DENIED' | 'ESCALATED';

export interface AuthorizeResult {
  /** Whether the agent is allowed to proceed */
  allowed: boolean;
  /** The authorization decision */
  decision: Decision;
  /** Human-readable reason for the decision */
  reason: string;
  /** Scoped access token (only present when allowed === true) */
  token?: {
    access_token: string;
    token_type: string;
    expires_in: number;
    scope: string;
  };
  /** Gate-by-gate breakdown */
  gates?: Record<string, string>;
}

export interface RevokeResult {
  success: boolean;
  message: string;
}

// ── Client ────────────────────────────────────────────────────────────────────

export class AgentGate {
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor(config: AgentGateConfig) {
    if (!config.apiKey) throw new Error('AgentGate: apiKey is required');
    this.apiKey = config.apiKey;
    this.baseUrl = (config.baseUrl ?? 'https://agent-gate-theta.vercel.app').replace(/\/$/, '');
  }

  private headers(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
    };
  }

  private async post<T>(path: string, body: unknown): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify(body),
    });
    const text = await res.text();
    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(`AgentGate: unexpected response (${res.status}): ${text.slice(0, 200)}`);
    }
    if (!res.ok) {
      const err = data as Record<string, unknown>;
      throw new Error(`AgentGate: ${err.error ?? err.message ?? res.statusText} (${res.status})`);
    }
    return data as T;
  }

  private async delete<T>(path: string, body?: unknown): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: 'DELETE',
      headers: this.headers(),
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    const text = await res.text();
    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(`AgentGate: unexpected response (${res.status}): ${text.slice(0, 200)}`);
    }
    if (!res.ok) {
      const err = data as Record<string, unknown>;
      throw new Error(`AgentGate: ${err.error ?? err.message ?? res.statusText} (${res.status})`);
    }
    return data as T;
  }

  /**
   * Register a new agent and get an identity token.
   * Store the returned token — pass it to authorize() on every action.
   */
  async register(opts: RegisterOptions): Promise<RegisteredAgent> {
    const data = await this.post<{ agent: RegisteredAgent; token: string }>(
      '/api/agents/register',
      { ...opts, trustLevel: opts.trustLevel ?? 2 }
    );
    return { ...data.agent, token: data.token };
  }

  /**
   * Authorize an agent action through the 5-gate pipeline.
   * Returns { allowed, decision, reason, token? }
   *
   * Gates: Identity → Intent → Policy → Consent → Token
   */
  async authorize(opts: AuthorizeOptions): Promise<AuthorizeResult> {
    const data = await this.post<AuthorizeResult>('/api/authorize', opts);
    return data;
  }

  /**
   * Revoke a specific agent by ID. All future authorize() calls for this agent will be denied.
   */
  async revokeAgent(agentId: string): Promise<RevokeResult> {
    return this.post<RevokeResult>('/api/revoke/agent', { agentId });
  }

  /**
   * Revoke all agents for a specific service (e.g. "gmail").
   */
  async revokeService(service: string): Promise<RevokeResult> {
    return this.post<RevokeResult>('/api/revoke/service', { service });
  }

  /**
   * Emergency: revoke ALL agents immediately (panic mode).
   */
  async panic(): Promise<RevokeResult> {
    return this.post<RevokeResult>('/api/revoke/panic', {});
  }
}

export default AgentGate;
