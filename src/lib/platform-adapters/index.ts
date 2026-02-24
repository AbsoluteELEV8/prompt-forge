/**
 * @file index.ts
 * @description Platform adapter registry — exports all adapters keyed by PlatformId
 * @author Charley Scholz, ELEV8
 * @coauthor Claude 4.6 Opus, Claude Code (coding assistant), Cursor (IDE)
 * @created 2026-02-23
 * @updated 2026-02-23
 */

import type { PlatformAdapter, PlatformId } from '../types';

import { midjourneyAdapter } from './midjourney';
import { stableDiffusionAdapter } from './stable-diffusion';
import { runwayAdapter } from './runway';
import { klingAdapter } from './kling';
import { fireflyAdapter } from './firefly';
import { veo3Adapter } from './veo3';
import { nanoBananaAdapter } from './nano-banana';
import { grokAdapter } from './grok';

const adapterMap: Record<PlatformId, PlatformAdapter> = {
  'midjourney': midjourneyAdapter,
  'stable-diffusion': stableDiffusionAdapter,
  'runway': runwayAdapter,
  'kling': klingAdapter,
  'firefly': fireflyAdapter,
  'veo3': veo3Adapter,
  'nano-banana': nanoBananaAdapter,
  'grok': grokAdapter,
};

export function getAdapter(platform: PlatformId): PlatformAdapter {
  const adapter = adapterMap[platform];
  if (!adapter) {
    throw new Error(`Unknown platform: ${platform}`);
  }
  return adapter;
}

export function getAllAdapters(): PlatformAdapter[] {
  return Object.values(adapterMap);
}

export { adapterMap };
