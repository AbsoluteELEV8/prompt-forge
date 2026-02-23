/**
 * @file platform-selector.tsx
 * @description Horizontal platform badge selector with type indicators
 * @author Charley Scholz, JLAI
 * @coauthor Claude Opus 4.5, Claude Code (coding assistant), Cursor (IDE)
 * @created 2026-02-23
 * @updated 2026-02-23
 */

'use client';

import { useCallback } from 'react';

import { Image, Video, Layers } from 'lucide-react';

import { usePromptStore } from '@/store/prompt-store';
import { PLATFORMS } from '@/data/platforms';
import { cn } from '@/lib/utils';

import type { PlatformId, PlatformType } from '@/lib/types';

function PlatformTypeIcon({ type }: { type: PlatformType }): React.ReactNode {
  switch (type) {
    case 'image':
      return <Image className="h-3 w-3" />;
    case 'video':
      return <Video className="h-3 w-3" />;
    case 'both':
      return <Layers className="h-3 w-3" />;
  }
}

function platformTypeLabel(type: PlatformType): string {
  switch (type) {
    case 'image':
      return 'Image';
    case 'video':
      return 'Video';
    case 'both':
      return 'Both';
  }
}

export function PlatformSelector(): React.ReactNode {
  const { selectedPlatform, setSelectedPlatform } = usePromptStore();

  const handleSelect = useCallback(
    (id: PlatformId) => {
      setSelectedPlatform(id);
    },
    [setSelectedPlatform],
  );

  return (
    <div aria-label="Target platform" role="radiogroup">
      <p className="forge-section-title mb-2">Target Platform</p>
      <div className="flex flex-wrap gap-2">
        {PLATFORMS.map((platform) => {
          const isSelected = selectedPlatform === platform.id;
          return (
            <button
              key={platform.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => handleSelect(platform.id)}
              className={cn(
                'group inline-flex items-center gap-2 rounded-lg border px-3 py-2',
                'text-sm font-medium transition-all duration-200',
                isSelected
                  ? 'border-forge-amber-500/60 bg-forge-amber-500/10 text-forge-amber-300 shadow-forge-glow'
                  : 'border-forge-slate-600/50 bg-forge-slate-800/60 text-forge-slate-400 hover:border-forge-slate-500 hover:bg-forge-slate-700/60 hover:text-forge-slate-200',
              )}
            >
              <span className="flex items-center gap-1.5">
                <span className="text-sm">{platform.name}</span>
              </span>
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                  isSelected
                    ? 'bg-forge-amber-500/20 text-forge-amber-400'
                    : 'bg-forge-slate-700/60 text-forge-slate-500 group-hover:text-forge-slate-400',
                )}
              >
                <PlatformTypeIcon type={platform.type} />
                {platformTypeLabel(platform.type)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
