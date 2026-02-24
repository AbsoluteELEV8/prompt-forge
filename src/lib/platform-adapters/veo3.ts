/**
 * @file veo3.ts
 * @description Google Veo 3 adapter — video generation with audio, dialogue, and multi-resolution support
 * @author Charley Scholz, ELEV8
 * @coauthor Claude 4.6 Opus, Claude Code (coding assistant), Cursor (IDE)
 * @created 2026-02-23
 * @updated 2026-02-23
 */

import type { PlatformAdapter, PresetSelection } from '../types';
import { resolvePresetFragments, resolveAspectRatio } from './utils';

const SUPPORTED_ASPECT_RATIOS = ['16:9', '9:16'];

type Veo3Resolution = '720p' | '1080p' | '4K';
type Veo3Duration = '4s' | '6s' | '8s';
type Veo3Mode = 'text-to-video' | 'image-to-video';

interface Veo3Parameters {
  aspect_ratio: string;
  resolution: Veo3Resolution;
  fps: number;
  duration: Veo3Duration;
  mode: Veo3Mode;
  audio_generation: boolean;
  dialogue_enabled: boolean;
  reference_image: string | null;
}

export const veo3Adapter: PlatformAdapter = {
  id: 'veo3',
  name: 'Google Veo 3',
  description: 'Google\'s video generation model supporting 720p–4K, 24fps, audio/dialogue generation, and reference image consistency.',
  type: 'video',
  supportedAspectRatios: SUPPORTED_ASPECT_RATIOS,

  formatPrompt(basePrompt: string, presets: PresetSelection): string {
    const fragments = resolvePresetFragments(presets);
    const visual = [basePrompt, ...fragments].filter(Boolean).join(', ');

    const lines = [
      `[Scene] ${visual}`,
      `[Camera] Cinematic camera movement at 24fps`,
      `[Audio] Ambient sound design matching the visual mood`,
    ];

    return lines.join('\n');
  },

  buildParameters(presets: PresetSelection): Record<string, unknown> {
    const ar = resolveAspectRatio(presets, SUPPORTED_ASPECT_RATIOS);

    const params: Veo3Parameters = {
      aspect_ratio: ar ?? '16:9',
      resolution: '1080p',
      fps: 24,
      duration: '6s',
      mode: 'text-to-video',
      audio_generation: true,
      dialogue_enabled: false,
      reference_image: null,
    };

    return params as unknown as Record<string, unknown>;
  },
};
