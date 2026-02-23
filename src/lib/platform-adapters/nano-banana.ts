/**
 * @file nano-banana.ts
 * @description Nano Banana adapter — image generation/editing with inpainting, outpainting, and conversational refinement
 * @author Charley Scholz, JLAI
 * @coauthor Claude Opus 4.5, Claude Code (coding assistant), Cursor (IDE)
 * @created 2026-02-23
 * @updated 2026-02-23
 */

import type { PlatformAdapter, PresetSelection } from '../types';
import { resolvePresetFragments, resolveAspectRatio } from './utils';

const SUPPORTED_ASPECT_RATIOS = ['1:1', '16:9', '9:16', '4:3', '3:4', '4:5', '3:2'];

type NanoBananaModel = 'v1-standard' | 'pro-v2';

interface NanoBananaParameters {
  aspect_ratio: string;
  model: NanoBananaModel;
  resolution: string;
  mode: 'generate' | 'inpaint' | 'outpaint' | 'background-replace' | 'style-transfer';
  style_reference: string | null;
  conversational_refinement: boolean;
}

export const nanoBananaAdapter: PlatformAdapter = {
  id: 'nano-banana',
  name: 'Nano Banana',
  description: 'Image generation and editing with V1 (standard) and Pro V2 (Gemini 3 PRO, 2K). Supports mask-free inpainting, outpainting, background replacement, and conversational refinement.',
  type: 'image',
  supportedAspectRatios: SUPPORTED_ASPECT_RATIOS,

  formatPrompt(basePrompt: string, presets: PresetSelection): string {
    const fragments = resolvePresetFragments(presets);
    return [basePrompt, ...fragments].filter(Boolean).join('. ');
  },

  buildParameters(presets: PresetSelection): Record<string, unknown> {
    const ar = resolveAspectRatio(presets, SUPPORTED_ASPECT_RATIOS);

    const params: NanoBananaParameters = {
      aspect_ratio: ar ?? '1:1',
      model: 'pro-v2',
      resolution: '2048x2048',
      mode: 'generate',
      style_reference: null,
      conversational_refinement: true,
    };

    return params as unknown as Record<string, unknown>;
  },
};
