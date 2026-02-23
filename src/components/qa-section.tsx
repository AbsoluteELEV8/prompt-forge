/**
 * @file qa-section.tsx
 * @description Follow-up Q&A section for clarifying vague prompts
 * @author Charley Scholz, JLAI
 * @coauthor Claude Opus 4.5, Claude Code (coding assistant), Cursor (IDE)
 * @created 2026-02-23
 * @updated 2026-02-23
 */

'use client';

import { useState, useCallback } from 'react';

import { MessageCircleQuestion, ChevronDown, Send, Loader2 } from 'lucide-react';

import { usePromptStore } from '@/store/prompt-store';
import { cn } from '@/lib/utils';

export function QASection(): React.ReactNode {
  const { questions, answers, setAnswer, applyAnswers, isRefining } = usePromptStore();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleApply = useCallback(() => {
    void applyAnswers();
  }, [applyAnswers]);

  const answeredCount = Object.values(answers).filter((a) => a.trim().length > 0).length;
  const allAnswered = answeredCount === questions.length;

  if (questions.length === 0) return null;

  return (
    <section className="forge-card animate-slide-up overflow-hidden" aria-label="Clarifying questions">
      {/* Header */}
      <button
        type="button"
        onClick={() => setIsCollapsed((prev) => !prev)}
        className="flex w-full items-center justify-between px-5 py-3 text-left transition-colors duration-150 hover:bg-forge-slate-700/10"
        aria-expanded={!isCollapsed}
      >
        <div className="flex items-center gap-2">
          <MessageCircleQuestion className="h-4 w-4 text-forge-amber-400" />
          <h3 className="text-sm font-semibold text-forge-slate-200">
            Clarifying Questions
          </h3>
          <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-forge-amber-500/20 px-1.5 text-[10px] font-bold text-forge-amber-400">
            {answeredCount}/{questions.length}
          </span>
        </div>
        <ChevronDown
          className={cn(
            'h-4 w-4 text-forge-slate-500 transition-transform duration-200',
            isCollapsed && '-rotate-90',
          )}
        />
      </button>

      {/* Body */}
      {!isCollapsed && (
        <div className="animate-slide-down border-t border-forge-slate-700/50 px-5 py-4">
          <p className="mb-4 text-xs text-forge-slate-500">
            Your prompt could use more detail. Answer these questions to get a better result.
          </p>

          <div className="flex flex-col gap-4">
            {questions.map((question, index) => (
              <div key={question.id} className="flex flex-col gap-1.5">
                <label
                  htmlFor={`qa-${question.id}`}
                  className="text-sm font-medium text-forge-slate-300"
                >
                  <span className="mr-1.5 text-forge-amber-500">{index + 1}.</span>
                  {question.text}
                </label>
                <input
                  id={`qa-${question.id}`}
                  type="text"
                  value={answers[question.id] ?? ''}
                  onChange={(e) => setAnswer(question.id, e.target.value)}
                  placeholder="Type your answer..."
                  className="forge-input text-sm"
                />
              </div>
            ))}
          </div>

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={handleApply}
              disabled={isRefining || !allAnswered}
              className={cn(
                'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200',
                allAnswered
                  ? 'bg-forge-amber-500/15 text-forge-amber-300 hover:bg-forge-amber-500/25'
                  : 'cursor-not-allowed bg-forge-slate-700/30 text-forge-slate-600',
              )}
            >
              {isRefining ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Refining...
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  Apply Answers & Re-forge
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
