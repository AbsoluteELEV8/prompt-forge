/**
 * @file prompt-input.tsx
 * @description Main prompt textarea with character count and auto-resize
 * @author Charley Scholz, JLAI
 * @coauthor Claude Opus 4.5, Claude Code (coding assistant), Cursor (IDE)
 * @created 2026-02-23
 * @updated 2026-02-23
 */

'use client';

import { useCallback, useRef, useEffect } from 'react';

import { Sparkles } from 'lucide-react';

import { usePromptStore } from '@/store/prompt-store';

const MAX_PROMPT_LENGTH = 2000;
const MIN_ROWS = 4;

export function PromptInput(): React.ReactNode {
  const { userPrompt, setUserPrompt } = usePromptStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const autoResize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.max(el.scrollHeight, MIN_ROWS * 24)}px`;
  }, []);

  useEffect(() => {
    autoResize();
  }, [userPrompt, autoResize]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      if (value.length <= MAX_PROMPT_LENGTH) {
        setUserPrompt(value);
      }
    },
    [setUserPrompt],
  );

  const charPercent = Math.round((userPrompt.length / MAX_PROMPT_LENGTH) * 100);

  return (
    <section className="forge-card p-5 animate-fade-in" aria-label="Prompt input">
      <div className="mb-3 flex items-center justify-between">
        <label
          htmlFor="prompt-input"
          className="flex items-center gap-2 text-sm font-semibold text-forge-slate-200"
        >
          <Sparkles className="h-4 w-4 text-forge-amber-400" />
          Your Creative Prompt
        </label>
        <div className="flex items-center gap-2 text-xs text-forge-slate-500">
          <span
            className={
              charPercent > 90
                ? 'text-red-400'
                : charPercent > 70
                  ? 'text-forge-amber-400'
                  : ''
            }
          >
            {userPrompt.length.toLocaleString()}/{MAX_PROMPT_LENGTH.toLocaleString()}
          </span>
          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-forge-slate-700">
            <div
              className="h-full rounded-full bg-forge-amber-500 transition-all duration-300"
              style={{ width: `${Math.min(charPercent, 100)}%` }}
            />
          </div>
        </div>
      </div>

      <textarea
        ref={textareaRef}
        id="prompt-input"
        value={userPrompt}
        onChange={handleChange}
        placeholder="Describe what you want to create... e.g. 'A lone astronaut standing on a red desert planet, looking up at a massive ringed gas giant filling the sky'"
        rows={MIN_ROWS}
        maxLength={MAX_PROMPT_LENGTH}
        className="forge-input w-full resize-none text-base leading-relaxed"
        aria-describedby="prompt-hint"
      />

      <p id="prompt-hint" className="mt-2 text-xs text-forge-slate-500">
        Be as descriptive or as vague as you like — the forge will help refine it.
      </p>
    </section>
  );
}
