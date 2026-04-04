'use client';
import { useState, useEffect } from 'react';

type NavItem =
  | { id: string; label: string; icon: string; isSub?: boolean }
  | { divider: string };

const NAV: NavItem[] = [
  { id: 'introduction', label: 'Introduction',    icon: '📖' },
  { id: 'sdk',          label: 'TypeScript SDK',  icon: '📦' },
  { id: 'authentication', label: 'Authentication', icon: '🔐' },
  { divider: 'Endpoints' },
  { id: 'agents',        label: 'Agents',          icon: '🤖', isSub: true },
  { id: 'authorization', label: 'Authorization',   icon: '⚡', isSub: true },
  { id: 'audit',         label: 'Audit',           icon: '🔗', isSub: true },
  { id: 'policy',        label: 'Policy',          icon: '⚙️', isSub: true },
  { id: 'keys',          label: 'API Keys',        icon: '🔑', isSub: true },
];

export function DocsSidebar() {
  const [activeId, setActiveId] = useState('introduction');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) setActiveId(visible[0].target.id);
      },
      { rootMargin: '-5% 0px -70% 0px', threshold: 0 },
    );
    document.querySelectorAll('section[id]').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const navContent = (
    <nav className="flex flex-col gap-0.5 py-4">
      {NAV.map((item, i) => {
        if ('divider' in item) {
          return (
            <div key={i} className="px-3 pt-5 pb-1.5">
              <span
                className="text-[10px] font-bold text-[#9498b3] uppercase tracking-[0.12em]"
                style={{ fontFamily: 'IBM Plex Mono, monospace' }}
              >
                {item.divider}
              </span>
            </div>
          );
        }
        const isActive = activeId === item.id;
        return (
          <a
            key={item.id}
            href={`#${item.id}`}
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2.5 rounded-[8px] no-underline transition-all"
            style={{
              padding: `7px 12px 7px ${item.isSub ? '24px' : '12px'}`,
              background: isActive ? '#ebf0ff' : 'transparent',
              borderLeft: `2px solid ${isActive ? '#3b6cff' : 'transparent'}`,
              color: isActive ? '#3b6cff' : item.isSub ? '#5c6078' : '#1a1d2e',
              fontWeight: isActive ? 600 : item.isSub ? 400 : 500,
              fontSize: 13,
            }}
          >
            <span className="text-[13px] shrink-0">{item.icon}</span>
            <span>{item.label}</span>
          </a>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Mobile FAB */}
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Open navigation"
        className="md:hidden fixed bottom-5 right-5 z-50 w-12 h-12 rounded-full flex items-center justify-center border-none cursor-pointer"
        style={{
          background: 'linear-gradient(135deg, #3b6cff, #8b5cf6)',
          boxShadow: '0 4px 16px rgba(59,108,255,0.4)',
        }}
      >
        <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
          <path d="M0 1h16M0 6h16M0 11h16" stroke="white" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={[
          'fixed top-0 left-0 z-50 h-full overflow-y-auto flex flex-col shrink-0',
          'w-[260px] bg-white border-r border-[#e2e4ef]',
          'md:sticky md:top-[60px] md:h-[calc(100vh-60px)] md:z-auto md:translate-x-0',
          'md:w-[220px] md:bg-transparent md:border-none',
          'transition-transform duration-300',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        {/* Mobile header */}
        <div className="md:hidden flex items-center justify-between px-4 py-4 border-b border-[#e2e4ef] shrink-0">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-[7px] flex items-center justify-center text-white text-[10px] font-extrabold shrink-0"
              style={{ background: 'linear-gradient(135deg, #3b6cff, #8b5cf6)', fontFamily: 'IBM Plex Mono, monospace' }}
            >
              AG
            </div>
            <span className="font-bold text-[14px] text-[#1a1d2e]">Docs</span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-[#f0f1f7] border-none cursor-pointer text-[#5c6078] text-lg"
          >
            ×
          </button>
        </div>

        {/* Nav */}
        <div className="flex-1 overflow-y-auto px-2">
          {navContent}
        </div>
      </aside>
    </>
  );
}
