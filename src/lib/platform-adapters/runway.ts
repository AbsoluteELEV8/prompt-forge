/**
 * @file runway.ts
 * @description Runway Gen-3 Alpha adapter — text-to-video with motion and camera controls
 * @author Charley Scholz, JLAI
 * @coauthor Claude Opus 4.5, Claude Code (coding assistant), Cursor (IDE)
 * @created 2026-02-23
 * @updated 2026-02-23
 */

import type { PlatformAdapter, PresetSelection } from '../types';
import { resolvePresetFragments, resolveAspectRatio } from './utils';

const SUPPORTED_ASPECT_RATIOS = ['16:9', '9:16', '1:1', '2.39:1'];

export const runwayAdapter: PlatformAdapter = {
  id: 'runway',
  name: 'Runway',
  description: 'AI video generation with text-to-video, motion descriptions, camera movements, and configurable duration.',
  type: 'video',
  supportedAspectRatios: SUPPORTED_ASPECT_RATIOS,

  formatPrompt(basePrompt: string, presets: PresetSelection): string {
    const fragments = resolvePresetFragments(presets);
    const visualDescription = [basePrompt, ...fragments].filter(Boolean).join(', ');

    const lines = [
      `[Visual] ${visualDescription}`,
      `[Motion] Smooth, cinematic motion with natural movement`,
      `[Camera] Slow dolly forward with subtle parallax`,
    ];

    return lines.join('\n');
  },

  buildParameters(presets: PresetSelection): Record<string, unknown> {
    const ar = resolveAspectRatio(presets, SUPPORTED_ASPECT_RATIOS);

    return {
      aspect_ratio: ar ?? '16:9',
      duration: '10s',
      motion_intensity: 'medium',
      interpolation: true,
    };
  },
};
