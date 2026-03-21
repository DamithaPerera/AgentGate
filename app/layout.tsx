import type { Metadata } from 'next';
import './globals.css';

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
    <html lang="en" className="dark">
      <body className="min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
