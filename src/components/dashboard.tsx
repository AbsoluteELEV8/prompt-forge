/**
 * @file dashboard.tsx
 * @description Main dashboard orchestrator — manages layout and forge interaction
 * @author Charley Scholz, JLAI
 * @coauthor Claude Opus 4.5, Claude Code (coding assistant), Cursor (IDE)
 * @created 2026-02-23
 * @updated 2026-02-23
 */

'use client';

import { useCallback } from 'react';

import { Flame, RotateCcw, Loader2 } from 'lucide-react';

import { usePromptStore } from '@/store/prompt-store';
import { cn } from '@/lib/utils';
import { PromptInput } from '@/components/prompt-input';
import { PresetPanel } from '@/components/preset-panel';
import { PlatformSelector } from '@/components/platform-selector';
import { PromptOutput } from '@/components/prompt-output';
import { QASection } from '@/components/qa-section';

export function Dashboard(): React.ReactNode {
  const {
    isRefining,
    error,
    refinedPrompt,
    questions,
    forgePrompt,
    reset,
  } = usePromptStore();

  const handleForge = useCallback(() => {
    void forgePrompt();
  }, [forgePrompt]);

  const handleReset = useCallback(() => {
    reset();
  }, [reset]);

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-forge-slate-700/50 bg-forge-slate-900/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-forge-amber-500 to-forge-amber-600 shadow-lg shadow-forge-amber-500/20">
              <Flame className="h-5 w-5 text-forge-slate-900" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-forge-slate-50">
                PromptForge
              </h1>
              <p className="hidden text-xs text-forge-slate-400 sm:block">
                Creative Prompt Engineering
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 rounded-lg border border-forge-slate-600/50 bg-forge-slate-800/60 px-3 py-2 text-xs font-medium text-forge-slate-300 transition-all duration-200 hover:border-forge-slate-500 hover:bg-forge-slate-700/80 hover:text-forge-slate-100"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          </div>
        </div>
      </header>

      {/* Platform Selector Bar */}
      <div className="border-b border-forge-slate-700/30 bg-forge-slate-900/40">
        <div className="mx-auto max-w-[1600px] px-4 py-3 sm:px-6">
          <PlatformSelector />
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row">
        {/* Left Sidebar — Presets */}
        <aside className="w-full shrink-0 lg:w-80 xl:w-96">
          <PresetPanel />
        </aside>

        {/* Center Content */}
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          {/* Prompt Input */}
          <PromptInput />

          {/* Forge Button + Error */}
          <div className="flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={handleForge}
              disabled={isRefining}
              className={cn(
                'forge-button-primary w-full sm:w-auto',
                isRefining && 'pointer-events-none',
              )}
            >
              {isRefining ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Forging...
                </>
              ) : (
                <>
                  <Flame className="h-4 w-4" />
                  Forge Prompt
                </>
              )}
            </button>

            {error && (
              <p className="animate-fade-in text-center text-sm text-red-400" role="alert">
                {error}
              </p>
            )}
          </div>

          {/* Q&A Section */}
          {questions.length > 0 && <QASection />}

          {/* Output */}
          {(refinedPrompt || isRefining) && <PromptOutput />}
        </div>
      </div>
    </div>
  );
}
