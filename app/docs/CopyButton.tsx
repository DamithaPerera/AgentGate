'use client';
import { useState } from 'react';

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const el = document.createElement('textarea');
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={copy}
      className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-[11px] font-semibold transition-all cursor-pointer border-none"
      style={{
        background: copied ? '#12b76a' : 'rgba(255,255,255,0.1)',
        color: copied ? '#fff' : '#9498b3',
      }}
      title="Copy to clipboard"
    >
      {copied ? (
        <>
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
            <path d="M1.5 5.5L4 8L9.5 2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Copied!
        </>
      ) : (
        <>
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
            <rect x="3.5" y="3.5" width="6" height="7" rx="1" stroke="currentColor" strokeWidth="1.2"/>
            <path d="M2 7.5H1.5A.5.5 0 0 1 1 7V1.5A.5.5 0 0 1 1.5 1H7A.5.5 0 0 1 7.5 1.5V2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
          Copy
        </>
      )}
    </button>
  );
}
