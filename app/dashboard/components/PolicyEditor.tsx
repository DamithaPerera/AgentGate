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

  const decisionStyle = (decision: string): { color: string; bg: string; border: string } => {
    if (decision === 'ALLOW')    return { color: '#12b76a', bg: '#e7faf0', border: '#12b76a33' };
    if (decision === 'ESCALATE') return { color: '#f59e0b', bg: '#fefce8', border: '#f59e0b33' };
    if (decision === 'DENY')     return { color: '#ef4444', bg: '#fef2f2', border: '#ef444433' };
    return { color: '#5c6078', bg: '#f0f1f7', border: '#e2e4ef' };
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Input row */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder='e.g. "Agents can read Gmail but cannot send to external addresses"'
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleCompile()}
          className="flex-1 rounded-[10px] px-3.5 py-2 text-[13px] border border-[#e2e4ef] bg-[#f0f1f7] text-[#1a1d2e] outline-none min-w-0 placeholder:text-[#9498b3] focus:border-[#3b6cff] transition-colors"
          onFocus={e => { e.target.style.boxShadow = '0 0 0 3px rgba(59,108,255,0.12)'; }}
          onBlur={e => { e.target.style.boxShadow = 'none'; }}
        />
        <button
          onClick={handleCompile}
          disabled={compiling || !text.trim()}
          className="px-5 py-2 rounded-[10px] text-white font-semibold text-[13px] border-none cursor-pointer whitespace-nowrap transition-opacity"
          style={{
            background: 'linear-gradient(135deg, #3b6cff, #6b8fff)',
            opacity: (compiling || !text.trim()) ? 0.5 : 1,
            boxShadow: '0 2px 8px rgba(59,108,255,0.28)',
          }}
        >
          {compiling ? '…' : 'Apply'}
        </button>
      </div>

      {message && (
        <StatusBanner type={message.type} text={message.text} className="py-1.5" />
      )}

      {/* Rules list */}
      <div className="flex flex-col max-h-40 overflow-y-auto">
        {rules.map((rule, idx) => {
          const ds = decisionStyle(rule.decision);
          const isLast = idx === rules.length - 1;
          return (
            <div
              key={rule.id}
              className="flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-[#eceef5]"
              style={{
                borderBottom: isLast ? 'none' : '1px solid #e2e4ef',
                opacity: rule.enabled ? 1 : 0.5,
              }}
            >
              <Toggle enabled={rule.enabled} onChange={() => toggleRule(rule.id)} />
              <span className="flex-1 text-[12px] text-[#1a1d2e] truncate">{rule.name}</span>
              <Badge
                style={{
                  color: ds.color,
                  background: ds.bg,
                  border: `1px solid ${ds.border}`,
                }}
              >
                {rule.decision}
              </Badge>
            </div>
          );
        })}
      </div>
    </div>
  );
}
