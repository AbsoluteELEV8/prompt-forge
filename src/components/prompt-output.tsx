/**
 * @file prompt-output.tsx
 * @description Refined prompt output with copy-to-clipboard and parameter display
 * @author Charley Scholz, ELEV8
 * @coauthor Claude 4.6 Opus, Claude Code (coding assistant), Cursor (IDE)
 * @created 2026-02-23
 * @updated 2026-02-23
 */

'use client';

import { useState, useCallback } from 'react';

import { Copy, Check, Wand2, Loader2 } from 'lucide-react';

import { usePromptStore } from '@/store/prompt-store';
import { cn, copyToClipboard, formatPlatformName } from '@/lib/utils';

export function PromptOutput(): React.ReactNode {
  const { refinedPrompt, selectedPlatform, parameters, isRefining } = usePromptStore();
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    if (!refinedPrompt) return;
    const success = await copyToClipboard(refinedPrompt);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [refinedPrompt]);

  if (isRefining) {
    return (
      <section className="forge-card animate-fade-in p-6" aria-label="Prompt output">
        <div className="flex flex-col items-center gap-4 py-8">
          <div className="relative">
            <div className="h-12 w-12 rounded-full border-2 border-forge-amber-500/30" />
            <Loader2 className="absolute inset-0 m-auto h-8 w-8 animate-spin text-forge-amber-500" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-forge-slate-200">Forging your prompt...</p>
            <p className="mt-1 text-xs text-forge-slate-500">
              Applying creative alchemy to your vision
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (!refinedPrompt) {
    return (
      <section className="forge-card animate-fade-in p-6" aria-label="Prompt output">
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <Wand2 className="h-10 w-10 text-forge-slate-600" />
          <div>
            <p className="text-sm font-medium text-forge-slate-400">No forged prompt yet</p>
            <p className="mt-1 text-xs text-forge-slate-600">
              Enter a prompt, select your presets, and hit Forge
            </p>
          </div>
        </div>
      </section>
    );
  }

  const paramEntries = Object.entries(parameters);

  return (
    <section className="forge-card animate-slide-up overflow-hidden" aria-label="Refined prompt">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-forge-slate-700/50 px-5 py-3">
        <div className="flex items-center gap-2">
          <Wand2 className="h-4 w-4 text-forge-amber-400" />
          <h3 className="text-sm font-semibold text-forge-slate-200">Forged Prompt</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-md bg-forge-amber-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-forge-amber-400">
            {formatPlatformName(selectedPlatform)}
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all duration-200',
              copied
                ? 'border-green-500/50 bg-green-500/10 text-green-400'
                : 'border-forge-slate-600/50 bg-forge-slate-800/60 text-forge-slate-300 hover:border-forge-slate-500 hover:text-forge-slate-100',
            )}
            aria-label={copied ? 'Copied to clipboard' : 'Copy prompt to clipboard'}
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                Copy
              </>
            )}
          </button>
        </div>
      </div>

      {/* Prompt Body */}
      <div className="p-5">
        <pre className="whitespace-pre-wrap break-words rounded-lg bg-forge-slate-900/60 p-4 font-mono text-sm leading-relaxed text-forge-slate-100">
          {refinedPrompt}
        </pre>
      </div>

      {/* Parameters */}
      {paramEntries.length > 0 && (
        <div className="border-t border-forge-slate-700/50 px-5 py-3">
          <p className="forge-section-title mb-2">Applied Parameters</p>
          <div className="flex flex-wrap gap-2">
            {paramEntries.map(([key, value]) => (
              <span
                key={key}
                className="inline-flex items-center gap-1 rounded-md bg-forge-slate-700/40 px-2 py-1 text-xs"
              >
                <span className="font-medium text-forge-slate-400">{key}:</span>
                <span className="text-forge-slate-200">{value}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
