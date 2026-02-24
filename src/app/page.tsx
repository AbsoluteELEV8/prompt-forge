/**
 * @file page.tsx
 * @description Main dashboard page — server component shell for PromptForge
 * @author Charley Scholz, ELEV8
 * @coauthor Claude 4.6 Opus, Claude Code (coding assistant), Cursor (IDE)
 * @created 2026-02-23
 * @updated 2026-02-23
 */

import { Dashboard } from '@/components/dashboard';

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Dashboard />
    </main>
  );
}
