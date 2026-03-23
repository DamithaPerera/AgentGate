'use client';
import { useState } from 'react';
import type { PolicyRule } from '@/lib/types';

interface Props { rules: PolicyRule[]; onRulesChange: (rules: PolicyRule[]) => void; }

export function PolicyEditor({ rules, onRulesChange }: Props) {
  const [text, setText] = useState('');
  const [compiling, setCompiling] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleCompile = async () => {
    if (!text.trim()) return;
    setCompiling(true);
    setMessage(null);
    try {
      const res = await fetch('/api/policy/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const data = await res.json() as { rules?: PolicyRule[]; allRules?: PolicyRule[]; error?: string };
      if (data.error) {
        setMessage({ type: 'error', text: data.error });
      } else {
        onRulesChange(data.allRules ?? []);
        setText('');
        setMessage({ type: 'success', text: `Added ${data.rules?.length ?? 0} rule(s)` });
      }
    } catch {
      setMessage({ type: 'error', text: 'Compilation failed' });
    } finally {
      setCompiling(false);
    }
  };

  const toggleRule = async (ruleId: string) => {
    const updated = rules.map(r => r.id === ruleId ? { ...r, enabled: !r.enabled } : r);
    await fetch('/api/policy/rules', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rules: updated }),
    });
    onRulesChange(updated);
  };

  const decisionStyle: Record<string, string> = {
    ALLOW: 'var(--color-success-text)',
    ESCALATE: 'var(--color-warning-text)',
    DENY: 'var(--color-danger-text)',
  };

  return (
    <div className="space-y-3">
      {/* Input row */}
      <div className="flex flex-col sm:flex-row gap-2">
        <input type="text"
          placeholder='e.g. "Agents can read Gmail but cannot send to external addresses"'
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleCompile()}
          className="flex-1 rounded px-3 py-1.5 text-sm border focus:outline-none"
          style={{ background: 'var(--color-bg-surface)', borderColor: 'var(--color-border)',
            color: 'var(--color-text-high)' }} />
        <button onClick={handleCompile} disabled={compiling || !text.trim()}
          className="text-white text-sm font-semibold px-4 py-1.5 rounded disabled:opacity-50 transition-opacity hover:opacity-90"
          style={{ background: 'var(--color-brand)' }}>
          {compiling ? '…' : 'Apply'}
        </button>
      </div>

      {message && (
        <div className="text-xs px-3 py-1.5 rounded border font-medium"
          style={{
            background: message.type === 'success' ? 'var(--color-success-bg)' : 'var(--color-danger-bg)',
            color: message.type === 'success' ? 'var(--color-success-text)' : 'var(--color-danger-text)',
            borderColor: message.type === 'success' ? '#ABF5D1' : '#FFBDAD',
          }}>
          {message.text}
        </div>
      )}

      {/* Rules list */}
      <div className="space-y-1 max-h-40 overflow-y-auto">
        {rules.map(rule => (
          <div key={rule.id} className="flex items-center gap-2 px-3 py-1.5 rounded border text-xs"
            style={{
              background: rule.enabled ? 'var(--color-bg-surface)' : 'var(--color-bg-sunken)',
              borderColor: 'var(--color-border)',
              opacity: rule.enabled ? 1 : 0.55,
            }}>
            {/* Toggle */}
            <button onClick={() => toggleRule(rule.id)} style={{
                position: 'relative', flexShrink: 0, width: '2rem', height: '1rem',
                borderRadius: '9999px', border: 'none', cursor: 'pointer',
                background: rule.enabled ? 'var(--color-brand)' : 'var(--color-border-bold)',
                transition: 'background 150ms',
              }}>
              <span style={{
                position: 'absolute', top: '0.125rem', borderRadius: '50%',
                width: '0.75rem', height: '0.75rem', background: '#fff',
                boxShadow: '0 1px 2px rgba(0,0,0,0.25)',
                left: rule.enabled ? '1.125rem' : '0.125rem',
                transition: 'left 150ms',
              }} />
            </button>
            <span className="flex-1 truncate" style={{ color: 'var(--color-text-medium)' }}>{rule.name}</span>
            <span className="font-semibold flex-shrink-0" style={{ color: decisionStyle[rule.decision] ?? 'var(--color-text-low)' }}>
              {rule.decision}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
