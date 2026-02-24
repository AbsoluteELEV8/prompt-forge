/**
 * @file midjourney.ts
 * @description Midjourney platform adapter — formats prompts with MJ v6.1 syntax
 * @author Charley Scholz, ELEV8
 * @coauthor Claude 4.6 Opus, Claude Code (coding assistant), Cursor (IDE)
 * @created 2026-02-23
 * @updated 2026-02-23
 */

import type { PlatformAdapter, PresetSelection } from '../types';
import { resolvePresetFragments, resolveAspectRatio } from './utils';

const SUPPORTED_ASPECT_RATIOS = [
  '1:1', '16:9', '9:16', '4:3', '3:4', '2:3', '3:2',
  '4:5', '5:4', '7:4', '4:7', '21:9', '2.39:1',
];

export const midjourneyAdapter: PlatformAdapter = {
  id: 'midjourney',
  name: 'Midjourney',
  description: 'AI image generation via Discord or the Midjourney web app. Uses --ar, --v, --s, --c, --w parameters.',
  type: 'image',
  supportedAspectRatios: SUPPORTED_ASPECT_RATIOS,

  formatPrompt(basePrompt: string, presets: PresetSelection): string {
    const fragments = resolvePresetFragments(presets);
    const params = this.buildParameters(presets);

    const promptParts = [basePrompt, ...fragments].filter(Boolean);
    let prompt = promptParts.join(', ');

    const paramSuffix = Object.entries(params)
      .map(([key, val]) => `--${key} ${val}`)
      .join(' ');

    if (paramSuffix) {
      prompt = `${prompt} ${paramSuffix}`;
    }

    return prompt;
  },

  buildParameters(presets: PresetSelection): Record<string, unknown> {
    const params: Record<string, unknown> = {
      v: '6.1',
    };

    const ar = resolveAspectRatio(presets, SUPPORTED_ASPECT_RATIOS);
    if (ar) {
      params.ar = ar;
    }

    return params;
  },
};
