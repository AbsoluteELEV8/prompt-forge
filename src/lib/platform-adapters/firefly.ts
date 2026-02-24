/**
 * @file firefly.ts
 * @description Adobe Firefly adapter — clean natural language prompts with style and content controls
 * @author Charley Scholz, ELEV8
 * @coauthor Claude 4.6 Opus, Claude Code (coding assistant), Cursor (IDE)
 * @created 2026-02-23
 * @updated 2026-02-23
 */

import type { PlatformAdapter, PresetSelection } from '../types';
import { resolvePresetFragments, resolveAspectRatio } from './utils';

const SUPPORTED_ASPECT_RATIOS = ['1:1', '16:9', '9:16', '4:3', '3:4', '4:5', '3:2'];

export const fireflyAdapter: PlatformAdapter = {
  id: 'firefly',
  name: 'Adobe Firefly',
  description: 'Adobe\'s commercially-safe AI image generator. Clean natural language prompts with style reference support.',
  type: 'image',
  supportedAspectRatios: SUPPORTED_ASPECT_RATIOS,

  formatPrompt(basePrompt: string, presets: PresetSelection): string {
    const fragments = resolvePresetFragments(presets);
    return [basePrompt, ...fragments].filter(Boolean).join('. ');
  },

  buildParameters(presets: PresetSelection): Record<string, unknown> {
    const ar = resolveAspectRatio(presets, SUPPORTED_ASPECT_RATIOS);

    return {
      aspect_ratio: ar ?? '1:1',
      content_type: 'art',
      visual_intensity: 'medium',
      style_strength: 'medium',
      locale: 'en-US',
    };
  },
};
