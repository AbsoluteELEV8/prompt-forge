/**
 * @file grok.ts
 * @description Grok Aurora adapter (PLACEHOLDER) — basic natural language prompt format
 * @author Charley Scholz, ELEV8
 * @coauthor Claude 4.6 Opus, Claude Code (coding assistant), Cursor (IDE)
 * @created 2026-02-23
 * @updated 2026-02-23
 */

import type { PlatformAdapter, PresetSelection } from '../types';
import { resolvePresetFragments, resolveAspectRatio } from './utils';

// TODO: Expand supported ratios once Grok Aurora API documentation is available
const SUPPORTED_ASPECT_RATIOS = ['3:2', '2:3', '1:1'];

export const grokAdapter: PlatformAdapter = {
  id: 'grok',
  name: 'Grok Aurora',
  description: 'xAI\'s Grok-powered image generation with photorealistic rendering. (Placeholder — API access pending)',
  type: 'image',
  supportedAspectRatios: SUPPORTED_ASPECT_RATIOS,

  // TODO: Update formatting when official Grok Aurora prompt guidelines are published
  formatPrompt(basePrompt: string, presets: PresetSelection): string {
    const fragments = resolvePresetFragments(presets);
    return [basePrompt, ...fragments].filter(Boolean).join(', ');
  },

  // TODO: Add photorealistic rendering strength and other Grok-specific parameters
  // when API access becomes available
  buildParameters(presets: PresetSelection): Record<string, unknown> {
    const ar = resolveAspectRatio(presets, SUPPORTED_ASPECT_RATIOS);

    return {
      aspect_ratio: ar ?? '3:2',
      photorealistic_strength: 'high',
      // TODO: Add model version, quality settings, and other parameters once available
    };
  },
};
