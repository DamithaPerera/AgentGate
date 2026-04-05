import type { Metadata } from 'next';
import { DM_Sans, IBM_Plex_Mono } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-dm-sans',
  display: 'swap',
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-ibm-plex-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'AgentGate — Authorization Middleware for AI Agents',
  description:
    'The missing authorization layer for AI agents. Protocol-level security that gives every agent a cryptographic identity, evaluates every action against policies, and produces a tamper-evident audit trail.',
  keywords: ['AI agents', 'authorization', 'Auth0', 'Token Vault', 'CIBA', 'security'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${dmSans.variable} ${ibmPlexMono.variable}`}>
      <body
        className="min-h-screen antialiased"
        style={{ fontFamily: 'var(--font-dm-sans), DM Sans, -apple-system, sans-serif' }}
      >
        {children}
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
