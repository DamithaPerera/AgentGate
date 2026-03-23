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

  const decisionColors: Record<string, { color: string; bg: string }> = {
    ALLOW:    { color: '#16A34A', bg: '#F0FDF4' },
    ESCALATE: { color: '#D97706', bg: '#FFFBEB' },
    DENY:     { color: '#DC2626', bg: '#FFF1F2' },
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Input row */}
      <div style={{ display: 'flex', gap: 8 }}>
        <input type="text"
          placeholder='e.g. "Agents can read Gmail but cannot send to external addresses"'
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleCompile()}
          style={{ flex: 1, borderRadius: 8, padding: '8px 14px', fontSize: 13, border: '1px solid #E2E8F0', background: '#fff', color: '#0F172A', outline: 'none', minWidth: 0 }} />
        <button onClick={handleCompile} disabled={compiling || !text.trim()}
          style={{ padding: '8px 18px', borderRadius: 8, background: 'linear-gradient(135deg, #0052CC, #0065FF)', color: '#fff', fontWeight: 600, fontSize: 13, border: 'none', cursor: 'pointer', opacity: (compiling || !text.trim()) ? 0.5 : 1, whiteSpace: 'nowrap', boxShadow: '0 2px 8px rgba(0,82,204,0.3)' }}>
          {compiling ? '…' : 'Apply'}
        </button>
      </div>

      {message && (
        <div style={{ fontSize: 12, padding: '6px 12px', borderRadius: 6, fontWeight: 500, background: message.type === 'success' ? '#F0FDF4' : '#FFF1F2', color: message.type === 'success' ? '#16A34A' : '#DC2626', border: `1px solid ${message.type === 'success' ? '#BBF7D0' : '#FECDD3'}` }}>
          {message.type === 'success' ? '✓' : '✗'} {message.text}
        </div>
      )}

      {/* Rules list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 160, overflowY: 'auto' }}>
        {rules.map(rule => {
          const dc = decisionColors[rule.decision] ?? { color: '#64748B', bg: '#F8FAFC' };
          return (
            <div key={rule.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 10px', borderRadius: 8, background: rule.enabled ? '#fff' : '#F8FAFC', border: '1px solid #E2E8F0', opacity: rule.enabled ? 1 : 0.55, transition: 'opacity 0.2s' }}>
              {/* Toggle */}
              <button onClick={() => toggleRule(rule.id)} style={{
                position: 'relative', flexShrink: 0, width: '2rem', height: '1rem',
                borderRadius: 999, border: 'none', cursor: 'pointer',
                background: rule.enabled ? '#0052CC' : '#334155',
                transition: 'background 150ms',
              }}>
                <span style={{
                  position: 'absolute', top: '0.125rem', borderRadius: '50%',
                  width: '0.75rem', height: '0.75rem', background: '#fff',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  left: rule.enabled ? '1.125rem' : '0.125rem',
                  transition: 'left 150ms',
                }} />
              </button>
              <span style={{ flex: 1, fontSize: 12, color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{rule.name}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: dc.color, background: dc.bg, padding: '2px 8px', borderRadius: 999, flexShrink: 0 }}>{rule.decision}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
