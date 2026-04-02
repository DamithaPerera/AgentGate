'use client';
import { useState, useEffect, useCallback } from 'react';

type ApiKey = {
  id: string;
  name: string;
  keyPrefix: string;
  createdAt: string;
  lastUsedAt: string | null;
  isActive: boolean;
};

type NewKeyResult = {
  id: string;
  name: string;
  key: string;
  keyPrefix: string;
};

export function ApiKeys() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKey, setNewKey] = useState<NewKeyResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadKeys = useCallback(async () => {
    try {
      const res = await fetch('/api/keys');
      if (!res.ok) {
        if (res.status === 401) {
          setKeys([]);
          setError('Log in to manage API keys.');
          return;
        }
        throw new Error('Failed to load keys');
      }
      const data = await res.json() as { keys: ApiKey[] };
      setKeys(data.keys ?? []);
      setError(null);
    } catch {
      setError('Failed to load API keys.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadKeys(); }, [loadKeys]);

  const generateKey = async () => {
    if (!newKeyName.trim()) return;
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch('/api/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newKeyName.trim() }),
      });
      if (!res.ok) {
        const data = await res.json() as { error?: string };
        throw new Error(data.error ?? 'Failed to generate key');
      }
      const data = await res.json() as NewKeyResult;
      setNewKey(data);
      setNewKeyName('');
      await loadKeys();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate key');
    } finally {
      setGenerating(false);
    }
  };

  const revokeKey = async (id: string) => {
    try {
      const res = await fetch(`/api/keys/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to revoke key');
      await loadKeys();
    } catch {
      setError('Failed to revoke key.');
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const el = document.createElement('textarea');
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatDate = (iso: string | null) => {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const activeKeys = keys.filter(k => k.isActive);

  return (
    <div
      className="bg-white rounded-[14px] overflow-hidden"
      style={{ border: '1px solid #e2e4ef', boxShadow: '0 1px 3px rgba(0,0,0,.04)' }}
    >
      {/* Panel header */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-[#f0f1f7] border-b border-[#e2e4ef]">
        <div className="flex items-center gap-3">
          <div className="w-[30px] h-[30px] rounded-[8px] bg-[#ebf0ff] flex items-center justify-center text-sm shrink-0">
            🔑
          </div>
          <div>
            <span className="font-semibold text-[14px] text-[#1a1d2e]">API Keys</span>
            <div className="text-[11px] text-[#9498b3] mt-px">For programmatic access to AgentGate APIs</div>
          </div>
        </div>
        <div
          className="flex items-center gap-1.5 rounded-full px-2.5 py-[4px]"
          style={{ background: '#ebf0ff', border: '1px solid #3b6cff33' }}
        >
          <span
            className="text-[10px] font-semibold text-[#3b6cff]"
            style={{ fontFamily: 'var(--font-ibm-plex-mono), IBM Plex Mono, monospace' }}
          >
            {activeKeys.length} active
          </span>
        </div>
      </div>

      <div className="px-5 py-5 flex flex-col gap-5">

        {/* Not logged in state */}
        {error === 'Log in to manage API keys.' && (
          <div className="flex flex-col items-center gap-3 py-8 rounded-[12px] bg-[#f6f7fb] border border-dashed border-[#e2e4ef]">
            <div className="w-10 h-10 rounded-full bg-[#ebf0ff] flex items-center justify-center text-lg">🔑</div>
            <div className="text-center">
              <div className="text-[13px] font-semibold text-[#1a1d2e] mb-1">Log in to manage API keys</div>
              <div className="text-[12px] text-[#9498b3]">You need an account to generate keys for programmatic access.</div>
            </div>
            <a
              href="/auth/login?returnTo=/dashboard"
              className="px-4 py-2 rounded-[10px] text-[13px] font-semibold text-white no-underline"
              style={{ background: 'linear-gradient(135deg, #3b6cff, #6b8fff)', boxShadow: '0 2px 8px rgba(59,108,255,0.28)' }}
            >
              Log in to continue
            </a>
          </div>
        )}

        {/* Other errors */}
        {error && error !== 'Log in to manage API keys.' && (
          <div
            className="rounded-[10px] px-4 py-3 text-[13px] font-medium"
            style={{ background: '#fef2f2', color: '#ef4444', border: '1px solid #ef444420' }}
          >
            {error}
          </div>
        )}

        {/* New key revealed — show ONCE */}
        {newKey && (
          <div
            className="rounded-[12px] p-4 flex flex-col gap-3"
            style={{ background: '#f0fdf4', border: '1px solid #12b76a33' }}
          >
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-bold text-[#12b76a]">Key generated!</span>
              <span
                className="text-[11px] font-semibold px-2 py-[2px] rounded-full"
                style={{ background: '#fef9c3', color: '#a16207', border: '1px solid #fde04733' }}
              >
                Save this key — it will not be shown again
              </span>
            </div>
            <div className="flex items-center gap-2">
              <code
                className="flex-1 text-[12px] px-3 py-2 rounded-[8px] overflow-x-auto select-all"
                style={{
                  background: '#1a1d2e',
                  color: '#a5f3b0',
                  fontFamily: 'var(--font-ibm-plex-mono), IBM Plex Mono, monospace',
                  border: '1px solid #2a2f45',
                }}
              >
                {newKey.key}
              </code>
              <button
                onClick={() => copyToClipboard(newKey.key)}
                className="shrink-0 px-3 py-2 rounded-[8px] text-[12px] font-semibold transition-all cursor-pointer"
                style={{
                  background: copied ? '#12b76a' : '#ebf0ff',
                  color: copied ? '#fff' : '#3b6cff',
                  border: copied ? '1px solid #12b76a' : '1px solid #3b6cff33',
                }}
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <button
              onClick={() => setNewKey(null)}
              className="self-end text-[11px] text-[#9498b3] underline cursor-pointer bg-transparent border-none"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Generate form + table — only for logged-in users */}
        {error !== 'Log in to manage API keys.' && <>
        <div className="flex flex-col gap-3">
          <span className="text-[12px] font-semibold text-[#1a1d2e]">Generate New Key</span>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newKeyName}
              onChange={e => setNewKeyName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && generateKey()}
              placeholder='e.g. "Production Agent" or "CI Pipeline"'
              className="flex-1 text-[13px] rounded-[10px] px-4 py-[9px] outline-none transition-all"
              style={{
                background: '#f6f7fb',
                border: '1px solid #e2e4ef',
                color: '#1a1d2e',
                fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif',
              }}
            />
            <button
              onClick={generateKey}
              disabled={generating || !newKeyName.trim()}
              className="shrink-0 px-4 py-[9px] rounded-[10px] text-[13px] font-semibold text-white border-none transition-all cursor-pointer"
              style={{
                background: generating || !newKeyName.trim()
                  ? 'linear-gradient(135deg, #5c6078, #9498b3)'
                  : 'linear-gradient(135deg, #3b6cff, #6b8fff)',
                boxShadow: generating || !newKeyName.trim() ? 'none' : '0 2px 8px rgba(59,108,255,0.28)',
                cursor: generating || !newKeyName.trim() ? 'not-allowed' : 'pointer',
              }}
            >
              {generating ? 'Generating…' : 'Generate Key'}
            </button>
          </div>
        </div>

        {/* Keys table */}
        {loading ? (
          <div className="text-[13px] text-[#9498b3] py-4 text-center">Loading keys…</div>
        ) : keys.length === 0 ? (
          <div
            className="text-[13px] text-[#9498b3] py-6 text-center rounded-[10px]"
            style={{ background: '#f6f7fb', border: '1px dashed #e2e4ef' }}
          >
            No API keys yet. Generate one above to get programmatic access.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-[10px]" style={{ border: '1px solid #e2e4ef' }}>
            <table className="w-full border-collapse text-[13px]">
              <thead>
                <tr style={{ background: '#f6f7fb', borderBottom: '1px solid #e2e4ef' }}>
                  <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-[#9498b3] uppercase tracking-wider"
                    style={{ fontFamily: 'var(--font-ibm-plex-mono), IBM Plex Mono, monospace' }}>
                    Name
                  </th>
                  <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-[#9498b3] uppercase tracking-wider"
                    style={{ fontFamily: 'var(--font-ibm-plex-mono), IBM Plex Mono, monospace' }}>
                    Key
                  </th>
                  <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-[#9498b3] uppercase tracking-wider"
                    style={{ fontFamily: 'var(--font-ibm-plex-mono), IBM Plex Mono, monospace' }}>
                    Created
                  </th>
                  <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-[#9498b3] uppercase tracking-wider"
                    style={{ fontFamily: 'var(--font-ibm-plex-mono), IBM Plex Mono, monospace' }}>
                    Last Used
                  </th>
                  <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-[#9498b3] uppercase tracking-wider"
                    style={{ fontFamily: 'var(--font-ibm-plex-mono), IBM Plex Mono, monospace' }}>
                    Status
                  </th>
                  <th className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {keys.map((key, i) => (
                  <tr
                    key={key.id}
                    style={{
                      borderBottom: i < keys.length - 1 ? '1px solid #e2e4ef' : 'none',
                      background: key.isActive ? 'transparent' : '#fafafa',
                    }}
                  >
                    <td className="px-4 py-3 font-medium text-[#1a1d2e]">{key.name}</td>
                    <td className="px-4 py-3">
                      <code
                        className="text-[11px] px-2 py-[3px] rounded-[6px]"
                        style={{
                          background: '#f0f1f7',
                          color: '#5c6078',
                          fontFamily: 'var(--font-ibm-plex-mono), IBM Plex Mono, monospace',
                        }}
                      >
                        {key.keyPrefix}
                      </code>
                    </td>
                    <td className="px-4 py-3 text-[#9498b3]">{formatDate(key.createdAt)}</td>
                    <td className="px-4 py-3 text-[#9498b3]">{formatDate(key.lastUsedAt)}</td>
                    <td className="px-4 py-3">
                      <span
                        className="text-[11px] font-semibold px-2 py-[3px] rounded-full"
                        style={key.isActive
                          ? { background: '#e7faf0', color: '#12b76a', border: '1px solid #12b76a33' }
                          : { background: '#fef2f2', color: '#ef4444', border: '1px solid #ef444420' }
                        }
                      >
                        {key.isActive ? 'Active' : 'Revoked'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {key.isActive && (
                        <button
                          onClick={() => revokeKey(key.id)}
                          className="text-[11px] px-2.5 py-[5px] rounded-[7px] font-semibold cursor-pointer transition-colors border"
                          style={{
                            background: '#fef2f2',
                            color: '#ef4444',
                            borderColor: '#ef444420',
                          }}
                        >
                          Revoke
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Usage hint */}
        <div
          className="rounded-[10px] px-4 py-3 text-[12px]"
          style={{ background: '#f6f7fb', border: '1px solid #e2e4ef', color: '#9498b3' }}
        >
          <span className="font-semibold text-[#5c6078]">Usage: </span>
          <code style={{ fontFamily: 'var(--font-ibm-plex-mono), IBM Plex Mono, monospace' }}>
            Authorization: Bearer ag_live_...
          </code>
          {' — '}
          <a href="/docs" className="text-[#3b6cff] no-underline hover:underline">View full API docs</a>
        </div>
        </>}

      </div>
    </div>
  );
}
