import type { PolicyRule } from '@/lib/types';
import { nanoid } from 'nanoid';

// Natural language → policy rule compiler
// Uses OpenRouter free LLM to parse intent, then maps to structured rules.

export async function compileNaturalLanguagePolicy(text: string): Promise<PolicyRule[]> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL ?? 'deepseek/deepseek-chat-v3-0324:free';

  if (!apiKey) {
    return compileFallback(text);
  }

  const systemPrompt = `You are a security policy compiler. Convert natural language security policies into JSON policy rules.
Output ONLY a valid JSON array of policy rules. Each rule must have:
- id: string (snake_case identifier)
- name: string (short name)
- description: string (the policy description)
- condition: object with optional fields:
  - actionTypes: array of "read"|"write"|"delete"|"execute"
  - services: array of service names like "gmail", "github", "calendar"
  - minTrustLevel: number 1-5
  - maxTrustLevel: number 1-5
  - recipientExternal: boolean
  - maxRequestsPerMinute: number
- decision: "ALLOW"|"ESCALATE"|"DENY"
- enabled: true
- createdAt: current ISO timestamp

Example input: "Agents can read Gmail but cannot send to external addresses"
Example output: [
  {"id":"allow-gmail-read","name":"Allow Gmail reads","description":"Allow read access to Gmail","condition":{"actionTypes":["read"],"services":["gmail"]},"decision":"ALLOW","enabled":true,"createdAt":"2026-01-01T00:00:00Z"},
  {"id":"deny-gmail-external","name":"Deny external Gmail sends","description":"Block sending email to external addresses","condition":{"actionTypes":["write"],"services":["gmail"],"recipientExternal":true},"decision":"DENY","enabled":true,"createdAt":"2026-01-01T00:00:00Z"}
]`;

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: text },
        ],
        temperature: 0.1,
        max_tokens: 1000,
      }),
    });

    const data = await response.json() as { choices?: Array<{ message: { content: string } }> };
    const content = data.choices?.[0]?.message?.content;
    if (!content) return compileFallback(text);

    // Extract JSON from response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return compileFallback(text);

    const rules = JSON.parse(jsonMatch[0]) as PolicyRule[];
    return rules.map(r => ({ ...r, id: r.id || nanoid(8), createdAt: new Date().toISOString() }));
  } catch {
    return compileFallback(text);
  }
}

// Simple keyword-based fallback when LLM is unavailable
function compileFallback(text: string): PolicyRule[] {
  const lower = text.toLowerCase();
  const rules: PolicyRule[] = [];
  const now = new Date().toISOString();

  if (lower.includes('cannot') || lower.includes('deny') || lower.includes('block')) {
    if (lower.includes('delete')) {
      rules.push({
        id: `custom-deny-delete-${nanoid(6)}`,
        name: 'Custom deny delete',
        description: text,
        condition: { actionTypes: ['delete'] },
        decision: 'DENY',
        enabled: true,
        createdAt: now,
      });
    }
    if (lower.includes('external')) {
      rules.push({
        id: `custom-deny-external-${nanoid(6)}`,
        name: 'Custom deny external',
        description: text,
        condition: { recipientExternal: true },
        decision: 'DENY',
        enabled: true,
        createdAt: now,
      });
    }
  }

  if (lower.includes('approve') || lower.includes('confirm') || lower.includes('escalate')) {
    rules.push({
      id: `custom-escalate-${nanoid(6)}`,
      name: 'Custom escalate rule',
      description: text,
      condition: { actionTypes: ['write'] },
      decision: 'ESCALATE',
      enabled: true,
      createdAt: now,
    });
  }

  return rules;
}
