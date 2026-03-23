'use client';
import { useState } from 'react';
import type { PolicyRule } from '@/lib/types';
import { Badge, Toggle, StatusBanner } from './ui';

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
    <div className="flex flex-col gap-2.5">
      {/* Input row */}
      <div className="flex gap-2">
        <input type="text"
          placeholder='e.g. "Agents can read Gmail but cannot send to external addresses"'
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleCompile()}
          className="flex-1 rounded-lg px-3.5 py-2 text-[13px] border border-[#E2E8F0] bg-white text-[#0F172A] outline-none min-w-0" />
        <button onClick={handleCompile} disabled={compiling || !text.trim()}
          className="px-[18px] py-2 rounded-lg text-white font-semibold text-[13px] border-none cursor-pointer whitespace-nowrap"
          style={{
            background: 'linear-gradient(135deg, #0052CC, #0065FF)',
            opacity: (compiling || !text.trim()) ? 0.5 : 1,
            boxShadow: '0 2px 8px rgba(0,82,204,0.3)',
          }}>
          {compiling ? '…' : 'Apply'}
        </button>
      </div>

      {message && (
        <StatusBanner type={message.type} text={message.text} className="py-1.5 rounded-md" />
      )}

      {/* Rules list */}
      <div className="flex flex-col gap-1 max-h-40 overflow-y-auto">
        {rules.map(rule => {
          const dc = decisionColors[rule.decision] ?? { color: '#64748B', bg: '#F8FAFC' };
          return (
            <div key={rule.id}
              className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg border border-[#E2E8F0] transition-opacity"
              style={{
                background: rule.enabled ? '#fff' : '#F8FAFC',
                opacity: rule.enabled ? 1 : 0.55,
              }}>
              <Toggle enabled={rule.enabled} onChange={() => toggleRule(rule.id)} />
              <span className="flex-1 text-xs text-[#374151] truncate">{rule.name}</span>
              <Badge style={{ color: dc.color, background: dc.bg }} className="font-bold px-2 py-0.5">
                {rule.decision}
              </Badge>
            </div>
          );
        })}
      </div>
    </div>
  );
}
