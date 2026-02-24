/**
 * @file gemini.ts
 * @description Google Gemini (Imagen 3) adapter — natural language prompts for Google's image generation
 * @author Charley Scholz, ELEV8
 * @coauthor Claude 4.6 Opus, Claude Code (coding assistant), Cursor (IDE)
 * @created 2026-02-24
 * @updated 2026-02-24
 */

import type { PlatformAdapter, PresetSelection } from '../types';
import { resolvePresetFragments, resolveAspectRatio } from './utils';

const SUPPORTED_ASPECT_RATIOS = ['1:1', '16:9', '9:16', '3:4', '4:3'];

export const geminiAdapter: PlatformAdapter = {
  id: 'gemini',
  name: 'Google Gemini',
  description: 'Google Imagen 3 via Gemini API. Responds best to descriptive natural language with clear subject, style, and composition details.',
  type: 'image',
  supportedAspectRatios: SUPPORTED_ASPECT_RATIOS,

  formatPrompt(basePrompt: string, presets: PresetSelection): string {
    const fragments = resolvePresetFragments(presets);
    return [basePrompt, ...fragments].filter(Boolean).join(', ');
  },

  buildParameters(presets: PresetSelection): Record<string, unknown> {
    const ar = resolveAspectRatio(presets, SUPPORTED_ASPECT_RATIOS);

    return {
      model: 'imagen-3',
      aspect_ratio: ar ?? '1:1',
      output_format: 'png',
      safety_filter: 'standard',
      person_generation: 'allow',
    };
  },
};
