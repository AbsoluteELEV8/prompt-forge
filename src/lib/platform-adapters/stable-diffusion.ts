/**
 * @file stable-diffusion.ts
 * @description Stable Diffusion / ComfyUI adapter — positive/negative prompts with weighting syntax
 * @author Charley Scholz, JLAI
 * @coauthor Claude Opus 4.5, Claude Code (coding assistant), Cursor (IDE)
 * @created 2026-02-23
 * @updated 2026-02-23
 */

import type { PlatformAdapter, PresetSelection } from '../types';
import { resolvePresetFragments, resolveAspectRatio } from './utils';

const SUPPORTED_ASPECT_RATIOS = [
  '1:1', '16:9', '9:16', '4:3', '3:4', '2:3', '3:2',
  '4:5', '5:4', '21:9', '2.39:1',
];

const DEFAULT_NEGATIVE_PROMPT = [
  '(worst quality:1.4)',
  '(low quality:1.4)',
  'blurry',
  'jpeg artifacts',
  'watermark',
  'text',
  'logo',
  'deformed',
  'disfigured',
  'bad anatomy',
  'extra limbs',
].join(', ');

const ASPECT_RATIO_TO_RESOLUTION: Record<string, { width: number; height: number }> = {
  '1:1':    { width: 1024, height: 1024 },
  '16:9':   { width: 1344, height: 768 },
  '9:16':   { width: 768, height: 1344 },
  '4:3':    { width: 1152, height: 896 },
  '3:4':    { width: 896, height: 1152 },
  '2:3':    { width: 832, height: 1216 },
  '3:2':    { width: 1216, height: 832 },
  '4:5':    { width: 896, height: 1088 },
  '5:4':    { width: 1088, height: 896 },
  '21:9':   { width: 1536, height: 640 },
  '2.39:1': { width: 1536, height: 640 },
};

export const stableDiffusionAdapter: PlatformAdapter = {
  id: 'stable-diffusion',
  name: 'Stable Diffusion / ComfyUI',
  description: 'Open-source image generation with positive/negative prompt separation and (word:weight) syntax.',
  type: 'image',
  supportedAspectRatios: SUPPORTED_ASPECT_RATIOS,

  formatPrompt(basePrompt: string, presets: PresetSelection): string {
    const fragments = resolvePresetFragments(presets);

    const positiveSegments = [
      '(masterpiece:1.2)',
      '(best quality:1.2)',
      basePrompt,
      ...fragments,
    ].filter(Boolean);

    const positive = positiveSegments.join(', ');

    return `Positive:\n${positive}\n\nNegative:\n${DEFAULT_NEGATIVE_PROMPT}`;
  },

  buildParameters(presets: PresetSelection): Record<string, unknown> {
    const ar = resolveAspectRatio(presets, SUPPORTED_ASPECT_RATIOS);
    const resolution = ar
      ? ASPECT_RATIO_TO_RESOLUTION[ar] ?? { width: 1024, height: 1024 }
      : { width: 1024, height: 1024 };

    return {
      width: resolution.width,
      height: resolution.height,
      steps: 30,
      cfg_scale: 7.5,
      sampler: 'DPM++ 2M Karras',
    };
  },
};
