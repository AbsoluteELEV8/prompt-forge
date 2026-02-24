/**
 * @file preset-panel.tsx
 * @description Accordion-style preset panel with 8 creative categories
 * @author Charley Scholz, ELEV8
 * @coauthor Claude 4.6 Opus, Claude Code (coding assistant), Cursor (IDE)
 * @created 2026-02-23
 * @updated 2026-02-23
 */

'use client';

import { useState, useCallback } from 'react';

import { ChevronDown, X } from 'lucide-react';

import { usePromptStore } from '@/store/prompt-store';
import { PRESET_CATEGORIES } from '@/data/presets';
import { cn } from '@/lib/utils';

import type { PresetCategoryId } from '@/lib/types';

export function PresetPanel(): React.ReactNode {
  const [expandedCategories, setExpandedCategories] = useState<Set<PresetCategoryId>>(
    new Set<PresetCategoryId>(['aspectRatios', 'lighting']),
  );

  const toggleCategory = useCallback((categoryId: PresetCategoryId) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  }, []);

  return (
    <nav
      className="forge-card flex flex-col overflow-hidden animate-fade-in"
      aria-label="Creative presets"
    >
      <div className="border-b border-forge-slate-700/50 px-4 py-3">
        <h2 className="text-sm font-semibold text-forge-slate-200">Creative Presets</h2>
        <p className="mt-0.5 text-xs text-forge-slate-500">
          Select options to guide your prompt
        </p>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {PRESET_CATEGORIES.map((category) => (
          <CategoryAccordion
            key={category.id}
            categoryId={category.id}
            name={category.name}
            icon={category.icon}
            presets={category.presets}
            isExpanded={expandedCategories.has(category.id)}
            onToggle={toggleCategory}
          />
        ))}
      </div>
    </nav>
  );
}

interface CategoryAccordionProps {
  categoryId: PresetCategoryId;
  name: string;
  icon: string;
  presets: { id: string; label: string; description: string }[];
  isExpanded: boolean;
  onToggle: (id: PresetCategoryId) => void;
}

function CategoryAccordion({
  categoryId,
  name,
  icon,
  presets,
  isExpanded,
  onToggle,
}: CategoryAccordionProps): React.ReactNode {
  const { presetSelections, togglePreset, clearCategoryPresets } = usePromptStore();
  const selectedIds = presetSelections[categoryId];
  const selectedCount = selectedIds.length;

  const handleToggleCategory = useCallback(() => {
    onToggle(categoryId);
  }, [onToggle, categoryId]);

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      clearCategoryPresets(categoryId);
    },
    [clearCategoryPresets, categoryId],
  );

  const handleTogglePreset = useCallback(
    (presetId: string) => {
      togglePreset(categoryId, presetId);
    },
    [togglePreset, categoryId],
  );

  return (
    <div className="border-b border-forge-slate-700/30 last:border-b-0">
      {/* Category Header */}
      <button
        type="button"
        onClick={handleToggleCategory}
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors duration-150 hover:bg-forge-slate-700/20"
        aria-expanded={isExpanded}
        aria-controls={`presets-${categoryId}`}
      >
        <span className="text-base" role="img" aria-hidden="true">
          {icon}
        </span>
        <span className="flex-1 text-sm font-medium text-forge-slate-200">{name}</span>

        {selectedCount > 0 && (
          <span className="flex items-center gap-1">
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-forge-amber-500/20 px-1.5 text-[10px] font-bold text-forge-amber-400">
              {selectedCount}
            </span>
            <button
              type="button"
              onClick={handleClear}
              className="rounded p-0.5 text-forge-slate-500 transition-colors hover:bg-forge-slate-600/50 hover:text-forge-slate-300"
              aria-label={`Clear ${name} selections`}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        )}

        <ChevronDown
          className={cn(
            'h-4 w-4 text-forge-slate-500 transition-transform duration-200',
            isExpanded && 'rotate-180',
          )}
        />
      </button>

      {/* Preset Chips */}
      {isExpanded && (
        <div
          id={`presets-${categoryId}`}
          className="animate-slide-down flex flex-wrap gap-2 px-4 pb-4"
          role="group"
          aria-label={`${name} options`}
        >
          {presets.map((preset) => {
            const isSelected = selectedIds.includes(preset.id);
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleTogglePreset(preset.id)}
                className={cn(
                  'forge-chip',
                  isSelected && 'forge-chip-selected',
                )}
                aria-pressed={isSelected}
                title={preset.description}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
