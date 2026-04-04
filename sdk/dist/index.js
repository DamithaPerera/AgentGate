"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  AgentGate: () => AgentGate,
  default: () => index_default
});
module.exports = __toCommonJS(index_exports);
var AgentGate = class {
  constructor(config) {
    if (!config.apiKey) throw new Error("AgentGate: apiKey is required");
    this.apiKey = config.apiKey;
    this.baseUrl = (config.baseUrl ?? "https://agent-gate-theta.vercel.app").replace(/\/$/, "");
  }
  headers() {
    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${this.apiKey}`
    };
  }
  async post(path, body) {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify(body)
    });
    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(`AgentGate: unexpected response (${res.status}): ${text.slice(0, 200)}`);
    }
    if (!res.ok) {
      const err = data;
      throw new Error(`AgentGate: ${err.error ?? err.message ?? res.statusText} (${res.status})`);
    }
    return data;
  }
  async delete(path, body) {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: "DELETE",
      headers: this.headers(),
      ...body ? { body: JSON.stringify(body) } : {}
    });
    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(`AgentGate: unexpected response (${res.status}): ${text.slice(0, 200)}`);
    }
    if (!res.ok) {
      const err = data;
      throw new Error(`AgentGate: ${err.error ?? err.message ?? res.statusText} (${res.status})`);
    }
    return data;
  }
  /**
   * Register a new agent and get an identity token.
   * Store the returned token — pass it to authorize() on every action.
   */
  async register(opts) {
    const data = await this.post(
      "/api/agents/register",
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
  async authorize(opts) {
    const data = await this.post("/api/authorize", opts);
    return data;
  }
  /**
   * Revoke a specific agent by ID. All future authorize() calls for this agent will be denied.
   */
  async revokeAgent(agentId) {
    return this.post("/api/revoke/agent", { agentId });
  }
  /**
   * Revoke all agents for a specific service (e.g. "gmail").
   */
  async revokeService(service) {
    return this.post("/api/revoke/service", { service });
  }
  /**
   * Emergency: revoke ALL agents immediately (panic mode).
   */
  async panic() {
    return this.post("/api/revoke/panic", {});
  }
};
var index_default = AgentGate;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AgentGate
});
