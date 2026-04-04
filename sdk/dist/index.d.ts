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
interface AgentGateConfig {
    /** Your AgentGate API key (ag_live_...). Generate one at /dashboard → API Keys */
    apiKey: string;
    /** Base URL of your AgentGate deployment. Defaults to https://agent-gate-theta.vercel.app */
    baseUrl?: string;
}
type Framework = 'crewai' | 'langgraph' | 'autogen' | 'custom' | 'mcp';
interface RegisterOptions {
    /** Human-readable name for this agent */
    name: string;
    /** Agent framework */
    framework: Framework;
    /** List of capabilities this agent will use (e.g. ["gmail.read", "github.write"]) */
    capabilities: string[];
    /** Trust level 1–5. Lower = more restrictions. Default: 2 */
    trustLevel?: number;
}
interface RegisteredAgent {
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
type ActionType = 'read' | 'write' | 'delete' | 'execute';
interface AuthorizeOptions {
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
type Decision = 'ALLOWED' | 'DENIED' | 'ESCALATED';
interface AuthorizeResult {
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
interface RevokeResult {
    success: boolean;
    message: string;
}
declare class AgentGate {
    private readonly baseUrl;
    private readonly apiKey;
    constructor(config: AgentGateConfig);
    private headers;
    private post;
    private delete;
    /**
     * Register a new agent and get an identity token.
     * Store the returned token — pass it to authorize() on every action.
     */
    register(opts: RegisterOptions): Promise<RegisteredAgent>;
    /**
     * Authorize an agent action through the 5-gate pipeline.
     * Returns { allowed, decision, reason, token? }
     *
     * Gates: Identity → Intent → Policy → Consent → Token
     */
    authorize(opts: AuthorizeOptions): Promise<AuthorizeResult>;
    /**
     * Revoke a specific agent by ID. All future authorize() calls for this agent will be denied.
     */
    revokeAgent(agentId: string): Promise<RevokeResult>;
    /**
     * Revoke all agents for a specific service (e.g. "gmail").
     */
    revokeService(service: string): Promise<RevokeResult>;
    /**
     * Emergency: revoke ALL agents immediately (panic mode).
     */
    panic(): Promise<RevokeResult>;
}

export { type ActionType, AgentGate, type AgentGateConfig, type AuthorizeOptions, type AuthorizeResult, type Decision, type Framework, type RegisterOptions, type RegisteredAgent, type RevokeResult, AgentGate as default };
