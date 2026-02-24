/**
 * @file kling.ts
 * @description Kling AI adapter — video generation with motion and camera parameters
 * @author Charley Scholz, ELEV8
 * @coauthor Claude 4.6 Opus, Claude Code (coding assistant), Cursor (IDE)
 * @created 2026-02-23
 * @updated 2026-02-23
 */

import type { PlatformAdapter, PresetSelection } from '../types';
import { resolvePresetFragments, resolveAspectRatio } from './utils';

const SUPPORTED_ASPECT_RATIOS = ['16:9', '9:16', '1:1'];

export const klingAdapter: PlatformAdapter = {
  id: 'kling',
  name: 'Kling',
  description: 'AI video generation with text-to-video, motion control, camera parameters, and duration settings.',
  type: 'video',
  supportedAspectRatios: SUPPORTED_ASPECT_RATIOS,

  formatPrompt(basePrompt: string, presets: PresetSelection): string {
    const fragments = resolvePresetFragments(presets);
    const combined = [basePrompt, ...fragments].filter(Boolean).join(', ');

    return [
      `Scene: ${combined}`,
      `Motion: Fluid natural movement, smooth transitions`,
      `Camera: Cinematic camera work with gradual panning`,
    ].join('\n');
  },

  buildParameters(presets: PresetSelection): Record<string, unknown> {
    const ar = resolveAspectRatio(presets, SUPPORTED_ASPECT_RATIOS);

    return {
      aspect_ratio: ar ?? '16:9',
      duration: '5s',
      mode: 'standard',
      creativity: 0.5,
      camera_control: 'auto',
    };
  },
};
