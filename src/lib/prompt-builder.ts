/**
 * @file prompt-builder.ts
 * @description Prompt assembly layer — combines analysis, presets, and platform formatting into a final prompt
 * @author Charley Scholz, ELEV8
 * @coauthor Claude 4.6 Opus, Claude Code (coding assistant), Cursor (IDE)
 * @created 2026-02-23
 * @updated 2026-02-23
 */

import type { PromptAnalysis, PresetSelection, PlatformId } from './types';
import { getAdapter } from './platform-adapters';

/**
 * Builds a base prompt string from the PromptAnalysis before handing it
 * to the platform adapter for final formatting.
 */
function buildBasePrompt(analysis: PromptAnalysis): string {
  const parts: string[] = [];

  if (analysis.subject && analysis.subject !== 'unspecified') {
    parts.push(analysis.subject);
  }

  if (analysis.intent && analysis.intent !== analysis.subject) {
    parts.push(analysis.intent);
  }

  if (analysis.style && analysis.style !== 'unspecified') {
    parts.push(analysis.style);
  }

  if (analysis.mood && analysis.mood !== 'unspecified') {
    parts.push(`${analysis.mood} mood`);
  }

  for (const detail of analysis.technicalDetails) {
    if (detail) parts.push(detail);
  }

  return parts.filter(Boolean).join(', ');
}

/**
 * Assembles a complete prompt by combining the analysis with selected presets,
 * then formatting through the target platform's adapter.
 */
export function buildPrompt(
  analysis: PromptAnalysis,
  presets: PresetSelection,
  platform: PlatformId,
): string {
  const basePrompt = buildBasePrompt(analysis);
  const adapter = getAdapter(platform);
  return adapter.formatPrompt(basePrompt, presets);
}
