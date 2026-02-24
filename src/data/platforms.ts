/**
 * @file platforms.ts
 * @description Platform definitions for supported AI generation tools
 * @author Charley Scholz, ELEV8
 * @coauthor Claude 4.6 Opus, Claude Code (coding assistant), Cursor (IDE)
 * @created 2026-02-23
 * @updated 2026-02-23
 */

import type { Platform } from '@/lib/types';

export const PLATFORMS: Platform[] = [
  { id: 'midjourney', name: 'Midjourney', type: 'image', description: 'Premium AI image generation' },
  { id: 'stable-diffusion', name: 'Stable Diffusion', type: 'image', description: 'Open-source image generation' },
  { id: 'runway', name: 'Runway', type: 'video', description: 'AI video generation and editing' },
  { id: 'kling', name: 'Kling', type: 'video', description: 'Advanced AI video synthesis' },
  { id: 'firefly', name: 'Adobe Firefly', type: 'image', description: 'Adobe\'s generative AI' },
  { id: 'veo3', name: 'Google Veo 3', type: 'video', description: 'Google\'s video generation model' },
  { id: 'nano-banana', name: 'Nano Banana', type: 'both', description: 'Image generation + editing suite' },
  { id: 'grok', name: 'Grok Aurora', type: 'image', description: 'xAI\'s image generation model' },
];
