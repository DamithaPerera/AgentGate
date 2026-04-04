'use client';
import { useState } from 'react';
import Link from 'next/link';

const NAV_LINKS = [
  { label: 'Docs',   href: '/docs' },
  { label: 'GitHub', href: 'https://github.com/DamithaPerera/AgentGate', external: true },
];

export function LandingNav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <nav style={{
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #E2E8F0',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        <div style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '0 24px',
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{
              width: 36, height: 36, borderRadius: 8,
              background: 'linear-gradient(135deg, #3b6cff, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 800, fontSize: 14,
              boxShadow: '0 2px 8px rgba(59,108,255,0.28)',
              flexShrink: 0,
            }}>AG</div>
            <span style={{ fontWeight: 700, fontSize: 18, color: '#0F172A' }}>AgentGate</span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex" style={{ alignItems: 'center', gap: 8 }}>
            {NAV_LINKS.map(l =>
              l.external
                ? <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" style={{ padding: '8px 16px', borderRadius: 8, color: '#2D3748', fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>{l.label}</a>
                : <Link key={l.label} href={l.href} style={{ padding: '8px 16px', borderRadius: 8, color: '#2D3748', fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>{l.label}</Link>
            )}
            <Link href="/auth/login?returnTo=/dashboard" style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #E2E8F0', color: '#2D3748', fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>
              Log in
            </Link>
            <Link href="/dashboard" style={{ padding: '8px 20px', borderRadius: 8, background: 'linear-gradient(135deg, #3b6cff, #8b5cf6)', color: '#fff', fontWeight: 600, fontSize: 14, textDecoration: 'none', boxShadow: '0 2px 12px rgba(59,108,255,0.35)' }}>
              Open Dashboard
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="flex md:hidden"
            onClick={() => setOpen(o => !o)}
            aria-label="Toggle menu"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, borderRadius: 8, color: '#0F172A' }}
          >
            {open ? (
              /* X icon */
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            ) : (
              /* Hamburger icon */
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            )}
          </button>
        </div>

        {/* Mobile drawer */}
        {open && (
          <div className="flex md:hidden" style={{
            flexDirection: 'column',
            borderTop: '1px solid #E2E8F0',
            background: 'rgba(255,255,255,0.98)',
            padding: '12px 24px 20px',
            gap: 4,
          }}>
            {NAV_LINKS.map(l =>
              l.external
                ? <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)} style={{ padding: '12px 0', color: '#2D3748', fontWeight: 600, fontSize: 15, textDecoration: 'none', borderBottom: '1px solid #F1F5F9', display: 'block' }}>{l.label}</a>
                : <Link key={l.label} href={l.href} onClick={() => setOpen(false)} style={{ padding: '12px 0', color: '#2D3748', fontWeight: 600, fontSize: 15, textDecoration: 'none', borderBottom: '1px solid #F1F5F9', display: 'block' }}>{l.label}</Link>
            )}
            <Link href="/auth/login?returnTo=/dashboard" onClick={() => setOpen(false)} style={{ padding: '12px 0', color: '#2D3748', fontWeight: 600, fontSize: 15, textDecoration: 'none', borderBottom: '1px solid #F1F5F9', display: 'block' }}>
              Log in
            </Link>
            <Link href="/dashboard" onClick={() => setOpen(false)} style={{ marginTop: 12, padding: '13px 0', borderRadius: 10, background: 'linear-gradient(135deg, #3b6cff, #8b5cf6)', color: '#fff', fontWeight: 700, fontSize: 15, textDecoration: 'none', textAlign: 'center', display: 'block', boxShadow: '0 2px 12px rgba(59,108,255,0.35)' }}>
              Open Dashboard →
            </Link>
          </div>
        )}
      </nav>

      {/* Backdrop to close on tap-outside */}
      {open && (
        <div
          className="flex md:hidden"
          onClick={() => setOpen(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 40 }}
        />
      )}
    </>
  );
}
