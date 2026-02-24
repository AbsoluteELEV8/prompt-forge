/**
 * @file utils.ts
 * @description Utility functions for PromptForge
 * @author Charley Scholz, ELEV8
 * @coauthor Claude 4.6 Opus, Claude Code (coding assistant), Cursor (IDE)
 * @created 2026-02-23
 * @updated 2026-02-23
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import type { PlatformId } from '@/lib/types';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      return true;
    } catch {
      return false;
    } finally {
      document.body.removeChild(textarea);
    }
  }
}

const PLATFORM_DISPLAY_NAMES: Record<PlatformId, string> = {
  midjourney: 'Midjourney',
  'stable-diffusion': 'Stable Diffusion',
  runway: 'Runway',
  kling: 'Kling',
  firefly: 'Adobe Firefly',
  veo3: 'Google Veo 3',
  'nano-banana': 'Nano Banana',
  grok: 'Grok Aurora',
};

export function formatPlatformName(id: PlatformId): string {
  return PLATFORM_DISPLAY_NAMES[id];
}
