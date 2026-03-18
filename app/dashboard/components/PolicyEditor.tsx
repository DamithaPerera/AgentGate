'use client';
import { useState } from 'react';
import type { PolicyRule } from '@/lib/types';

interface Props {
  rules: PolicyRule[];
  onRulesChange: (rules: PolicyRule[]) => void;
}

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

  const decisionColor: Record<string, string> = {
    ALLOW: 'text-emerald-400',
    ESCALATE: 'text-amber-400',
    DENY: 'text-red-400',
  };

  return (
    <div className="space-y-4">
      {/* Natural language input */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder='e.g. "Agents can read Gmail but cannot send to external addresses"'
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleCompile()}
          className="flex-1 bg-[#0a1520] border border-[#1e3a5f] rounded-lg px-3 py-2 text-sm text-slate-300 placeholder-slate-600 focus:outline-none focus:border-teal-700"
        />
        <button
          onClick={handleCompile}
          disabled={compiling || !text.trim()}
          className="bg-teal-700 hover:bg-teal-600 disabled:opacity-50 text-white text-sm px-4 py-2 rounded-lg transition-colors font-medium"
        >
          {compiling ? '...' : 'Apply'}
        </button>
      </div>

      {message && (
        <div className={`text-sm px-3 py-2 rounded-lg ${message.type === 'success' ? 'bg-emerald-900/30 text-emerald-400' : 'bg-red-900/30 text-red-400'}`}>
          {message.text}
        </div>
      )}

      {/* Active rules */}
      <div className="space-y-1.5 max-h-48 overflow-y-auto">
        {rules.map(rule => (
          <div key={rule.id} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${rule.enabled ? 'bg-[#0d1829]' : 'bg-[#0a1520] opacity-50'}`}>
            <button
              onClick={() => toggleRule(rule.id)}
              className={`w-8 h-4 rounded-full transition-colors relative flex-shrink-0 ${rule.enabled ? 'bg-teal-700' : 'bg-slate-700'}`}
            >
              <span className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-transform ${rule.enabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
            </button>
            <span className="flex-1 text-slate-300 truncate">{rule.name}</span>
            <span className={`text-xs font-medium flex-shrink-0 ${decisionColor[rule.decision] ?? 'text-slate-400'}`}>
              {rule.decision}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
